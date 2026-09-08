"""Independent app identity and service worker isolation regressions."""
import json
import struct
import subprocess
import unittest
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / '01_Modulos_Clinicos/Semiologia_Neurologica_Topografica'


class NeuroAppTests(unittest.TestCase):
    def test_app_identity_and_icons_are_independent(self):
        base = 'https://example.com/aldenirmed89/'
        manifest_url = base + MODULE.relative_to(ROOT).as_posix() + '/manifest.webmanifest'
        manifest = json.loads((MODULE / 'manifest.webmanifest').read_text())
        root = json.loads((ROOT / 'manifest.webmanifest').read_text())
        scope = urljoin(manifest_url, manifest['scope'])
        self.assertNotEqual(urljoin(manifest_url, manifest['id']), urljoin(base, root['id']))
        self.assertTrue(urljoin(manifest_url, manifest['start_url']).startswith(scope))
        self.assertEqual(manifest['display'], 'standalone')
        for shortcut in manifest['shortcuts']:
            self.assertTrue(urljoin(manifest_url, shortcut['url']).startswith(scope))
        for icon in manifest['icons']:
            payload = (MODULE / icon['src']).read_bytes()
            width, height = struct.unpack('>II', payload[16:24])
            self.assertEqual(f'{width}x{height}', icon['sizes'])
            self.assertGreater(len(payload), 1024)
        for page in ['index.html', 'aprofundamento.html', 'offline.html']:
            self.assertIn('rel="manifest" href="manifest.webmanifest"', (MODULE/page).read_text())

    def test_worker_offline_fallback_and_cache_isolation(self):
        script = r'''
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const events={},deleted=[],entries=new Map();let networkFails=false,installList=[];
const root='https://example.com/aldenirmed89/01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/';
const normalize=u=>new URL(typeof u==='string'?u:u.url,root).href.split('?')[0];
const cache={
 async addAll(urls){installList=urls;for(const url of urls)entries.set(normalize(url),new Response('cached:'+url));},
 async put(request,response){entries.set(normalize(request),response)},
 async match(request){return entries.get(normalize(request))?.clone()}
};
const sandbox={URL,Response,Request,
 self:{location:{href:root+'sw.js'},addEventListener:(n,f)=>events[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}},
 caches:{open:async()=>cache,keys:async()=>['antigravity-root-v33','aldenirmed89-semiologia-neuro-old','respirasense-v1','aldenirmed89-semiologia-neuro-v1','aldenirmed89-semiologia-neuro-v2'],delete:async k=>deleted.push(k)},
 fetch:async()=>{if(networkFails)throw Error('offline');return new Response('fresh')}
};
vm.runInNewContext(fs.readFileSync('01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/sw.js','utf8'),sandbox);
async function dispatch(name){let done;events[name]({waitUntil:p=>done=p});await done;}
async function request(path,mode='navigate',method='GET'){let response;events.fetch({request:{url:new URL(path,root).href,method,mode},respondWith:p=>response=p});return response;}
(async()=>{
 await dispatch('install');await dispatch('activate');
 assert.deepEqual(deleted,['aldenirmed89-semiologia-neuro-old','aldenirmed89-semiologia-neuro-v1']);
 assert(installList.includes('./aprofundamento.html'));
 assert.equal(await request('../../index.html'),undefined,'Do not intercept the portal');
 assert.equal(await request('index.html','navigate','POST'),undefined);
 assert.equal(await (await request('index.html')).text(),'fresh');
 networkFails=true;
 assert.equal(await (await request('index.html?app=1')).text(),'fresh');
 assert((await (await request('missing.html')).text()).includes('offline.html'));
 assert((await (await request('./')).text()).includes('fresh'));
 assert((await (await request('assets/aprofundamento.js?v=1.1.2','cors')).text()).includes('aprofundamento.js'));
 assert.equal((await request('assets/missing.png','cors')).type,'error');
 assert((await (await request('../../assets/aldenirmed89-mystic.css','cors')).text()).includes('mystic.css'));
})().catch(e=>{console.error(e);process.exit(1)});
'''
        result = subprocess.run(['node', '-e', script], cwd=ROOT, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout+result.stderr)


if __name__ == '__main__':
    unittest.main()
