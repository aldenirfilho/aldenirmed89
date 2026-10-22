#!/usr/bin/env python3
"""Browser checks for the public Fauna/Ecosystem navigation, local or deployed.

Requires Playwright and Chromium. Does not submit forms or make donations.
"""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FAUNA = 'https://aldenirfilho.github.io/aldenirmed89/apps/bolsa-ajuda-fauna/'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', help='Optional deployed portal base URL; omitted means local repository')
    parser.add_argument('--output', default='fauna-ecosystem-check')
    args = parser.parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    server = None
    if args.base_url:
        base = args.base_url.rstrip('/') + '/'
    else:
        server = ThreadingHTTPServer(('127.0.0.1', 8765), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
        Thread(target=server.serve_forever, daemon=True).start()
        base = 'http://127.0.0.1:8765/'
    report = {'base': base, 'checks': [], 'javascriptErrors': [], 'externalPhotosRetested': False}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.on('pageerror', lambda error: report['javascriptErrors'].append(str(error)))
            page.goto(base + 'ecossistema/index.html#site-bolsa-ajuda-fauna', wait_until='domcontentloaded')
            card = page.locator('#site-bolsa-ajuda-fauna')
            card.wait_for()
            assert card.locator('a').get_attribute('href') == FAUNA
            page.wait_for_function("document.querySelector('#site-bolsa-ajuda-fauna img')?.naturalWidth > 0")
            report['checks'].append('directory entry, destination, deep link and local preview')
            page.locator('#sitesSearch').fill('fauna')
            assert page.locator('#sitesGrid .site-card').count() == 1
            page.locator('#sitesCategory').select_option(label='Ciência e natureza')
            assert card.is_visible()
            card.scroll_into_view_if_needed()
            page.screenshot(path=str(output / 'directory.png'))
            report['checks'].append('directory text search and category filter')
            page.locator('#searchInput').fill('Fauna 360')
            page.locator('#rootSelect').select_option('biodiversidade')
            assert page.locator('#projectGrid .project-card').count() == 1
            page.locator('#projectGrid summary').click()
            assert page.locator('#projectGrid a[href="' + FAUNA + '"]').is_visible()
            assert page.locator('#projectGrid a[href="' + FAUNA + '#instituicoes"]').is_visible()
            report['checks'].append('canonical biodiversity family has direct public links')
            page.goto(base + 'ecossistema/mapa.html#projeto=bolsa-ajuda-fauna', wait_until='domcontentloaded')
            public_link = page.locator('a[aria-label="Abrir site: Bolsa de Ajuda · Fauna 360° (nova aba)"]:visible').first
            public_link.wait_for()
            assert public_link.get_attribute('href') == FAUNA
            page.screenshot(path=str(output / 'map-desktop.png'))
            report['checks'].append('map selects fauna from shareable hash and opens correct destination')
            for width in (390, 320):
                page.set_viewport_size({'width': width, 'height': 844})
                page.goto(base + 'ecossistema/mapa.html#projeto=bolsa-ajuda-fauna&vista=lista', wait_until='domcontentloaded')
                page.locator('a[aria-label="Abrir site: Bolsa de Ajuda · Fauna 360° (nova aba)"]:visible').first.wait_for()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'Map overflow at {width}'
                if width == 390:
                    page.screenshot(path=str(output / 'map-mobile.png'))
                page.goto(base + 'apps/bolsa-ajuda-fauna/', wait_until='domcontentloaded')
                page.wait_for_function("document.querySelectorAll('#animal-grid .animal-card').length === 26")
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'Fauna overflow at {width}'
                assert page.locator('a.portal').get_attribute('href') == '../../ecossistema/index.html#site-bolsa-ajuda-fauna'
                assert page.locator('a[href="../../ecossistema/mapa.html#projeto=bolsa-ajuda-fauna"]').count() == 1
                report['checks'].append(f'map and fauna mobile layout at {width}px; catalogue retained')
            page.locator('a.portal').click()
            page.locator('#site-bolsa-ajuda-fauna').wait_for()
            assert page.url.endswith('#site-bolsa-ajuda-fauna')
            report['checks'].append('Fauna header returns to its ecosystem card')
            context.close()
            context = browser.new_context(java_script_enabled=False, service_workers='block')
            page = context.new_page()
            for route in ('ecossistema/index.html', 'ecossistema/mapa.html'):
                page.goto(base + route, wait_until='domcontentloaded')
                assert page.locator(f'a[href="{FAUNA}"]').count() == 1
            report['checks'].append('both directories retain navigation without JavaScript')
            context.close()
            browser.close()
            assert not report['javascriptErrors'], report['javascriptErrors']
            report['status'] = 'passed'
    except Exception as exc:
        report['status'] = 'failed'
        report['error'] = str(exc)
        raise
    finally:
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        if server:
            server.shutdown()
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
