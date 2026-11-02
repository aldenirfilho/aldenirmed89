from pathlib import Path
import argparse
import contextlib
import hashlib
import io
import json
import os
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile
from types import SimpleNamespace

SCRIPTS=Path(__file__).resolve().parents[1]/'scripts_admin'
sys.path.insert(0,str(SCRIPTS))
import extract_local_document_text as extractor


class LocalDocumentExtractionTests(unittest.TestCase):
    def test_pdf_anchors_keep_actual_physical_page_numbers_and_selection(self):
        pages=[SimpleNamespace(extract_text=lambda number=n:f'Clinical fixture page {number}')for n in(1,2,3)]
        reader=SimpleNamespace(pages=pages,is_encrypted=False,metadata=SimpleNamespace(title='Fixture book'))
        with patch.dict(sys.modules,{'pypdf':SimpleNamespace(PdfReader=lambda *a,**k:reader)}):
            result=extractor.extract(Path('/tmp/fixture.pdf'),page_numbers=[3,1,9],include_anchors=True)
        self.assertEqual([s['pageNumber']for s in result['sourceSegments']],[3,1])
        self.assertEqual(result['sourceCoverage']['unavailableRequestedPageNumbers'],[9])
        self.assertEqual(result['sourceCoverage']['pageUnit'],'physical-1-based')
        self.assertFalse(result['sourceCoverage']['wholeWorkSummarySupported'])
        self.assertEqual(result['text'],'Clinical fixture page 3\nClinical fixture page 1')

    def test_page_segments_respect_global_character_limit_and_never_invent_text(self):
        reader=SimpleNamespace(pages=[SimpleNamespace(extract_text=lambda:'A'*10),SimpleNamespace(extract_text=lambda:'B'*10)],
                               is_encrypted=False,metadata=SimpleNamespace(title='Fixture'))
        with patch.dict(sys.modules,{'pypdf':SimpleNamespace(PdfReader=lambda *a,**k:reader)}):
            result=extractor.extract(Path('/tmp/fixture.pdf'),chars=15,include_anchors=True)
        self.assertEqual(result['text'],'A'*10+'\n'+'B'*4)
        self.assertEqual(result['text'],'\n'.join(s['text']for s in result['sourceSegments']))
        self.assertTrue(result['sourceSegments'][-1]['truncated'])
        self.assertTrue(result['sourceCoverage']['textTruncated'])

    def test_invalid_page_selection_is_rejected_without_reading(self):
        for values in ([0],[True],[1,1],[],list(range(1,10)),['1']):
            with self.subTest(values=values),self.assertRaisesRegex(ValueError,'invalid-page-numbers'):
                extractor.extract(Path('/not-read.pdf'),page_numbers=values,include_anchors=True)
    def test_native_guard_blocks_escape_symlinks_and_metadata_changes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);file=root/'documento.txt';file.write_text('Conteúdo fictício');info=file.stat()
            self.assertEqual(extractor.native_path(root,file.name,info.st_size,info.st_mtime_ns),file)
            for bad in ('../documento.txt','/documento.txt','a//documento.txt'):
                with self.assertRaises(ValueError):extractor.native_path(root,bad,info.st_size,info.st_mtime_ns)
            with self.assertRaises(ValueError):extractor.native_path(root,file.name,info.st_size+1,info.st_mtime_ns)
            (root/'atalho.txt').symlink_to(file)
            with self.assertRaises(ValueError):extractor.native_path(root,'atalho.txt',info.st_size,info.st_mtime_ns)

    def test_plain_text_is_bounded_and_preserves_original(self):
        with tempfile.TemporaryDirectory() as tmp:
            file=Path(tmp)/'texto.md';file.write_text('# Tema fictício\n'+('Conteúdo de exemplo. '*10000));before=file.read_bytes();info=file.stat()
            result=extractor.extract(file,chars=1000)
            self.assertTrue(result['ok']);self.assertEqual(result['method'],'plain-text-prefix');self.assertLessEqual(len(result['text']),1000)
            self.assertEqual(file.read_bytes(),before);self.assertEqual(file.stat().st_mtime_ns,info.st_mtime_ns)

    def test_docx_xml_extracts_paragraphs_without_editing_or_reading_media(self):
        with tempfile.TemporaryDirectory() as tmp:
            file=Path(tmp)/'documento.docx'
            with zipfile.ZipFile(file,'w') as z:
                z.writestr('word/document.xml','<w:document xmlns:w="urn:example"><w:p><w:r><w:t>Assunto fictício</w:t></w:r></w:p><w:p><w:r><w:t>Segundo parágrafo</w:t></w:r></w:p></w:document>')
                z.writestr('docProps/core.xml','<core><title>Documento1</title></core>')
                z.writestr('word/media/image1.png',b'not-read-as-text')
            before=hashlib.sha256(file.read_bytes()).hexdigest();result=extractor.extract(file)
            self.assertIn('Assunto fictício',result['text']);self.assertNotIn('not-read-as-text',result['text']);self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),before)

    def test_docx_anchors_are_xml_paragraphs_not_fabricated_pages(self):
        with tempfile.TemporaryDirectory()as tmp:
            file=Path(tmp)/'document.docx'
            with zipfile.ZipFile(file,'w')as z:
                z.writestr('word/document.xml','<document><p/><p>Clinical fixture one</p><p>Clinical fixture two</p></document>')
            result=extractor.extract(file,chars=25,include_anchors=True)
            self.assertEqual(result['sourceSegments'][0]['paragraphNumber'],2)
            self.assertTrue(all('pageNumber'not in s for s in result['sourceSegments']))
            self.assertFalse(result['sourceCoverage']['physicalPagesKnown'])
            self.assertLessEqual(len(result['text']),25)
            self.assertEqual(result['text'],'\n'.join(s['text']for s in result['sourceSegments']))

    def test_zip_xml_size_limit_prevents_unbounded_decompression(self):
        with tempfile.TemporaryDirectory() as tmp:
            file=Path(tmp)/'oversize.docx'
            with zipfile.ZipFile(file,'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('word/document.xml','x'*(extractor.MAX_XML+1))
            with self.assertRaisesRegex(ValueError,'xml-size-limit'):extractor.extract(file)

    def test_fingerprint_is_unicode_stable_and_cache_ignores_bad_records(self):
        self.assertEqual(extractor.fingerprint('café.txt',10,123),extractor.fingerprint('cafe\u0301.txt',10,123))
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'cache.jsonl';row={'schema':extractor.SCHEMA,'relativePath':'a.txt','size':10,'modifiedNs':123,'id':extractor.fingerprint('a.txt',10,123),'ok':True,'title':'','text':'','method':'example','partial':True}
            p.write_text(json.dumps(row)+'\n'+json.dumps({**row,'size':11})+'\n'+'bad-tail')
            self.assertEqual(extractor.load_cache(p),{row['id']:row})

    def test_batch_stays_private_resumes_and_never_prints_text(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);source=root/'DOC 2026';source.mkdir();file=source/'arquivo.txt';file.write_text('MARCADOR_PRIVADO_FICTICIO\nNota sem categoria');info=file.stat()
            inv=root/'inventory.json';inv.write_text(json.dumps({'schema':'360x-private-documents-inventory-v1','sourceName':source.name,'documents':[{'relativePath':file.name,'size':info.st_size,'modifiedNs':info.st_mtime_ns}]}))
            out=root/'cache.jsonl';args=argparse.Namespace(source=source,inventory=inv,output=out,python=Path(sys.executable),needed_only=False,retry_errors=False,limit=None,workers=1,timeout=10,pages=2,chars=2000,progress_every=1)
            capture=io.StringIO()
            with contextlib.redirect_stdout(capture):result=extractor.batch(args)
            self.assertEqual(result['ok'],1);self.assertNotIn('MARCADOR_PRIVADO_FICTICIO',capture.getvalue());self.assertEqual(out.stat().st_mode&0o777,0o600)
            with contextlib.redirect_stdout(io.StringIO()):second=extractor.batch(args)
            self.assertEqual(second['scheduled'],0)
            args.output=source/'forbidden.jsonl'
            with self.assertRaises(ValueError):extractor.batch(args)


    def test_resume_repairs_truncated_utf8_and_stale_rows_with_exact_backup(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'cache.jsonl';row={'schema':extractor.SCHEMA,'relativePath':'a.txt','size':10,'modifiedNs':123,'id':extractor.fingerprint('a.txt',10,123),'ok':True,'title':'','text':'Tema fictício','method':'example','partial':True}
            stale={**row,'modifiedNs':99,'id':extractor.fingerprint('a.txt',10,99)}
            raw=(json.dumps(row)+'\n'+json.dumps(stale)+'\n'+json.dumps({**row,'ok':'false'})+'\n').encode()+b'{"text":"incomplete\xe2\x82'
            p.write_bytes(raw);cached,dropped=extractor.normalize_cache(p,{row['id']})
            self.assertEqual(cached,{row['id']:row});self.assertEqual(dropped,3)
            backups=list(Path(tmp).glob('*.before-repair-*'));self.assertEqual(len(backups),1);self.assertEqual(backups[0].read_bytes(),raw);self.assertEqual(backups[0].stat().st_mode&0o777,0o600)
            self.assertEqual([json.loads(line) for line in p.read_text().splitlines()],[row]);self.assertEqual(p.stat().st_mode&0o777,0o600)

    def test_cache_rejects_false_strings_and_untrusted_payload_types(self):
        row={'schema':extractor.SCHEMA,'relativePath':'a.txt','size':10,'modifiedNs':123,'id':extractor.fingerprint('a.txt',10,123),'ok':False,'title':'','text':'','method':'unavailable'}
        self.assertTrue(extractor.valid_cache_record(row))
        for changed in [{'ok':'false'},{'text':{}},{'title':[]},{'partial':'true'},{'size':True}]:self.assertFalse(extractor.valid_cache_record({**row,**changed}))
        for bad in [None,[{'kind':'pdf-page','pageNumber':True,'text':'x'}],[{'kind':'pdf-page','pageNumber':0,'text':'x'}]]:
            self.assertFalse(extractor.valid_cache_record({**row,'sourceSegments':bad}))


    def test_invalid_controls_fail_before_any_source_or_output_access(self):
        args=argparse.Namespace(source=Path('/does-not-exist'),inventory=Path('/missing'),output=Path('/missing-output'),workers=1,timeout=10,progress_every=1,limit=None,pages=2,chars=2000)
        for changed in [{'timeout':0},{'timeout':float('nan')},{'timeout':float('inf')},{'workers':9},{'progress_every':0},{'limit':-1},{'pages':0},{'chars':50001}]:
            copy=argparse.Namespace(**{**vars(args),**changed})
            with self.assertRaises(ValueError):extractor.batch(copy)

    def test_legacy_converter_disables_external_resources_and_forces_format(self):
        if not Path('/usr/bin/textutil').exists():self.skipTest('macOS converter not available')
        with tempfile.TemporaryDirectory() as tmp:
            file=Path(tmp)/'documento.rtf';file.write_text('test fixture')
            with patch.object(extractor.subprocess,'run') as run:
                run.return_value.returncode=0;run.return_value.stdout=b'Assunto ficticio'
                self.assertTrue(extractor.extract(file)['ok'])
                command=run.call_args.args[0]
                self.assertIn('-noload',command);self.assertIn('-nostore',command)
                self.assertEqual(command[command.index('-format')+1],'rtf')

if __name__=='__main__':unittest.main()
