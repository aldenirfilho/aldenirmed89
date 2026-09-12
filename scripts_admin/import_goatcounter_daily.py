#!/usr/bin/env python3
"""Converte CSV v2 do GoatCounter em JSON diário agregado, sem publicar nem alterar fontes."""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
PREFIX = '/aldenirmed89/'
MAX_CSV_BYTES = 200_000_000
MAX_JSON_BYTES = 5_000_000


def route_allowlist(manifest: object) -> dict[str, str]:
    """Aceita somente páginas canônicas já declaradas no manifesto público."""
    result = {PREFIX: PREFIX, PREFIX + 'index.html': PREFIX}

    def walk(value: object):
        if isinstance(value, dict):
            for item in value.values():
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)
        elif isinstance(value, str) and value.endswith('.html') and not any(c in value for c in ':?#\\'):
            # Rejeite travessia antes de remover o prefixo relativo.
            if '..' in unquote(value).split('/'):
                return
            value = value.removeprefix('./').lstrip('/')
            path = PREFIX + value
            canonical = path[:-10] if path.endswith('index.html') else path
            result[path] = canonical
            result[canonical] = canonical

    walk(manifest)
    return result


def aggregate(raw: bytes, allowed: dict[str, str], time_zone: str = 'America/Fortaleza') -> dict:
    reader = csv.reader(io.StringIO(raw.decode('utf-8-sig')), strict=True)
    header = next(reader, [])
    # Official exportcsv.go writes ExportCSVVersion + 'Path' as one header cell.
    # Verified against arp242/goatcounter exportcsv.go, blob 44cea397e78bac17f676a4f7289c8cdd9a7786b0.
    if not header or header[0] != '2Path':
        raise ValueError('É necessário um CSV de exportação GoatCounter versão 2, sem edição do cabeçalho.')
    header[0] = 'Path'
    required = {'Path', 'Event', 'Session', 'Bot', 'Date'}
    if len(header) != len(set(header)) or not required.issubset(header):
        raise ValueError('O CSV não contém os campos exigidos de versão 2.')
    zone = ZoneInfo(time_zone)
    days = {}
    excluded = 0
    for row_no, values in enumerate(reader, 2):
        if not values:
            continue
        if len(values) != len(header):
            raise ValueError(f'Linha {row_no}: quantidade de campos incompatível.')
        item = dict(zip(header, values))
        if item['Event'] not in {'true', 'false'} or not item['Bot'].isdigit():
            raise ValueError(f'Linha {row_no}: indicador de evento/bot inválido.')
        if item['Event'] == 'true' or int(item['Bot']) != 0:
            excluded += 1
            continue
        address = urlsplit(item['Path'])
        path = address.path
        decoded = unquote(path)
        if address.scheme or address.netloc or path not in allowed or '..' in decoded.split('/') or '\\' in decoded:
            excluded += 1
            continue
        try:
            when = datetime.fromisoformat(item['Date'].replace('Z', '+00:00'))
            if when.tzinfo is None:
                raise ValueError()
        except ValueError as error:
            raise ValueError(f'Linha {row_no}: data sem fuso ou inválida.') from error
        day = when.astimezone(zone).date().isoformat()
        current = days.setdefault(day, {'views': 0, 'sessions': set(), 'missing_session': False, 'pages': defaultdict(int)})
        current['views'] += 1
        current['pages'][allowed[path]] += 1
        if item['Session'] and item['Session'].strip('0-'):
            current['sessions'].add(item['Session'])
        else:
            current['missing_session'] = True
    output = []
    for day, values in sorted(days.items()):
        output.append({'date': day, 'visitors': None if values['missing_session'] else len(values['sessions']),
                       'views': values['views'], 'pages': [{'path': p, 'views': n} for p, n in sorted(values['pages'].items())]})
    return {'schemaVersion': 1, 'status': 'ready', 'source': {
        'provider': 'GoatCounter · CSV v2',
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'timezone': time_zone,
        'method': 'Visualizações = linhas de carregamento de páginas canônicas, excluindo bots e eventos. Visitantes estimados = sessões distintas em cada dia entre essas páginas, sem somar os únicos de cada página. Se faltar sessão em alguma linha do dia, visitantes fica indisponível. Sessões não equivalem a pessoas identificadas e podem reiniciar em cerca de 8 horas.',
        'sourceSha256': hashlib.sha256(raw).hexdigest(),
        'excludedRows': excluded,
        'coverage': 'Somente dias e páginas presentes no CSV e no manifesto canônico. Dias ausentes e limites do arquivo podem ter cobertura parcial; não são preenchidos com zero.'}, 'days': output}


def choose_csv() -> Path | None:
    """Abre o seletor nativo do macOS, sem shell nem busca automática em pastas."""
    if sys.platform != 'darwin':
        raise ValueError('--choose-file está disponível no macOS. Neste sistema, use --csv com o caminho real entre aspas.')
    try:
        selected = subprocess.run(
            ['/usr/bin/osascript', '-e', 'POSIX path of (choose file with prompt "Selecione o CSV v2 descompactado do GoatCounter")'],
            capture_output=True, text=True, check=True, timeout=300,
        )
    except subprocess.CalledProcessError as error:
        if '(-128)' in (error.stderr or ''):
            return None
        raise ValueError('Não foi possível abrir o seletor. Use --csv com o caminho real do arquivo entre aspas.') from error
    except subprocess.TimeoutExpired as error:
        raise ValueError('Seleção encerrada após cinco minutos. Execute o comando novamente para escolher o arquivo.') from error
    value = selected.stdout.rstrip('\r\n')
    return Path(value) if value else None


def private_path(value: Path, label: str) -> Path:
    path = value.expanduser().resolve()
    if str(path).startswith('/caminho/privado/'):
        raise ValueError('O caminho /caminho/privado/ era apenas um exemplo. No Mac, execute com --choose-file para selecionar o CSV real.')
    if path.is_relative_to(ROOT.resolve()):
        raise ValueError(f'Mantenha {label} fora do repositório público. Escolha uma pasta privada no computador.')
    return path


def convert_file(csv_path: Path, output_path: Path | None = None, time_zone: str = 'America/Fortaleza') -> tuple[Path, dict]:
    """Lê uma fonte escolhida pelo usuário; cria exclusivamente uma saída privada."""
    source = private_path(csv_path, 'o CSV bruto')
    if not source.is_file():
        raise ValueError('CSV não encontrado ou caminho aponta para uma pasta. No Mac, use --choose-file; nos demais sistemas, confira o caminho informado em --csv.')
    if source.suffix.lower() != '.csv':
        raise ValueError('Selecione o CSV descompactado (.csv), não o ZIP/GZ nem um relatório JSON.')
    if source.stat().st_size > MAX_CSV_BYTES:
        raise ValueError('CSV acima de 200 MB; exporte um período menor fora do repositório.')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    target = private_path(output_path if output_path is not None else source.with_name(f'aldenirmed89-visitas-{stamp}.json'), 'o JSON agregado antes da revisão')
    if not target.parent.is_dir():
        raise ValueError('A pasta de saída não existe. Omita --output para salvar o JSON ao lado do CSV.')
    if target.exists():
        raise ValueError('O arquivo de saída já existe e não será sobrescrito. Omita --output ou escolha outro nome.')
    with source.open('rb') as stream:
        raw = stream.read(MAX_CSV_BYTES + 1)
    if len(raw) > MAX_CSV_BYTES:
        raise ValueError('CSV acima de 200 MB; exporte um período menor fora do repositório.')
    manifest = json.loads((ROOT / 'data/site_manifest.json').read_text(encoding='utf-8'))
    result = aggregate(raw, route_allowlist(manifest), time_zone)
    if len(result['days']) > 3660 or any(len(day['pages']) > 10000 for day in result['days']):
        raise ValueError('Relatório excede os limites do painel. Exporte um período menor.')
    payload = (json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    if len(payload) > MAX_JSON_BYTES:
        raise ValueError('O JSON agregado ultrapassa 5 MB, limite do painel. Exporte um período menor.')
    # O_EXCL também protege contra colisões entre a verificação e a gravação.
    descriptor = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'wb') as stream:
        stream.write(payload)
    return target, result


def main(argv: list[str] | None = None):
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--csv', type=Path, help='CSV v2 descompactado, mantido fora do repositório; aceita ~ e caminhos entre aspas')
    source.add_argument('--choose-file', action='store_true', help='macOS: selecionar o CSV real em uma janela, sem digitar caminhos')
    parser.add_argument('--output', type=Path, help='Novo JSON privado; por padrão salva ao lado do CSV com nome único. Nunca sobrescreve')
    parser.add_argument('--timezone', choices=['America/Fortaleza', 'UTC'], default='America/Fortaleza')
    args = parser.parse_args(argv)
    try:
        path = choose_csv() if args.choose_file else args.csv
        if path is None:
            print('Seleção cancelada. Nenhum arquivo criado e nenhum dado enviado.')
            return
        target, result = convert_file(path, args.output, args.timezone)
    except (OSError, ValueError, csv.Error) as error:
        parser.error(str(error))
    print(f"Relatório agregado criado: {len(result['days'])} dias; {result['source']['excludedRows']} linhas de bots/eventos/rotas fora do escopo ignoradas.")
    print(f'Arquivo JSON: {target}')
    print('Próximo passo: abra o painel de visitas → Importar relatório agregado privado → selecione esse JSON.')
    if not result['days']:
        print('Atenção: não há observações canônicas nesse arquivo. Isso não comprova zero acessos.')
    print('Nenhum upload ou publicação realizado. Revise a cobertura antes de compartilhar o agregado.')


if __name__ == '__main__':
    main()
