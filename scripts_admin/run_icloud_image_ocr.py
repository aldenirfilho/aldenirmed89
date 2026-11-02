#!/usr/bin/env python3
"""Executa OCR Apple Vision local em inventário privado, sem modificar imagens.

O helper Swift recebe uma imagem por processo, permitindo timeout por arquivo.
O cache JSONL é append-only e deve ficar fora do repositório e da pasta fonte.
Uma retomada conserva resultados por caminho relativo, tamanho e mtime ns.
Nenhum texto OCR é impresso no terminal: apenas contagens e estado operacional.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys
import time
import unicodedata

REPO_ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "icloud-image-ocr-v1"
RASTER = frozenset({".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".avif"})
DATALESS_FLAG = getattr(stat, "UF_DATALESS", 0x40000000)
MAX_FILE_BYTES = 64 * 1024 * 1024


def safe_relative_path(value: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value or re.search(r"[\x00-\x1f]", value):
        raise ValueError("Caminho relativo ausente ou inválido no inventário.")
    parts = value.split("/")
    if value.startswith("/") or re.match(r"^[a-zA-Z]:/", value) or any(p in ("", ".", "..") for p in parts):
        raise ValueError("Caminho fora do acervo bloqueado.")
    return unicodedata.normalize("NFC", str(PurePosixPath(value)))


def fingerprint(relative: str, size: int, modified_ns: int) -> str:
    material = json.dumps([unicodedata.normalize("NFC", relative), size, modified_ns], ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def canonical_source(source: Path) -> Path:
    source = Path(source).expanduser().absolute()
    if source.is_symlink() or not source.is_dir():
        raise ValueError("A origem deve ser uma pasta real disponível, sem link simbólico na raiz.")
    return source.resolve(strict=True)


def validate_private_output(output: Path, source: Path, inventory_path: Path | None = None) -> Path:
    output = Path(output).expanduser().absolute()
    resolved = output.resolve(strict=False)
    source = source.resolve(strict=True)
    repo = REPO_ROOT.resolve()
    if output.is_symlink() or resolved == source or source in resolved.parents or resolved == repo or repo in resolved.parents:
        raise ValueError("O cache OCR precisa ficar fora da fonte e do repositório público.")
    if inventory_path is not None and resolved == inventory_path.resolve():
        raise ValueError("O cache OCR não pode sobrescrever o inventário.")
    if output.exists() and not output.is_file():
        raise ValueError("A saída existente não é um arquivo regular.")
    return resolved


def load_inventory(path: Path, source: Path) -> list[dict]:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    rows = payload.get("images")
    if not isinstance(rows, list):
        raise ValueError("Inventário precisa conter a lista images.")
    result, seen = [], set()
    for raw in rows:
        if not isinstance(raw, dict):
            raise ValueError("Cada registro do inventário precisa ser um objeto.")
        relative = safe_relative_path(raw.get("relativePath"))
        if Path(relative).suffix.lower() not in RASTER:
            raise ValueError("Formato não raster no inventário OCR.")
        size, modified_ns = raw.get("size"), raw.get("modifiedNs")
        if type(size) is not int or size <= 0 or type(modified_ns) is not int or modified_ns < 0:
            raise ValueError("Tamanho e modifiedNs precisam ser inteiros válidos.")
        key = fingerprint(relative, size, modified_ns)
        if key in seen:
            continue
        seen.add(key)
        result.append({"id": key, "relativePath": relative, "size": size,
                       "modifiedNs": modified_ns, "dataless": raw.get("dataless") is True})
    return result


def checked_image_path(source: Path, row: dict, *, skip_dataless: bool = False) -> Path:
    current = source
    # lstat de cada componente: links para fora ou para dentro não são percorridos.
    for part in safe_relative_path(row["relativePath"]).split("/"):
        current = current / part
        info = current.lstat()
        if stat.S_ISLNK(info.st_mode):
            raise ValueError("symlink-blocked")
    if not stat.S_ISREG(info.st_mode):
        raise ValueError("not-a-regular-file")
    if info.st_size != row["size"] or info.st_mtime_ns != row["modifiedNs"]:
        raise ValueError("source-metadata-changed")
    if info.st_size > MAX_FILE_BYTES:
        raise ValueError("image-above-64mb")
    if skip_dataless and getattr(info, "st_flags", 0) & DATALESS_FLAG:
        raise ValueError("source-not-local")
    return current


def load_cache(output: Path) -> tuple[dict[str, dict], int]:
    cached, malformed = {}, 0
    if not output.exists():
        return cached, malformed
    with output.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            try:
                row = json.loads(line)
                if row.get("schema") != SCHEMA or not isinstance(row.get("id"), str) or not isinstance(row.get("ok"), bool):
                    raise ValueError("cache row")
                if row["id"] != fingerprint(row["relativePath"], row["size"], row["modifiedNs"]):
                    raise ValueError("cache key")
                cached[row["id"]] = row
            except (json.JSONDecodeError, ValueError, KeyError, TypeError):
                malformed += 1
    return cached, malformed


def run_image(binary: Path, source: Path, row: dict, timeout: float, *, skip_dataless: bool = False) -> dict:
    record = {"schema": SCHEMA, **{k: row[k] for k in ("id", "relativePath", "size", "modifiedNs")},
              "processedAt": datetime.now(timezone.utc).isoformat(), "ok": False, "lines": []}
    started = time.monotonic()
    try:
        path = checked_image_path(source, row, skip_dataless=skip_dataless)
        request = json.dumps({"id": row["id"], "path": str(path)}, ensure_ascii=False) + "\n"
        completed = subprocess.run([str(binary)], input=request, text=True, capture_output=True,
                                   timeout=timeout, check=False)
        if completed.returncode:
            raise ValueError(f"engine-exit-{completed.returncode}")
        engine = None
        for line in completed.stdout.splitlines():
            try:
                candidate = json.loads(line)
                if isinstance(candidate, dict) and candidate.get("id") == row["id"]:
                    engine = candidate
            except json.JSONDecodeError:
                continue
        if engine is None or not isinstance(engine.get("ok"), bool) or not isinstance(engine.get("lines"), list):
            raise ValueError("invalid-engine-response")
        lines = []
        for line in engine["lines"][:1500]:
            if not isinstance(line, dict) or not isinstance(line.get("text"), str):
                continue
            text = line["text"][:2000].strip()
            if not text:
                continue
            values = {key: float(line.get(key, 0)) for key in ("confidence", "x", "y", "width", "height")}
            if not all(math.isfinite(value) for value in values.values()):
                continue
            lines.append({"text": text, **values})
        record.update(ok=engine["ok"], lines=lines, engine=str(engine.get("engine", "apple-vision-local")),
                      revision=engine.get("revision"), languages=engine.get("languages", []))
        if not record["ok"]:
            record["error"] = str(engine.get("error") or "vision-failed")[:200]
    except subprocess.TimeoutExpired:
        record["error"] = "timeout"
    except (OSError, ValueError, TypeError, OverflowError) as error:
        # Apenas classe/código curto; nunca imprimir conteúdo da imagem no terminal.
        record["error"] = str(error)[:200] if isinstance(error, ValueError) else type(error).__name__
    record["durationMs"] = round((time.monotonic() - started) * 1000)
    return record


def process(source: Path, inventory_path: Path, output: Path, binary: Path, *, workers: int = 4,
            timeout: float = 90, retry_errors: bool = False, limit: int | None = None,
            skip_dataless: bool = False, progress_every: int = 10) -> dict:
    source = canonical_source(source)
    output = validate_private_output(output, source, inventory_path)
    binary = Path(binary).expanduser().resolve(strict=True)
    if not binary.is_file() or not os.access(binary, os.X_OK):
        raise ValueError("Binário OCR ausente ou sem permissão de execução.")
    if not 1 <= workers <= 8 or not math.isfinite(timeout) or timeout <= 0:
        raise ValueError("Use 1–8 workers e timeout positivo finito.")
    rows = load_inventory(inventory_path, source)
    if skip_dataless:
        rows = [row for row in rows if not row["dataless"]]
    if limit is not None:
        if limit < 1:
            raise ValueError("O limite precisa ser positivo.")
        rows = rows[:limit]
    cached, malformed = load_cache(output)
    pending = [row for row in rows if row["id"] not in cached or (retry_errors and not cached[row["id"]]["ok"])]
    summary = {"event": "start", "total": len(rows), "cached": len(rows) - len(pending),
               "scheduled": len(pending), "workers": workers, "processed": 0, "success": 0,
               "failed": 0, "emptyText": 0, "malformedCacheLines": malformed,
               "textPrinted": False, "originalsModified": False}
    print(json.dumps(summary), flush=True)
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    # Uma interrupção pode deixar a última linha incompleta; preserve-a, mas separe a próxima.
    needs_newline = output.exists() and output.stat().st_size > 0
    if needs_newline:
        with output.open("rb") as handle:
            handle.seek(-1, os.SEEK_END)
            needs_newline = handle.read(1) != b"\n"
    started = time.monotonic()
    # Arquivo novo privado por padrão: OCR pode conter dados identificáveis.
    descriptor = os.open(output, os.O_APPEND | os.O_CREAT | os.O_WRONLY, 0o600)
    with os.fdopen(descriptor, "a", encoding="utf-8") as handle:
        if needs_newline:
            handle.write("\n")
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = [pool.submit(run_image, binary, source, row, timeout,
                                   skip_dataless=skip_dataless) for row in pending]
            for future in as_completed(futures):
                result = future.result()
                handle.write(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n")
                handle.flush()
                cached[result["id"]] = result
                summary["processed"] += 1
                summary["success" if result["ok"] else "failed"] += 1
                if result["ok"] and not result["lines"]:
                    summary["emptyText"] += 1
                if summary["processed"] % max(1, progress_every) == 0:
                    print(json.dumps({**summary, "event": "progress",
                                      "elapsedSeconds": round(time.monotonic() - started, 1)}), flush=True)
    summary.update(event="done", elapsedSeconds=round(time.monotonic() - started, 1),
                   totalSuccess=sum(bool(cached.get(row["id"], {}).get("ok")) for row in rows),
                   totalFailed=sum(not bool(cached.get(row["id"], {}).get("ok")) for row in rows))
    print(json.dumps(summary), flush=True)
    return summary


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--binary", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--timeout", type=float, default=90)
    parser.add_argument("--retry-errors", action="store_true")
    parser.add_argument("--skip-dataless", action="store_true")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--progress-every", type=int, default=10)
    parser.add_argument("--fail-on-errors", action="store_true")
    args = parser.parse_args(argv)
    try:
        summary = process(args.source, args.inventory, args.output, args.binary, workers=args.workers,
                          timeout=args.timeout, retry_errors=args.retry_errors, skip_dataless=args.skip_dataless,
                          limit=args.limit, progress_every=args.progress_every)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(json.dumps({"event": "error", "error": type(error).__name__, "message": str(error)}), file=sys.stderr)
        return 2
    return 1 if args.fail_on_errors and summary["totalFailed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
