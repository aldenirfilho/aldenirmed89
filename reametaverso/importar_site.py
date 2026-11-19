#!/usr/bin/env python3
"""Importa o ZIP aprovado do Reametaverso, sem rede, execução externa ou git push.
Uso, a partir de qualquer pasta:
    python3 reametaverso/importar_site.py /caminho/Reametaverso_Site_Completo_v1.zip
"""
from __future__ import annotations
import argparse
import hashlib
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import sys
import tempfile
import zipfile

EXPECTED_SHA256 = '0275d2c57300542f1a79d4bd7f62eeba8a71f141872ac849c1ea5e7f89c9270d'
MAX_UNCOMPRESSED = 50 * 1024 * 1024
REQUIRED = {'reametaverso/index.html', 'reametaverso/assets/app.js', 'reametaverso/assets/styles.css', 'reametaverso/assets/data.js'}

def digest(path: Path) -> str:
    result = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(chunk)
    return result.hexdigest()

def import_site(archive: Path, repository: Path, replace: bool = False) -> int:
    if not archive.is_file():
        raise ValueError(f'Arquivo não encontrado: {archive}')
    actual = digest(archive)
    if actual != EXPECTED_SHA256:
        raise ValueError(f'SHA-256 diferente do pacote aprovado. Esperado: {EXPECTED_SHA256}; recebido: {actual}. Nada foi alterado.')
    destination = repository / 'reametaverso'
    if destination.is_symlink():
        raise ValueError('O destino não pode ser um link simbólico.')
    with zipfile.ZipFile(archive) as bundle:
        entries = [entry for entry in bundle.infolist() if not entry.is_dir()]
        if sum(entry.file_size for entry in entries) > MAX_UNCOMPRESSED:
            raise ValueError('Pacote excede o tamanho máximo descompactado.')
        seen: set[str] = set()
        for entry in entries:
            path = PurePosixPath(entry.filename)
            mode = entry.external_attr >> 16
            if path.is_absolute() or '..' in path.parts or '\\' in entry.filename or not path.parts or path.parts[0] != 'reametaverso' or stat.S_ISLNK(mode):
                raise ValueError(f'Caminho inseguro no pacote: {entry.filename}')
            if entry.filename in seen:
                raise ValueError(f'Caminho duplicado: {entry.filename}')
            seen.add(entry.filename)
        if not REQUIRED.issubset(seen):
            raise ValueError('O pacote não contém todos os arquivos essenciais.')
        # README inicial e registro desta importação são intencionalmente substituíveis.
        permitted_replacements = {'README.md'}
        for entry in entries:
            relative = PurePosixPath(entry.filename).relative_to('reametaverso')
            target = destination.joinpath(*relative.parts)
            if target.exists() and not replace and str(relative) not in permitted_replacements:
                raise ValueError(f'Arquivo já existe: {target}. Faça backup e use --replace para atualizar somente a pasta do Reametaverso.')
            for parent in [target, *target.parents]:
                if parent == repository:
                    break
                if parent.is_symlink():
                    raise ValueError(f'Link simbólico não permitido no destino: {parent}')
        with tempfile.TemporaryDirectory(prefix='reametaverso-import-') as stage:
            stage_root = Path(stage)
            for entry in entries:
                local = stage_root.joinpath(*PurePosixPath(entry.filename).parts)
                local.parent.mkdir(parents=True, exist_ok=True)
                with bundle.open(entry) as source, local.open('wb') as output:
                    shutil.copyfileobj(source, output)
            destination.mkdir(parents=True, exist_ok=True)
            for entry in entries:
                relative = PurePosixPath(entry.filename).relative_to('reametaverso')
                source = stage_root.joinpath(*PurePosixPath(entry.filename).parts)
                target = destination.joinpath(*relative.parts)
                target.parent.mkdir(parents=True, exist_ok=True)
                # Um arquivo temporário no próprio destino evita renomeações entre volumes.
                with tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as temp:
                    temp_path = Path(temp.name)
                    with source.open('rb') as stream:
                        shutil.copyfileobj(stream, temp)
                try:
                    os.replace(temp_path, target)
                finally:
                    temp_path.unlink(missing_ok=True)
    return len(entries)

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path, help='Caminho do ZIP completo entregue na conversa')
    parser.add_argument('--replace', action='store_true', help='Permite atualizar arquivos existentes somente em reametaverso/; faça backup antes')
    arguments = parser.parse_args()
    repository = Path(__file__).resolve().parent.parent
    try:
        count = import_site(arguments.archive.expanduser().resolve(), repository, arguments.replace)
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        print(f'Importação interrompida: {error}', file=sys.stderr)
        return 1
    print(f'Importação concluída: {count} arquivos em {repository / "reametaverso"}.')
    print('Revise o resultado antes de git add, commit e push. Nenhum desses comandos foi executado.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
