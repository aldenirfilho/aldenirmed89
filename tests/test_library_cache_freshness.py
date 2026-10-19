"""Regressões de atualização e uso offline dos índices públicos da Biblioteca."""

from pathlib import Path
import shutil
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]

WORKER_SCENARIOS = r'''
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const manifests = [
  'biblioteca_catalogo.json',
  'biblioteca_documentos_manifest.json',
  'biblioteca_previews.json',
  'biblioteca_brain_connections.json',
  'biblioteca_inbox_manifest_auto.json',
  'biblioteca_taxonomia_temas.json'
];

function worker(scope) {
  const entries = new Map(), events = {}, requests = [];
  const origin = new URL(scope).origin;
  let network = 'online';
  const key = request => typeof request === 'string' ? request : request.url;
  const cache = {
    match: async request => entries.get(key(request))?.clone(),
    put: async (request, response) => entries.set(key(request), response.clone())
  };
  const sandbox = {
    URL, Request, Response, Headers,
    self: {
      location: {href: scope + 'sw.js', origin},
      registration: {scope},
      addEventListener: (name, listener) => { events[name] = listener; }
    },
    caches: {open: async () => cache, match: cache.match},
    fetch: async (request, options) => {
      requests.push({url: key(request), options});
      if (network === 'offline') throw new Error('network offline');
      return Response.json(
        {edition: 'new', items: ['lattes2026']},
        {status: network === 'unavailable' ? 503 : 200}
      );
    }
  };
  vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), sandbox);
  return {
    entries, requests,
    network: state => { network = state; },
    get: (path, init) => {
      let response;
      const request = new Request(new URL(path, scope), init);
      events.fetch({request, respondWith: value => { response = value; }});
      return response;
    }
  };
}

async function run(scenario) {
  for (const scope of ['https://example.com/aldenirmed89/', 'https://example.com/']) {
    if (scenario === 'online') {
      for (const filename of manifests) {
        const state = worker(scope);
        const path = '02_Biblioteca_IA_Engine/data/' + filename + '?release=20261018';
        const url = new URL(path, scope).href;
        state.entries.set(url, Response.json({edition: 'old', items: []}));
        assert.equal((await (await state.get(path)).json()).edition, 'new', filename);
        assert.equal(state.requests.length, 1, filename);
        assert.equal(state.requests[0].options.cache, 'no-store', filename);
        assert.equal((await state.entries.get(url).clone().json()).edition, 'new', filename);
        state.network('offline');
        assert.equal((await (await state.get(path)).json()).edition, 'new', filename);
      }
    } else if (scenario === 'offline') {
      for (const filename of manifests) {
        const state = worker(scope);
        const path = '02_Biblioteca_IA_Engine/data/' + filename;
        const url = new URL(path, scope).href;
        state.entries.set(url, Response.json({edition: 'saved'}));
        for (const failure of ['offline', 'unavailable']) {
          state.network(failure);
          assert.equal((await (await state.get(path)).json()).edition, 'saved', filename);
          assert.equal((await state.entries.get(url).clone().json()).edition, 'saved', filename);
        }
        state.entries.delete(url);
        state.entries.set('./offline.html', new Response('<html>offline</html>'));
        state.network('offline');
        await assert.rejects(state.get(path), /network offline/, filename);
      }
    } else if (scenario === 'static') {
      const paths = [
        'assets/site-navigation.css',
        '02_Biblioteca_IA_Engine/previews/docx-0123456789abcdef0123.html',
        '02_Biblioteca_IA_Engine/data/biblioteca_ingestao_20260911.json',
        'data/unrelated.json',
        'other/02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json'
      ];
      for (const path of paths) {
        const state = worker(scope);
        state.entries.set(new URL(path, scope).href, new Response('cached static'));
        assert.equal(await (await state.get(path)).text(), 'cached static', path);
        assert.equal(state.requests.length, 0, path);
      }
    } else if (scenario === 'guards') {
      const state = worker(scope);
      const canonical = '02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json';
      assert.equal(state.get(canonical, {method: 'POST'}), undefined);
      assert.equal(state.get('https://external.example/' + canonical), undefined);
      assert.equal(state.requests.length, 0);
      const path = 'assets/site-navigation.css';
      state.entries.set(new URL(path, scope).href, new Response('cached static'));
      const response = await state.get(path, {headers: {range: 'bytes=0-20'}});
      assert.equal((await response.json()).edition, 'new');
      assert.equal(state.requests.length, 1);
    } else {
      throw new Error('Unknown scenario: ' + scenario);
    }
  }
}

run(process.argv[1]).catch(error => { console.error(error); process.exit(1); });
'''


class LibraryCacheFreshnessTests(unittest.TestCase):
    def run_scenario(self, scenario):
        node = shutil.which('node')
        if not node:
            self.skipTest('Node.js indisponível para executar o service worker em VM')
        result = subprocess.run(
            [node, '-e', WORKER_SCENARIOS, scenario],
            cwd=ROOT, capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_canonical_manifests_replace_stale_cache_from_network(self):
        self.run_scenario('online')

    def test_canonical_manifests_keep_offline_json_and_reject_html_fallback(self):
        self.run_scenario('offline')

    def test_static_assets_and_unrelated_json_keep_cache_first(self):
        self.run_scenario('static')

    def test_origin_method_and_range_guards_remain_effective(self):
        self.run_scenario('guards')


if __name__ == '__main__':
    unittest.main()
