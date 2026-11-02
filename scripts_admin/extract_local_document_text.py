#!/usr/bin/env python3
"""Bounded, local text hints for organizing private documents, without upload.

Use a Python runtime with pypdf installed for PDFs. DOCX/ODT use standard ZIP/XML;
plain text uses bounded reads. Legacy DOC/RTF may use macOS textutil. This does
not edit originals or validate the medical content. Private JSONL must stay
outside the repository and source folder. No document text is printed by batch.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
import logging
import math
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import time
import unicodedata
import warnings
import zipfile
import xml.etree.ElementTree as ET

SCHEMA='360x-document-text-v1'
REPO=Path(__file__).resolve().parents[1]
MAX_BYTES=256*1024*1024
MAX_XML=8*1024*1024


def fingerprint(path,size,ns):
    raw=json.dumps([unicodedata.normalize('NFC',path),size,ns],ensure_ascii=False,separators=(',',':'))
    return hashlib.sha256(raw.encode()).hexdigest()


def native_path(source,relative,size,ns):
    if not isinstance(relative,str) or not relative or '\x00' in relative or relative.startswith('/') or any(p in ('','.','..') for p in relative.split('/')):
        raise ValueError('unsafe-path')
    current=source
    for part in relative.split('/'):
        current=current/part
        info=current.lstat()
        if stat.S_ISLNK(info.st_mode):raise ValueError('symlink-blocked')
    if not stat.S_ISREG(info.st_mode):raise ValueError('not-regular')
    if info.st_size!=size or info.st_mtime_ns!=ns:raise ValueError('source-changed')
    if info.st_size>MAX_BYTES:raise ValueError('oversize')
    return current


def clean_title(value):
    title=' '.join(str(value or '').split())[:700]
    if title.casefold() in {'untitled','document','document1','microsoft word','sem titulo','sem título','word document'}:return ''
    if re.fullmatch(r'(?:[a-f0-9-]{20,}|\d{4,})',title,re.I):return ''
    return title


def extract(path,pages=2,chars=20000):
    """Read only bounded text. The caller enforces path/fingerprint/time limits."""
    warnings.simplefilter('ignore');logging.disable(logging.CRITICAL)
    extension=path.suffix.lower();title='';text='';method='unsupported';partial=True
    if extension=='.pdf':
        from pypdf import PdfReader
        reader=PdfReader(str(path),strict=False)
        if reader.is_encrypted:
            try:unlocked=reader.decrypt('')
            except Exception:unlocked=False
            if not unlocked:raise ValueError('encrypted-pdf')
        title=clean_title(getattr(reader.metadata,'title',''))
        chunks=[]
        for page in reader.pages[:pages]:
            chunks.append((page.extract_text() or '')[:chars])
            if sum(map(len,chunks))>=chars:break
        text='\n'.join(chunks)[:chars];method='pdf-first-pages'
    elif extension in {'.docx','.odt'}:
        member='word/document.xml' if extension=='.docx' else 'content.xml'
        with zipfile.ZipFile(path) as archive:
            info=archive.getinfo(member)
            if info.file_size>MAX_XML:raise ValueError('xml-size-limit')
            root=ET.fromstring(archive.read(info))
            paragraphs=[]
            for node in root.iter():
                if node.tag.split('}')[-1] in {'p','h'}:
                    value=''.join(node.itertext()).strip()
                    if value:paragraphs.append(value)
                    if sum(map(len,paragraphs))>=chars:break
            text='\n'.join(paragraphs)[:chars]
            core='docProps/core.xml' if extension=='.docx' else 'meta.xml'
            if core in archive.namelist() and archive.getinfo(core).file_size<=1024*1024:
                meta=ET.fromstring(archive.read(core))
                title=next((clean_title(n.text) for n in meta.iter() if n.tag.split('}')[-1]=='title' and n.text),'')
        method='zip-xml-first-paragraphs'
    elif extension in {'.txt','.md','.markdown','.csv'}:
        with path.open('rb') as handle:raw=handle.read(chars*4)
        text=raw.decode('utf-8-sig',errors='replace')[:chars];method='plain-text-prefix'
    elif extension in {'.doc','.rtf'} and Path('/usr/bin/textutil').exists():
        result=subprocess.run(['/usr/bin/textutil','-noload','-nostore','-format',extension[1:],'-convert','txt','-stdout',str(path)],capture_output=True,timeout=15)
        if result.returncode:raise ValueError('legacy-conversion-failed')
        text=result.stdout.decode('utf-8',errors='replace')[:chars];method='local-textutil'
    # Pages stays named by filename unless a separate explicit local converter is used.
    if not title and text:
        lines=[line.strip() for line in text.splitlines() if line.strip()]
        # Only a bounded leading heading; metadata lines and multiple lines are
        # still evaluated conservatively by the topic classifier.
        title='\n'.join(lines[:3])[:700]
    return {'ok':True,'title':title,'text':text,'method':method,'partial':partial}


def worker(request):
    path=Path(request['path'])
    if not path.is_absolute() or path.is_symlink() or not path.is_file() or path.stat().st_size>MAX_BYTES:raise ValueError('unsafe-worker-file')
    return extract(path,int(request.get('pages',2)),int(request.get('chars',20000)))


def valid_cache_record(row):
    if not isinstance(row,dict) or row.get('schema')!=SCHEMA or type(row.get('ok')) is not bool:return False
    if not isinstance(row.get('relativePath'),str) or not isinstance(row.get('id'),str):return False
    if type(row.get('size')) is not int or type(row.get('modifiedNs')) is not int:return False
    if row['size']<=0 or row['modifiedNs']<0:return False
    if any(not isinstance(row.get(k),str) for k in ['title','text','method']):return False
    if len(row['title'])>700 or len(row['text'])>50000 or len(row['method'])>120:return False
    if 'partial' in row and type(row['partial']) is not bool:return False
    return row['id']==fingerprint(row['relativePath'],row['size'],row['modifiedNs'])


def load_cache(path):
    found={}
    if path.exists():
        for line in path.read_bytes().splitlines():
            try:
                row=json.loads(line.decode('utf-8'))
                if valid_cache_record(row):found[row['id']]=row
            except (ValueError,KeyError,TypeError,UnicodeError):continue
    return found


def normalize_cache(path,current_ids):
    """Preserve an exact private backup before repairing this generated cache.

    Stale fingerprints, malformed rows and truncated UTF-8 tails never become
    evidence for a current document. Source documents are not touched.
    """
    if not path.exists():return {},0
    raw=path.read_bytes();found={};dropped=0
    for line in raw.splitlines():
        if not line.strip():continue
        try:
            row=json.loads(line.decode('utf-8'))
            if not valid_cache_record(row) or row['id'] not in current_ids:raise ValueError('stale-or-invalid')
            found[row['id']]=row
        except (ValueError,KeyError,TypeError,UnicodeError):dropped+=1
    if dropped or (raw and not raw.endswith(b'\n')):
        stamp=str(time.time_ns());backup=path.with_name(path.name+'.before-repair-'+stamp)
        descriptor=os.open(backup,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
        with os.fdopen(descriptor,'wb') as handle:handle.write(raw)
        temporary=path.with_name(path.name+'.repair-'+stamp)
        descriptor=os.open(temporary,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
        with os.fdopen(descriptor,'w') as handle:
            for row in found.values():handle.write(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n')
        os.replace(temporary,path)
    return found,dropped


def validate_arguments(args):
    if type(args.workers) is not int or not 1<=args.workers<=8:raise ValueError('invalid-workers')
    if not math.isfinite(args.timeout) or args.timeout<=0:raise ValueError('invalid-timeout')
    if type(args.progress_every) is not int or args.progress_every<1:raise ValueError('invalid-progress')
    if args.limit is not None and (type(args.limit) is not int or args.limit<1):raise ValueError('invalid-limit')
    if type(args.pages) is not int or not 1<=args.pages<=5:raise ValueError('invalid-pages')
    if type(args.chars) is not int or not 1<=args.chars<=50000:raise ValueError('invalid-characters')


def batch(args):
    validate_arguments(args)
    from document_theme_classifier import classify_document
    source=args.source.resolve(strict=True)
    if args.source.is_symlink() or not source.is_dir():raise ValueError('unsafe-source')
    output=args.output.absolute();resolved=output.resolve(strict=False)
    if output.is_symlink() or resolved==source or source in resolved.parents or resolved==REPO or REPO in resolved.parents or resolved==args.inventory.resolve():raise ValueError('private-output-required')
    inv=json.loads(args.inventory.read_text());rows=inv['documents']
    if inv['schema']!='360x-private-documents-inventory-v1' or inv['sourceName']!=source.name:raise ValueError('invalid-inventory')
    current_ids={fingerprint(r['relativePath'],r['size'],r['modifiedNs']) for r in rows}
    cached,repaired=normalize_cache(output,current_ids);pending=[]
    for row in rows:
        row={**row,'id':fingerprint(row['relativePath'],row['size'],row['modifiedNs'])}
        if args.needed_only and not classify_document(row['relativePath'],original_folder=source.name)['needsReview']:continue
        if row['id'] in cached and (cached[row['id']].get('ok') or not args.retry_errors):continue
        pending.append(row)
    if args.limit:pending=pending[:args.limit]
    output.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    started=time.monotonic();summary={'event':'start','sourceName':source.name,'inventoryDocuments':len(rows),'scheduled':len(pending),'workers':args.workers,'cacheRowsDiscarded':repaired,'processed':0,'ok':0,'failed':0,'emptyText':0,'fullDocumentsModified':False,'textPrinted':False}
    print(json.dumps(summary),flush=True)
    def one(row):
        result={'schema':SCHEMA,**{k:row[k] for k in ['id','relativePath','size','modifiedNs']},'ok':False,'title':'','text':'','method':'not-read','processedAt':datetime.now(timezone.utc).isoformat()}
        t=time.monotonic()
        try:
            path=native_path(source,row['relativePath'],row['size'],row['modifiedNs'])
            request=json.dumps({'path':str(path),'pages':args.pages,'chars':args.chars},ensure_ascii=False)
            completed=subprocess.run([str(args.python),str(Path(__file__).resolve()),'--worker'],input=request,capture_output=True,text=True,timeout=args.timeout)
            if completed.returncode:raise ValueError('worker-failed')
            extracted=json.loads(completed.stdout)
            if not isinstance(extracted,dict) or type(extracted.get('ok')) is not bool:raise ValueError('invalid-worker')
            native_path(source,row['relativePath'],row['size'],row['modifiedNs'])
            result.update(extracted)
        except subprocess.TimeoutExpired:result['error']='timeout'
        except Exception as error:result['error']=str(error)[:50] if isinstance(error,ValueError) else type(error).__name__
        result['durationMs']=round((time.monotonic()-t)*1000);return result
    fd=os.open(output,os.O_CREAT|os.O_APPEND|os.O_WRONLY,0o600)
    with os.fdopen(fd,'a') as handle:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures=[pool.submit(one,row) for row in pending]
            for future in as_completed(futures):
                row=future.result();handle.write(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n');handle.flush();cached[row['id']]=row
                summary['processed']+=1;summary['ok' if row['ok'] else 'failed']+=1
                if row['ok'] and not row.get('text'):summary['emptyText']+=1
                if summary['processed']%args.progress_every==0:print(json.dumps({**summary,'event':'progress','elapsedSeconds':round(time.monotonic()-started,1)}),flush=True)
    summary.update(event='done',elapsedSeconds=round(time.monotonic()-started,1),totalCached=len(cached));print(json.dumps(summary),flush=True);return summary


def main():
    if '--worker' in sys.argv:
        try:result=worker(json.load(sys.stdin))
        except Exception as error:result={'ok':False,'title':'','text':'','method':'unavailable','error':str(error)[:50] if isinstance(error,ValueError) else type(error).__name__}
        print(json.dumps(result,ensure_ascii=False));return
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,required=True);parser.add_argument('--inventory',type=Path,required=True);parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--python',type=Path,default=Path(sys.executable));parser.add_argument('--workers',type=int,default=4);parser.add_argument('--timeout',type=float,default=45)
    parser.add_argument('--pages',type=int,default=2);parser.add_argument('--chars',type=int,default=20000);parser.add_argument('--needed-only',action='store_true');parser.add_argument('--retry-errors',action='store_true')
    parser.add_argument('--limit',type=int);parser.add_argument('--progress-every',type=int,default=25)
    args=parser.parse_args()
    try:batch(args)
    except Exception as error:print(json.dumps({'event':'error','type':type(error).__name__,'textPrinted':False}),file=sys.stderr);sys.exit(1)
if __name__=='__main__':main()
