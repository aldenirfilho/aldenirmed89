"""Execute navigation state transitions without external test dependencies."""
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class NavigationRegressions(unittest.TestCase):
    def run_node(self, script):
        result = subprocess.run(['node', '-e', script], cwd=ROOT, text=True,
                                capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_course_search_tabs_anchors_keyboard_and_reduced_motion(self):
        self.run_node(r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Element {
  constructor(id,text='') {
    this.id=id;this.textContent=text;this.value='';this.dataset={};this.attrs={};this.events={};
    const state=new Set();
    this.classList={contains:n=>state.has(n),add:n=>state.add(n),remove:n=>state.delete(n),
      toggle(n,on){if(on)state.add(n);else state.delete(n)}};
  }
  setAttribute(k,v){this.attrs[k]=v}
  removeAttribute(k){delete this.attrs[k]}
  getAttribute(k){return this.attrs[k]}
  addEventListener(k,fn){this.events[k]=fn}
  focus(){this.focused=true}
  scrollIntoView(options){this.scrolled=options}
}
const search=new Element('nm-search'),hint=new Element('nm-search-hint'),top=new Element('btn-top');
const root=new Element('html'),section=new Element('s10');
const panels=[new Element('qt1','Ipsi e contra'),new Element('qt2','Doze perguntas')];
panels.forEach(p=>p.classList.add('tabpanel'));
const tabs=panels.map(p=>{const b=new Element('');b.dataset.tab=p.id;return b});
const blocks=[new Element('b1','Wallenberg'),new Element('b2','Medula'),...panels];
const byId=Object.fromEntries([search,hint,top,section,...panels].map(x=>[x.id,x]));
const events={};let scrolled;
const selectors={'#nm-nav a':[],'.nm-section':[],
  '.block[data-search], .tabpanel[data-search]':blocks,
  '.bench, .nm-hero, .nm-section > .intro':[],'.tabpanel':panels,'#qt-tabs button':tabs};
const document={documentElement:root,querySelector:s=>byId[s.slice(1)],
  querySelectorAll:s=>selectors[s]||[],getElementById:id=>byId[id],
  addEventListener:(n,f)=>events[n]=f};
const window={matchMedia:()=>({matches:false}),addEventListener:()=>{},
  requestAnimationFrame:f=>f(),scrollTo:options=>scrolled=options};
const source=fs.readFileSync('01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/assets/aprofundamento.js','utf8');
vm.runInNewContext(source.split('/* ===================== Checklist do exame')[0]+'})();',{document,window});
search.value='Wallenberg';search.events.input();
assert.equal(panels[1].classList.contains('hidden-by-search'),true);
tabs[1].events.click();
assert.equal(search.value,'');
assert.equal(panels[1].classList.contains('hidden-by-search'),false);
assert.equal(panels[1].classList.contains('show'),true);
assert.equal(tabs[1].attrs['aria-selected'],'true');
assert.equal(tabs[0].tabIndex,-1);
let prevented=false;
tabs[1].events.keydown({key:'ArrowRight',preventDefault(){prevented=true}});
assert.equal(prevented,true);assert.equal(tabs[0].focused,true);
assert.equal(panels[0].classList.contains('show'),true);
search.value='Wallenberg';search.events.input();
const link=new Element('link');link.attrs.href='#s10';
root.classList.add('a11y-reduce-motion');
events.click({target:{closest:()=>link},button:0});
assert.equal(search.value,'');assert.equal(section.scrolled.behavior,'auto');
assert.equal(section.focused,true);
top.events.click();assert.equal(scrolled.behavior,'auto');
assert.equal(hint.attrs['aria-live'],'polite');
''')

    def test_animation_failure_still_releases_the_page(self):
        self.run_node(r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8');
const source=html.slice(html.indexOf('function finishMission('),html.indexOf('if(missionIntro&&missionEmblem){'));
const classes=()=>({add(){},remove(){}});
const button=()=>({classList:classes(),setAttribute(){},removeAttribute(){},focus(){},
  getBoundingClientRect:()=>({left:0,top:0,width:44,height:44})});
const intro={hidden:false,classList:classes()};let unlocked=false;const timers=[];
const context={missionIntro:intro,missionEmblem:button(),missionStartSound:button(),
  missionStartSilent:button(),missionSkip:button(),missionCountdown:{},missionRunning:false,
  missionCore:{...button(),offsetWidth:200,animate(){throw Error('Animation unavailable')}},
  missionAnimations:[],missionTimers:[],MISSION_DURATION:10000,MISSION_INTRO_KEY:'test',
  missionLater:(fn,delay)=>timers.push({fn,delay}),clearMissionTimers(){},clearMissionAnimations(){},
  stopMissionAudio(){},setMissionStatus(){},missionHasReducedMotion:()=>false,
  performance:{now:()=>0},window:{setInterval:()=>1},sessionStorage:{setItem(){}},
  document:{body:{classList:{add(){},remove(){unlocked=true}}}}};
vm.runInNewContext(source+';launchMission(false);',context);
const exit=timers.find(t=>t.delay===10000);assert.ok(exit,'Exit timer survives animation failure');
exit.fn();timers.find(t=>t.delay===390).fn();
assert.equal(intro.hidden,true);assert.equal(unlocked,true);
''')

    def test_return_from_browser_cache_clears_transient_panels(self):
        self.run_node(r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8');
const source=html.slice(html.indexOf('/* Voltar/avançar restaura'),html.indexOf('const siteHeader='));
const events={},calls=[];
vm.runInNewContext(source,{window:{addEventListener:(name,fn)=>events[name]=fn},
  missionIntro:{hidden:false},finishMission:options=>calls.push(['mission',options]),
  closeDrawer:()=>calls.push(['drawer']),setSoundConsole:()=>calls.push(['sound']),
  setSettingsPanel:()=>calls.push(['settings'])});
events.pageshow({persisted:false});assert.equal(calls.length,0);
events.pageshow({persisted:true});
assert.deepEqual(calls.map(x=>x[0]),['mission','drawer','sound','settings']);
assert.equal(calls[0][1].focus,false);
events.pagehide();assert.equal(calls.at(-1)[1].immediate,true);
''')

    def test_course_versioned_dependencies_are_available_for_offline_navigation(self):
        from html.parser import HTMLParser
        import re
        class Assets(HTMLParser):
            def __init__(self):
                super().__init__();self.urls=[]
            def handle_starttag(self, tag, attrs):
                attrs=dict(attrs)
                url=attrs.get('src') or attrs.get('href','')
                if tag in ('script','link') and url.startswith('assets/'):
                    self.urls.append(url)
        page=Assets()
        relative='01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/'
        page.feed((ROOT/relative/'aprofundamento.html').read_text())
        cache=set(re.findall(r'"(\./[^"\n]+)"',(ROOT/'sw.js').read_text()))
        for url in page.urls:
            self.assertIn('./'+relative+url,cache)


if __name__ == '__main__':
    unittest.main()
