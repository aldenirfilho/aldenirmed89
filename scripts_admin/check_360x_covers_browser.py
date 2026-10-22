#!/usr/bin/env python3
"""Exercise cover assets and navigation on a local HTTP test server."""
import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'cover-browser-check'; OUT.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/ecossistema/index.html'
report={'imageCount':0,'checks':[],'javascriptErrors':[]}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':1440,'height':1080},device_scale_factor=1)
  page.on('pageerror',lambda e:report['javascriptErrors'].append(str(e)))
  page.goto(base+'#sites-publicos',wait_until='networkidle')
  page.wait_for_selector('#sitesGrid .site-card-image')
  expected=len(json.loads((ROOT/'ecossistema/data/sites-360x.json').read_text())['projects'])
  assert page.locator('#sitesGrid .site-card-image').count()==expected
  loaded=page.eval_on_selector_all('#sitesGrid .site-card-image','async imgs => { imgs.forEach(i => i.loading="eager"); await Promise.all(imgs.map(i=>i.decode())); return imgs.filter(i=>i.naturalWidth===1200 && i.naturalHeight===675).length; }')
  assert loaded==expected;report['imageCount']=loaded;report['checks'].append('all_real_local_svg_images_loaded')
  assert len(set(page.locator('#sitesGrid .site-card-image').evaluate_all('(imgs)=>imgs.map(i=>i.src)')))==expected
  report['checks'].append('unique_image_per_site')
  page.locator('#sitesSearch').fill('fauna')
  assert page.locator('#sitesGrid .site-card').count()==1
  assert page.locator('#site-bolsa-ajuda-fauna .site-link').get_attribute('href').endswith('/apps/bolsa-ajuda-fauna/')
  report['checks'].append('search_and_fauna_destination')
  page.locator('#sitesClear').click()
  page.locator('#sitesCategory').select_option('Ciência e natureza')
  assert page.locator('#sitesGrid .site-card').count()==4
  report['checks'].append('category_filter_four_nature_projects')
  page.locator('#sitesClear').click()
  page.evaluate('document.documentElement.dataset.theme="dark"')
  page.locator('#sites-publicos').evaluate('(e)=>scrollTo(0,e.getBoundingClientRect().top+scrollY-90)')
  page.screenshot(path=str(OUT/'desktop-dark.png'))
  page.evaluate('document.documentElement.dataset.theme="light"')
  page.screenshot(path=str(OUT/'desktop-light.png'))
  report['checks'].append('light_and_dark_reading_themes')
  for width in [390,320]:
   page.set_viewport_size({'width':width,'height':844})
   page.locator('#sitesSearch').fill('fauna')
   page.locator('#sites-publicos').scroll_into_view_if_needed()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   img=page.locator('#site-bolsa-ajuda-fauna .site-card-image')
   img.wait_for();box=img.bounding_box()
   assert abs(box['width']/box['height']-16/9)<.02
   if width==390:page.locator('#site-bolsa-ajuda-fauna').screenshot(path=str(OUT/'mobile-fauna.png'))
  report['checks'].append('mobile_390_320_no_overflow_or_crop')
  page.emulate_media(reduced_motion='reduce')
  assert page.locator('.site-card').first.evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s'
  report['checks'].append('reduced_motion')
  assert not report['javascriptErrors']
  browser.close()
finally:
 server.shutdown()
 (OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
