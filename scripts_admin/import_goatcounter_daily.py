#!/usr/bin/env python3
"""Converte CSV v2 do GoatCounter em JSON diário agregado, sem publicar nem alterar fontes."""
from __future__ import annotations
import argparse
import csv
import hashlib
import io
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
PREFIX = '/aldenirmed89/'


def route_allowlist(manifest: object) -> dict[str, str]:
    """Aceita somente páginas canônicas já declaradas no manifesto público."""
    result = {PREFIX: PREFIX, PREFIX + 'index.html': PREFIX}
    def walk(value: object):
        if isinstance(value, dict):
            for item in value.values(): walk(item)
        elif isinstance(value, list):
            for item in value: walk(item)
        elif isinstance(value, str) and value.endswith('.html') and not any(c in value for c in ':?#\\'):
            value=value.lstrip('./')
            if '..' in value.split('/'): return
            path=PREFIX+value
            canonical=path[:-10] if path.endswith('index.html') else path
            result[path]=canonical
            result[canonical]=canonical
    walk(manifest)
    return result


def aggregate(raw: bytes, allowed: dict[str,str], time_zone: str = 'America/Fortaleza') -> dict:
    reader = csv.reader(io.StringIO(raw.decode('utf-8-sig')), strict=True)
    header = next(reader, [])
    # Official exportcsv.go writes ExportCSVVersion + 'Path' as one header cell.
    # Verified against arp242/goatcounter exportcsv.go, blob 44cea397e78bac17f676a4f7289c8cdd9a7786b0.
    if not header or header[0] != '2Path':
        raise ValueError('É necessário um CSV de exportação GoatCounter versão 2, sem edição do cabeçalho.')
    header[0] = 'Path'
    required = {'Path','Event','Session','Bot','Date'}
    if len(header) != len(set(header)) or not required.issubset(header):
        raise ValueError('O CSV não contém os campos exigidos de versão 2.')
    zone=ZoneInfo(time_zone)
    days={}
    excluded=0
    for row_no,values in enumerate(reader,2):
        if not values: continue
        if len(values) != len(header):
            raise ValueError(f'Linha {row_no}: quantidade de campos incompatível.')
        item=dict(zip(header,values))
        if item['Event'] not in {'true','false'} or not item['Bot'].isdigit():
            raise ValueError(f'Linha {row_no}: indicador de evento/bot inválido.')
        if item['Event']=='true' or int(item['Bot']) != 0:
            excluded+=1;continue
        path=urlsplit(item['Path']).path
        decoded=unquote(path)
        if urlsplit(item['Path']).scheme or path not in allowed or '..' in decoded.split('/') or '\\' in decoded:
            excluded+=1;continue
        try:
            when=datetime.fromisoformat(item['Date'].replace('Z','+00:00'))
            if when.tzinfo is None: raise ValueError()
        except ValueError as error:
            raise ValueError(f'Linha {row_no}: data sem fuso ou inválida.') from error
        day=when.astimezone(zone).date().isoformat()
        current=days.setdefault(day,{'views':0,'sessions':set(),'missing_session':False,'pages':defaultdict(int)})
        current['views']+=1
        current['pages'][allowed[path]]+=1
        if item['Session'] and item['Session'].strip('0-'):
            current['sessions'].add(item['Session'])
        else:
            current['missing_session']=True
    output=[]
    for day,values in sorted(days.items()):
        output.append({'date':day,'visitors':None if values['missing_session'] else len(values['sessions']),
                       'views':values['views'],'pages':[{'path':p,'views':n} for p,n in sorted(values['pages'].items())]})
    return {'schemaVersion':1,'status':'ready','source':{
        'provider':'GoatCounter · CSV v2',
        'generatedAt':datetime.now(timezone.utc).isoformat(),
        'timezone':time_zone,
        'method':'Visualizações = linhas de carregamento de páginas canônicas, excluindo bots e eventos. Visitantes estimados = sessões distintas em cada dia entre essas páginas, sem somar os únicos de cada página. Se faltar sessão em alguma linha do dia, visitantes fica indisponível. Sessões não equivalem a pessoas identificadas e podem reiniciar em cerca de 8 horas.',
        'sourceSha256':hashlib.sha256(raw).hexdigest(),
        'excludedRows':excluded,
        'coverage':'Somente dias e páginas presentes no CSV e no manifesto canônico. Dias ausentes e limites do arquivo podem ter cobertura parcial; não são preenchidos com zero.'},'days':output}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--csv',type=Path,required=True,help='CSV v2 descompactado, mantido fora do repositório')
    parser.add_argument('--output',type=Path,required=True,help='Novo arquivo JSON agregado; nunca sobrescreve')
    parser.add_argument('--timezone',choices=['America/Fortaleza','UTC'],default='America/Fortaleza')
    args=parser.parse_args()
    if args.csv.resolve().is_relative_to(ROOT):
        parser.error('Mantenha o CSV bruto fora do repositório público.')
    try:
        raw=args.csv.read_bytes()
        if len(raw)>200_000_000: raise ValueError('CSV acima de 200 MB; divida a exportação por período fora do repositório.')
        manifest=json.loads((ROOT/'data/site_manifest.json').read_text())
        result=aggregate(raw,route_allowlist(manifest),args.timezone)
        with args.output.open('x',encoding='utf-8') as stream:
            json.dump(result,stream,ensure_ascii=False,indent=2);stream.write('\n')
    except (OSError,ValueError,csv.Error) as error:
        parser.error(str(error))
    print(f"Relatório agregado criado: {len(result['days'])} dias; {result['source']['excludedRows']} linhas de bots/eventos/rotas fora do escopo ignoradas. Nenhum upload ou publicação realizado.")

if __name__=='__main__':main()
