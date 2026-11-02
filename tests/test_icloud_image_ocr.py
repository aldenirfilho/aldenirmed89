"""Contratos de segurança/retomada; não requer Vision nem lê acervo real."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest


MODULE = Path(__file__).resolve().parents[1] / "scripts_admin" / "run_icloud_image_ocr.py"
SPEC = importlib.util.spec_from_file_location("icloud_ocr_runner", MODULE)
ocr = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ocr)


class LocalOCRTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="icloud-ocr-test-")
        self.root = Path(self.temporary.name)
        self.source = self.root / "images"
        self.source.mkdir()
        self.inventory = self.root / "inventory.json"
        self.output = self.root / "private" / "ocr.jsonl"
        self.binary = self.root / "fake-ocr"
        self.binary.write_text(
            "#!" + sys.executable + "\n"
            "import json, pathlib, sys, time\n"
            "r = json.loads(sys.stdin.readline())\n"
            "name = pathlib.Path(r['path']).stem\n"
            "if name == 'slow': time.sleep(5)\n"
            "ok = name != 'failure'\n"
            "lines = [] if name == 'empty' or not ok else "
            "[{'text':'PRIVATE_OCR_SENTINEL','confidence':0.9,'x':0.1,'y':0.2,'width':0.4,'height':0.05}]\n"
            "print(json.dumps({'id':r['id'],'ok':ok,'lines':lines,'engine':'test-local','error':'test-failure'}))\n",
            encoding="utf-8",
        )
        self.binary.chmod(0o700)

    def tearDown(self):
        self.temporary.cleanup()

    def image_row(self, name="sample.png"):
        image = self.source / name
        image.parent.mkdir(parents=True, exist_ok=True)
        image.write_bytes(b"original-image-bytes")
        info = image.stat()
        return {"relativePath": name, "size": info.st_size,
                "modifiedNs": info.st_mtime_ns, "dataless": False}

    def write_inventory(self, rows):
        self.inventory.write_text(json.dumps({"images": rows}), encoding="utf-8")
        return ocr.load_inventory(self.inventory, self.source)

    def process(self, **kwargs):
        printed = io.StringIO()
        with contextlib.redirect_stdout(printed):
            summary = ocr.process(self.source, self.inventory, self.output, self.binary,
                                  workers=2, timeout=2, **kwargs)
        self.assertNotIn("PRIVATE_OCR_SENTINEL", printed.getvalue())
        for line in printed.getvalue().splitlines():
            self.assertIsInstance(json.loads(line), dict)
        return summary

    def test_relative_paths_reject_escape_and_ambiguous_inputs(self):
        for value in ("../escape.png", "/absolute.png", "a/../../x.png", "a//x.png",
                      "./x.png", "a/./x.png", "a/", "C:/x.png", "a\\x.png", "a\nx.png", None):
            with self.subTest(value=value), self.assertRaises(ValueError):
                ocr.safe_relative_path(value)
        self.assertEqual(ocr.safe_relative_path("pneumologia/TB.png"), "pneumologia/TB.png")

    def test_fingerprint_tracks_metadata_and_unicode_normalization(self):
        key = ocr.fingerprint("a.png", 10, 20)
        self.assertEqual(key, ocr.fingerprint("a.png", 10, 20))
        for changed in (("b.png", 10, 20), ("a.png", 11, 20), ("a.png", 10, 21)):
            self.assertNotEqual(key, ocr.fingerprint(*changed))
        self.assertEqual(ocr.fingerprint("cafe\u0301.png", 1, 2), ocr.fingerprint("café.png", 1, 2))

    def test_private_output_cannot_target_source_repo_or_inventory(self):
        for path in (self.source / "output.jsonl", ocr.REPO_ROOT / "ocr.jsonl", self.inventory):
            with self.subTest(path=path), self.assertRaises(ValueError):
                ocr.validate_private_output(path, self.source, self.inventory)
        self.assertEqual(ocr.validate_private_output(self.output, self.source), self.output.resolve())

    def test_output_and_source_symlinks_are_rejected(self):
        source_alias = self.root / "source-alias"
        source_alias.symlink_to(self.source, target_is_directory=True)
        with self.assertRaises(ValueError):
            ocr.canonical_source(source_alias)
        target = self.root / "target.jsonl"
        target.touch()
        alias = self.root / "alias.jsonl"
        alias.symlink_to(target)
        with self.assertRaises(ValueError):
            ocr.validate_private_output(alias, self.source)

    def test_inventory_deduplicates_and_rejects_invalid_metadata(self):
        row = self.image_row()
        rows = self.write_inventory([row, row])
        self.assertEqual(len(rows), 1)
        for update in ({"size": True}, {"size": 0}, {"modifiedNs": -1},
                       {"relativePath": "document.pdf"}, {"relativePath": "../x.png"}):
            with self.subTest(update=update), self.assertRaises(ValueError):
                self.write_inventory([{**row, **update}])

    def test_file_and_directory_symlinks_blocked_before_engine(self):
        row = self.image_row("target.png")
        (self.source / "alias.png").symlink_to(self.source / "target.png")
        aliased = {**row, "relativePath": "alias.png"}
        alias_row = self.write_inventory([aliased])[0]
        self.assertEqual(ocr.run_image(self.binary, self.source, alias_row, 2)["error"], "symlink-blocked")
        (self.source / "nested").symlink_to(self.source, target_is_directory=True)
        alias_row = self.write_inventory([{**row, "relativePath": "nested/target.png"}])[0]
        self.assertEqual(ocr.run_image(self.binary, self.source, alias_row, 2)["error"], "symlink-blocked")

    def test_changed_metadata_prevents_engine_execution(self):
        row = self.write_inventory([self.image_row()])[0]
        (self.source / row["relativePath"]).write_bytes(b"changed-content")
        result = ocr.run_image(self.root / "nonexistent-engine", self.source, row, 2)
        self.assertFalse(result["ok"])
        self.assertEqual(result["error"], "source-metadata-changed")

    def test_ocr_private_record_preserves_original_bytes_and_mtime(self):
        row = self.write_inventory([self.image_row()])[0]
        image = self.source / row["relativePath"]
        before = (image.read_bytes(), image.stat().st_mtime_ns)
        result = ocr.run_image(self.binary, self.source, row, 2)
        self.assertTrue(result["ok"])
        self.assertEqual(result["lines"][0]["text"], "PRIVATE_OCR_SENTINEL")
        self.assertEqual(before, (image.read_bytes(), image.stat().st_mtime_ns))

    def test_engine_timeout_is_recorded_without_text(self):
        row = self.write_inventory([self.image_row("slow.png")])[0]
        result = ocr.run_image(self.binary, self.source, row, 0.1)
        self.assertFalse(result["ok"])
        self.assertEqual(result["error"], "timeout")
        self.assertEqual(result["lines"], [])

    def test_resume_successes_and_failures_retry_only_errors(self):
        self.write_inventory([self.image_row(), self.image_row("failure.png"), self.image_row("empty.png")])
        first = self.process()
        self.assertEqual((first["processed"], first["success"], first["failed"], first["emptyText"]), (3, 2, 1, 1))
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o600)
        self.assertEqual(self.process()["processed"], 0)
        retry = self.process(retry_errors=True)
        self.assertEqual((retry["processed"], retry["failed"], retry["totalSuccess"]), (1, 1, 2))
        self.assertEqual(len(self.output.read_text().splitlines()), 4)

    def test_cache_invalid_tail_preserved_and_new_record_separated(self):
        self.write_inventory([self.image_row()])
        self.output.parent.mkdir()
        self.output.write_text('{"interrupted":', encoding="utf-8")
        summary = self.process()
        self.assertEqual((summary["malformedCacheLines"], summary["success"]), (1, 1))
        self.assertTrue(self.output.read_text().startswith('{"interrupted":\n'))
        cache, malformed = ocr.load_cache(self.output)
        self.assertEqual((len(cache), malformed), (1, 1))

    def test_metadata_change_creates_new_cache_entry(self):
        self.write_inventory([self.image_row()])
        self.process()
        image = self.source / "sample.png"
        image.write_bytes(b"new-size-new-cache")
        info = image.stat()
        self.write_inventory([{"relativePath": image.name, "size": info.st_size,
                               "modifiedNs": info.st_mtime_ns}])
        self.assertEqual(self.process()["processed"], 1)
        self.assertEqual(len(ocr.load_cache(self.output)[0]), 2)

    def test_skip_inventory_placeholders_never_invokes_engine(self):
        row = {**self.image_row("slow.png"), "dataless": True}
        self.write_inventory([row])
        summary = self.process(skip_dataless=True)
        self.assertEqual((summary["total"], summary["scheduled"], summary["processed"]), (0, 0, 0))

    def test_limits_worker_and_timeout_constraints(self):
        self.write_inventory([self.image_row()])
        for options in ({"workers": 0}, {"workers": 9}, {"timeout": 0},
                        {"timeout": float("nan")}, {"limit": 0}):
            with self.subTest(options=options), self.assertRaises(ValueError), contextlib.redirect_stdout(io.StringIO()):
                ocr.process(self.source, self.inventory, self.output, self.binary, **options)


@unittest.skipUnless(shutil.which("node"), "Node.js não disponível; nenhum pacote npm é necessário nestes contratos")
class NodeContractTests(unittest.TestCase):
    def run_node(self, body):
        module = MODULE.with_name("icloud_image_ocr.mjs")
        program = "const m = await import(" + json.dumps(module.as_uri()) + ");\n" + body
        completed = subprocess.run([shutil.which("node"), "--input-type=module", "--eval", program],
                                   text=True, capture_output=True, timeout=10, check=True)
        return json.loads(completed.stdout)

    def test_nanosecond_fingerprint_matches_python_without_rounding(self):
        result = self.run_node(
            "const row=m.parseMetadataJSON('{\"relativePath\":\"café.png\",\"size\":42,\"modifiedNs\":1800000000123456789}');\n"
            "console.log(JSON.stringify({id:m.fingerprint(row.relativePath,row.size,row.modifiedNs),"
            "record:m.stringifyRecord(row)}));")
        self.assertEqual(result["id"], ocr.fingerprint("café.png", 42, 1800000000123456789))
        self.assertEqual(json.loads(result["record"])["modifiedNs"], 1800000000123456789)

    def test_bounding_boxes_use_vision_bottom_left_origin(self):
        result = self.run_node("console.log(JSON.stringify(m.normalizedLines({blocks:[{paragraphs:[{lines:["
                               "{text:'test',confidence:92,bbox:{x0:20,y0:40,x1:80,y1:60}}]}]}]},100,200)));")
        self.assertEqual(len(result), 1)
        for key, expected in {"confidence": 0.92, "x": 0.2, "y": 0.7, "width": 0.6, "height": 0.1}.items():
            self.assertAlmostEqual(result[0][key], expected)

    def test_node_rejects_relative_path_escapes(self):
        result = self.run_node("let count=0; for(const p of ['../x.png','/x.png','a//x.png','a\\\\x.png'])"
                               "{try{m.safeRelativePath(p);}catch{count++;}} console.log(JSON.stringify({count}));")
        self.assertEqual(result["count"], 4)

    def test_network_is_disabled_before_engine_initialization(self):
        result = self.run_node("let error='';try{await fetch('http://127.0.0.1:9');}catch(e){error=e.message;}"
                               "console.log(JSON.stringify({error}));")
        self.assertEqual(result["error"], "network-disabled-local-ocr")

    def test_dangling_output_symlink_is_rejected(self):
        with tempfile.TemporaryDirectory(prefix="icloud-ocr-node-") as directory:
            root = Path(directory)
            source = root / "source"
            source.mkdir()
            output = root / "cache-link.jsonl"
            output.symlink_to(source / "nonexistent-cache.jsonl")
            body = "let error='';try{m.privateOutput(" + json.dumps(str(output)) + "," + json.dumps(str(source)) + ");}"
            body += "catch(e){error=e.message;} console.log(JSON.stringify({error}));"
            self.assertEqual(self.run_node(body)["error"], "unsafe-cache-target")


if __name__ == "__main__":
    unittest.main()
