"""Contracts for the new section, educational data and licensed offline audio."""
import hashlib
import json
import re
import subprocess
import unittest
import wave
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SECTION = ROOT / '24_Semiologia'
MODULE = SECTION / 'Cardiovascular'

def data(name):
    return json.loads((MODULE / 'data' / (name + '.json')).read_text())

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=[]; self.refs=[]; self.feed(text)
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if 'id' in d: self.ids.append(d['id'])
        for a in ('src','href'):
            if d.get(a): self.refs.append(d[a])

class SemiologyCardioTests(unittest.TestCase):
    def test_home_uses_normal_section_card_and_hub_contains_both_modules(self):
        home=(ROOT/'index.html').read_text()
        self.assertNotIn('neuro-feature', home)
        self.assertNotIn('mission-neuro-direct', home)
        self.assertRegex(home, r'class="module-card[^\"]*" href="24_Semiologia/index.html"')
        hub=(SECTION/'index.html').read_text()
        self.assertIn('Cardiovascular/index.html',hub)
        self.assertIn('../01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/aprofundamento.html',hub)

    def test_local_assets_anchors_and_unique_ids(self):
        for path in (SECTION/'index.html', MODULE/'index.html'):
            page=Page(path.read_text());self.assertEqual(len(page.ids),len(set(page.ids)))
            for ref in page.refs:
                u=urlsplit(ref)
                if u.scheme or u.netloc: continue
                dest=(path.parent/unquote(u.path)).resolve() if u.path else path
                if dest.is_dir(): dest /= 'index.html'
                self.assertTrue(dest.is_file(),ref)
                if u.fragment and dest.suffix=='.html': self.assertIn(unquote(u.fragment),Page(dest.read_text()).ids,ref)

    def test_sources_resolve_and_clinical_data_is_self_contained(self):
        sources={s['id'] for s in data('sources')}
        self.assertGreaterEqual(len(sources),15)
        for name in ('lessons','sounds','syndromes','cases'):
            rows=data(name);self.assertEqual(len(rows),len({x['id'] for x in rows}))
            for row in rows:
                self.assertTrue(row['sources'],row['id'])
                self.assertTrue(set(row['sources'])<=sources,row['id'])
        self.assertEqual(len(data('lessons')),16)
        self.assertEqual(len(data('syndromes')),12)
        for lesson in data('lessons'):
            self.assertGreaterEqual(len(lesson['blocks']),4)
            self.assertGreater(len(' '.join(b['text'] for b in lesson['blocks'])),800)
            self.assertTrue(lesson['question'] and lesson['answer'])

    def test_cases_explain_every_alternative_and_use_valid_answers(self):
        cases=data('cases');self.assertEqual(len(cases),20)
        for q in cases:
            self.assertEqual(len(q['options']),4)
            self.assertIn(q['correct'],range(4))
            self.assertTrue(all(bool(label.strip()) and len(explanation)>20 for label,explanation in q['options']))
            self.assertTrue(q['rule'])
        self.assertEqual({q['correct'] for q in cases},{0,1,2,3})

    def test_audio_bytes_durations_and_licenses(self):
        audio=data('audio-manifest');self.assertEqual(len(audio),30)
        self.assertEqual(len({a['sha256'] for a in audio}),30)
        self.assertEqual(sum(x['kind']=='simulation' for x in audio),25)
        for entry in audio:
            path=MODULE/entry['file'];self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),entry['sha256'])
            with wave.open(str(path)) as sound:
                self.assertEqual(sound.getsampwidth(),2)
                self.assertAlmostEqual(sound.getnframes()/sound.getframerate(),entry['duration'],places=2)
                self.assertEqual(sound.getframerate(),entry['sampleRate'])
        for record in data('recordings'):
            self.assertEqual(record['license'],'CC BY 2.0')
            self.assertIn('Pediátrica',record['population'])
            self.assertIn(record['sha256'],(MODULE/'AUDIO_LICENSES.md').read_text())
            self.assertNotIn('MOESM3_',record['source'])

    def test_generated_course_matches_source_and_declares_limitations(self):
        bundle=(MODULE/'data/course.js').read_text()
        course=json.loads(bundle.split('=',1)[1].strip().rstrip(';'))
        for name in ('lessons','cases','sources','sounds','recordings','syndromes'):
            self.assertEqual(course[name],data(name))
        self.assertEqual(len(course['flashcards']),49)
        self.assertEqual(len(course['checklist']),18)
        manifest=json.loads((MODULE/'module.manifest.json').read_text())
        self.assertTrue(manifest['clinicalReviewRequired'])
        self.assertTrue(manifest['publication']['publicPreview'])
        html=(MODULE/'index.html').read_text()
        self.assertIn('25 simulações originais e 5 gravações pediátricas',html)
        self.assertNotRegex(html,r'<audio[^>]*\bautoplay\b')

    def test_worker_ranges_offline_and_cache_isolation(self):
        script=r'''
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const events={},entries=new Map(),deleted=[];let fail=false;
const root='https://example.com/aldenirmed89/24_Semiologia/';
const key=r=>typeof r==='string'?r:r.url;
const cache={addAll:async urls=>{for(const url of urls)entries.set(key(url),new Response('0123456789',{headers:{'Content-Type':'audio/wav'}}))},match:async r=>entries.get(key(r))?.clone(),put:async(r,v)=>entries.set(key(r),v)};
const sandbox={URL,Response,Request,Headers,
 self:{location:{href:root+'sw.js'},addEventListener:(n,f)=>events[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}},
 caches:{open:async()=>cache,keys:async()=>['antigravity-root-v35','aldenirmed89-semiologia-neuro-v2','aldenirmed89-semiologia-cardio-old','aldenirmed89-semiologia-cardio-v2'],delete:async k=>deleted.push(k)},
 fetch:async request=>{if(fail)throw Error('offline');if(String(request).includes('audio-manifest'))return Response.json([{file:'assets/audio/normal.wav'}]);return new Response('network')}
};
vm.runInNewContext(fs.readFileSync('24_Semiologia/sw.js','utf8'),sandbox);
async function dispatch(name){let p;events[name]({waitUntil:x=>p=x});await p;}
async function get(path,range,mode='cors'){let p;events.fetch({request:{url:new URL(path,root).href,method:'GET',mode,headers:new Headers(range?{'Range':range}:{})},respondWith:x=>p=x});return p;}
(async()=>{
 await dispatch('install');await dispatch('activate');assert.deepEqual(deleted,['aldenirmed89-semiologia-cardio-old','aldenirmed89-semiologia-cardio-v2']);
 assert.equal(await get('../01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/index.html'),undefined);
 fail=true;const file='Cardiovascular/assets/audio/normal.wav';
 let r=await get(file,'bytes=2-5');assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 2-5/10');assert.equal(await r.text(),'2345');
 r=await get(file,'bytes=-3');assert.equal(await r.text(),'789');
 r=await get(file,'bytes=7-');assert.equal(await r.text(),'789');
 assert.equal((await get(file,'bytes=90-')).status,416);
 assert.equal((await get(file,'bytes=0-1,4-5')).status,416);
 assert.equal(await(await get(file)).text(),'0123456789');
 assert.equal(await(await get('Cardiovascular/index.html',null,'navigate')).text(),'0123456789');
})().catch(e=>{console.error(e);process.exit(1)});
'''
        result=subprocess.run(['node','-e',script],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)

if __name__=='__main__':unittest.main()
