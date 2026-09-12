import hashlib
import importlib.util
import json
from pathlib import Path, PurePosixPath
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class OriginalAppIconTests(unittest.TestCase):
    def test_release_preserves_original_bytes_and_manifest_identity(self):
        folder = ROOT / 'assets/icons/aerospace-v2'
        provenance = json.loads((folder / 'provenance.json').read_text())
        self.assertEqual(provenance['masterSha256'], '1b0332baa08c1e9aebc98868ad2714a1a7c6b035302d28699fd052de5e324850')
        for name, record in provenance['files'].items():
            content = (folder / name).read_bytes()
            self.assertEqual(content, (ROOT / record['source']).read_bytes())
            self.assertEqual(hashlib.sha256(content).hexdigest(), record['sha256'])
        self.assertEqual(hashlib.sha256((folder / 'icon-1024.png').read_bytes()).hexdigest(), provenance['masterSha256'])
        manifest = json.loads((ROOT / 'manifest.webmanifest').read_text())
        self.assertEqual([manifest[k] for k in ('id', 'start_url', 'scope')], ['./'] * 3)
        for icon in manifest['icons'] + [i for shortcut in manifest['shortcuts'] for i in shortcut['icons']]:
            self.assertIn('assets/icons/aerospace-v2/', icon['src'])
            self.assertTrue((ROOT / icon['src']).is_file())
            self.assertNotIn('maskable', icon.get('purpose', 'any'))

    def test_nested_metadata_preserves_code_custom_apps_and_previews(self):
        spec = importlib.util.spec_from_file_location('original_brand_builder', ROOT / 'scripts_admin/build_public_site.py')
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        relative = PurePosixPath('24_Semiologia/Cardiovascular/index.html')
        code = '<script>const sample = `<link rel="icon" href="../../favicon.ico">`;</script>'
        html = '<html><head>' + code + '<link href="../../favicon.ico" rel="shortcut icon"></head><body>../../favicon.ico</body></html>'
        result = builder.restore_original_brand_metadata(html, relative, '../../')
        self.assertIn(code, result)
        self.assertIn('<body>../../favicon.ico</body>', result)
        self.assertIn('href="../../assets/icons/aerospace-v2/favicon.ico"', result)
        self.assertIn('sizes="180x180"', result)
        self.assertIn('property="og:image"', result)
        own = builder.restore_original_brand_metadata('<head><link rel="icon" href="assets/neuro.png"><meta property="og:image" content="custom.png"></head>', relative, '../../')
        self.assertIn('href="assets/neuro.png"', own)
        self.assertNotIn('apple-touch-icon', own)
        self.assertIn('content="custom.png"', own)
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            preview = site / '02_Biblioteca_IA_Engine/previews/test.html'
            preview.parent.mkdir(parents=True)
            preview.write_text('<html><head></head><body></body></html>')
            config = {'enabled': False, 'siteCode': '', 'visitorCounterEnabled': False}
            builder.inject_public_metadata(site, config)
            first = preview.read_text()
            self.assertNotIn('aerospace-v2', first)
            builder.inject_public_metadata(site, config)
            self.assertEqual(first, preview.read_text())

    def test_workers_refresh_stale_manifest_and_keep_offline_json(self):
        script = r'''
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
async function check(file, requestPath='manifest.webmanifest') {
 const origin='https://example.com', root=origin+'/aldenirmed89/';
 const scope=root+(file.startsWith('24_')?'24_Semiologia/':'');
 const entries=new Map(), events={};let offline=false,status=200,options;
 const key=r=>typeof r==='string'?r:r.url;
 const cache={match:async r=>entries.get(key(r))?.clone(),put:async(r,v)=>entries.set(key(r),v)};
 const sandbox={URL,Request,Response,Headers,
  self:{location:{href:scope+'sw.js',origin},registration:{scope},addEventListener:(n,f)=>events[n]=f},
  caches:{open:async()=>cache,match:async()=>new Response('<html>offline</html>')},
  fetch:async(r,o)=>{options=o;if(offline)throw Error('offline');return Response.json({icons:[{src:'assets/icons/aerospace-v2/icon-192.png'}]},{status})}
 };
 vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox);
 const url=root+requestPath, request=new Request(url);
 const get=()=>{let p;events.fetch({request,respondWith:v=>p=v});return p;};
 entries.set(url,Response.json({icons:[{src:'orange.png'}]}));
 assert.match(JSON.stringify(await(await get()).json()),/aerospace-v2/);
 assert.equal(options.cache,'no-store');
 offline=true;assert.match(JSON.stringify(await(await get()).json()),/aerospace-v2/);
 offline=false;status=503;assert.match(JSON.stringify(await(await get()).json()),/aerospace-v2/);
 entries.clear();offline=true;await assert.rejects(get(),/offline/);
}
(async()=>{await check('sw.js');await check('24_Semiologia/sw.js');await check('sw.js','18_Centro_Tripulacao/data/daily-visits.json');await check('sw.js','18_Centro_Tripulacao/data/public-metrics.json')})().catch(e=>{console.error(e);process.exit(1)});
'''
        result = subprocess.run(['node', '-e', script], cwd=ROOT, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
