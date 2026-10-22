#!/usr/bin/env python3
"""Browser checks against real local image files and the deterministic studio."""
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'cinematic-check'
OUT.mkdir(exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
report = {'checks': [], 'javascriptErrors': []}
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 1040}, device_scale_factor=1)
        page.on('pageerror', lambda error: report['javascriptErrors'].append(str(error)))
        page.goto(base + '/ecossistema/index.html#sites-publicos', wait_until='networkidle')
        expect(page.locator('.site-art')).to_have_count(24)
        loaded = page.locator('.site-art img').evaluate_all('async imgs => { imgs.forEach(i => i.loading="eager"); await Promise.all(imgs.map(i => i.decode())); return imgs.filter(i => i.naturalWidth===960 && i.naturalHeight===540).length; }')
        assert loaded == 24
        report['checks'].append('24_real_local_webp_covers_loaded')
        page.locator('#sites-publicos').evaluate('(e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - 90)')
        page.screenshot(path=str(OUT / 'directory-desktop.png'))
        page.locator('#sitesSearch').fill('fauna')
        expect(page.locator('.site-art')).to_have_count(1)
        assert page.locator('.site-art').get_attribute('href').endswith('/apps/bolsa-ajuda-fauna/')
        report['checks'].append('search_rerender_and_fauna_link_preserved')
        page.locator('#sitesClear').click()
        page.locator('#sitesCategory').select_option('Ciência e natureza')
        expect(page.locator('.site-art')).to_have_count(4)
        report['checks'].append('nature_category_filter')
        page.locator('#sitesClear').click()
        for width in [390, 320]:
            page.set_viewport_size({'width': width, 'height': 844})
            page.locator('#sitesSearch').fill('fauna')
            expect(page.locator('.site-art')).to_have_count(1)
            page.locator('#site-bolsa-ajuda-fauna').scroll_into_view_if_needed()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            if width == 390:
                page.locator('#site-bolsa-ajuda-fauna').screenshot(path=str(OUT / 'fauna-mobile.png'))
        report['checks'].append('directory_mobile_390_320')
        page.emulate_media(reduced_motion='reduce')
        assert page.locator('.site-art img').evaluate('(e) => getComputedStyle(e).transitionDuration') == '0s'
        report['checks'].append('reduced_motion_respected')

        page.goto(base + '/ecossistema/estudio-360x/index.html', wait_until='networkidle')
        page.wait_for_function('document.getElementById("brief").value.length > 100')
        expect(page.locator('#project option')).to_have_count(24)
        assert '\n\n' in page.locator('#brief').input_value()
        page.locator('#project').select_option('bolsa-ajuda-fauna')
        page.locator('#format').select_option('9:16')
        page.locator('#energy').evaluate('(e) => { e.value="5"; e.dispatchEvent(new Event("input", {bubbles:true})); }')
        page.locator('#palette').select_option('nature')
        page.locator('#extra').fill('Acentuar o movimento da água.')
        instruction = page.locator('#brief').input_value()
        assert all(word in instruction for word in ['Fauna', '5/5', '9:16', 'Acentuar'])
        report['checks'].append('agent_project_format_intensity_palette_user_input')
        with page.expect_download() as download:
            page.locator('#export-json').click()
        download.value.save_as(str(OUT / 'brief.json'))
        brief = json.loads((OUT / 'brief.json').read_text())
        assert brief['project']['id'] == 'bolsa-ajuda-fauna'
        assert brief['execution'] == 'briefing-only-no-automatic-generation'
        with page.expect_download() as download:
            page.locator('#export-batch').click()
        download.value.save_as(str(OUT / 'batch.json'))
        assert len(json.loads((OUT / 'batch.json').read_text())['items']) == 24
        report['checks'].append('individual_and_batch_json_exports')
        page.locator('#format').select_option('16:9')
        page.set_viewport_size({'width': 1440, 'height': 1050})
        page.screenshot(path=str(OUT / 'studio-desktop.png'))
        for width in [390, 320]:
            page.set_viewport_size({'width': width, 'height': 844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        report['checks'].append('studio_mobile_390_320')
        fallback = browser.new_page(viewport={'width': 1440, 'height': 900})
        fallback.route('**/data/cinematic-360x.json', lambda route: route.abort())
        fallback.goto(base + '/ecossistema/index.html#sites-publicos', wait_until='networkidle')
        expect(fallback.locator('#sitesGrid .site-card-image')).to_have_count(24)
        expect(fallback.locator('.site-art')).to_have_count(0)
        report['checks'].append('original_directory_survives_style_failure')
        assert not report['javascriptErrors'], report['javascriptErrors']
        browser.close()
finally:
    server.shutdown()
    (OUT / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
