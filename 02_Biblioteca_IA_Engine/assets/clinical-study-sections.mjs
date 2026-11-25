/** Public covers and navigation; study counts are computed only from the browser's private package. */
import {CLINICAL_STUDY_TOPICS,unitMatchesClinicalSection} from './clinical-study-topics.mjs?v=d54403641ae6b147';

const modes=[['flow','🧬 Resumos'],['cards','🃏 Flashcards'],['cases','🩺 Questões TEMI'],['exam','⏱ Simulado'],['review','🎯 Painel de erros']];
export function mountClinicalStudySections(host,{engine,player}={}){
  const doc=host.ownerDocument;
  const node=(tag,text,cls)=>{const element=doc.createElement(tag);if(text!==undefined)element.textContent=text;if(cls)element.className=cls;return element;};
  const root=node('section',undefined,'clinical-study-sections');root.setAttribute('aria-labelledby','clinical-study-heading');
  const intro=node('div',undefined,'clinical-study-intro');intro.append(node('p','TURBO TEMI 360X · UM FOCO POR VEZ','clinical-study-eyebrow'));
  const heading=node('h2','Escolha sua seção de estudo');heading.id='clinical-study-heading';intro.append(heading,node('p','Seis caminhos para resumos de passagens, flashcards, questões e revisão dirigida. Escolha o tema e o formato; o estudo abre logo abaixo.'));
  const status=node('p','Importe seu pacote privado no espaço abaixo para acessar o conteúdo do seu acervo.','clinical-study-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');intro.append(status);root.append(intro);
  const topicNavigation=node('nav',undefined,'clinical-study-topic-nav');topicNavigation.setAttribute('aria-label','Ir à seção clínica');
  for(const section of CLINICAL_STUDY_TOPICS){const link=node('a',section.title);link.href='#trilha-'+section.id;topicNavigation.append(link);}root.append(topicNavigation);
  const grid=node('div',undefined,'clinical-study-grid'),cards=new Map();let cachedSignature='',cachedPackage=null,unitSets=new Map(),totals=new Map(),disposed=false,busy=false;
  for(const section of CLINICAL_STUDY_TOPICS){
    const card=node('article',undefined,'clinical-study-card');card.id='trilha-'+section.id;card.dataset.clinicalTopic=section.id;card.setAttribute('aria-labelledby','trilha-'+section.id+'-title');
    const figure=node('figure'),image=node('img');image.src=new URL('./trilhas-clinicas/'+section.image,import.meta.url).href;image.alt=section.alt;image.width=1672;image.height=941;image.loading='lazy';image.decoding='async';
    figure.append(image,node('figcaption','Ilustração conceitual gerada por IA.'));
    const content=node('div',undefined,'clinical-study-card-body'),title=node('h3',section.title);title.id='trilha-'+section.id+'-title';content.append(node('p',section.subtitle,'clinical-study-subtitle'),title,node('p',section.objective,'clinical-study-objective'));
    const count=node('p','Conteúdo disponível após importar seu pacote.','clinical-study-count');count.dataset.clinicalCount=section.id;content.append(count);
    const actions=node('div',undefined,'clinical-study-actions');actions.setAttribute('role','group');actions.setAttribute('aria-label','Estudar '+section.title);
    for(const [mode,label]of modes){const button=node('button',label);button.type='button';button.dataset.studyMode=mode;button.setAttribute('aria-label',label.replace(/^\S+\s+/,'')+' · '+section.title);button.addEventListener('click',()=>open(section.id,mode));actions.append(button);}
    const link=node('a',section.publicLabel+' ↗','clinical-study-public-link');link.href=section.publicHref;content.append(actions,link);card.append(figure,content);cards.set(section.id,{card,count});grid.append(card);
  }
  root.append(grid,node('p','As capas e os atalhos são públicos. O conteúdo do seu pacote e o histórico de estudo são usados somente neste navegador. “Resumos” abre as micropartículas disponíveis, com a origem e a cobertura de cada passagem.','clinical-study-note'));host.replaceChildren(root);

  function select(id){for(const [key,{card}]of cards){const active=id===key;card.classList.toggle('clinical-study-active',active);card.dataset.clinicalActive=String(active);}}
  function update(event){
    if(disposed)return;
    const listed=engine.listPackages(),selected=event?.packageId||cachedPackage?.packageId||'';
    const signature=selected+'|'+listed.map(p=>[p.id,p.version,p.items].join(':')).join('|');
    if(signature!==cachedSignature||!cachedPackage){
      cachedSignature=signature;cachedPackage=engine.getPackage();unitSets=new Map();totals=new Map();
      for(const section of CLINICAL_STUDY_TOPICS){const matched=(cachedPackage?.units||[]).filter(u=>unitMatchesClinicalSection(u,section.id));unitSets.set(section.id,new Set(matched.map(u=>u.id)));totals.set(section.id,{units:matched.length,particles:matched.reduce((n,u)=>n+u.particles.length,0),cards:matched.reduce((n,u)=>n+u.cards.length,0),questions:matched.reduce((n,u)=>n+u.questions.length,0)});}
    }
    const errors=engine.listErrors();
    for(const section of CLINICAL_STUDY_TOPICS){const {count}=cards.get(section.id);if(!cachedPackage){count.textContent='Conteúdo disponível após importar seu pacote.';continue;}
      const total=totals.get(section.id),pending=errors.filter(e=>unitSets.get(section.id).has(e.unitId)).length;
      count.textContent=total.units?`${total.particles} partículas · ${total.cards} flashcards · ${total.questions} questões · ${pending} para revisar`:'Nenhum item correspondente neste pacote. Explore o módulo público ou importe outro pacote.';
    }
    status.textContent=cachedPackage?'Seu pacote está disponível. As contagens abaixo correspondem ao pacote selecionado; seus erros abrem o mesmo painel de revisão.':'Importe seu pacote privado no espaço abaixo para acessar o conteúdo do seu acervo.';select(player.getSectionScope());
  }
  async function open(id,mode){
    if(busy||disposed)return;busy=true;root.setAttribute('aria-busy','true');
    try{
      const result=await player.setSectionScope(id,{mode});
      const target=doc.getElementById('libraryPrivateStudyHost');target?.scrollIntoView({block:'start',behavior:'auto'});
      if(!result?.hasPackage)player.focusImport();else target?.querySelector('.pstudy h2')?.focus({preventScroll:true});
      select(player.getSectionScope());
    }catch{status.textContent='Não foi possível abrir o formato agora. Use o espaço de estudo abaixo para retomar ou importar seu pacote.';}
    finally{busy=false;root.removeAttribute('aria-busy');}
  }
  const unsubscribe=engine.subscribe(update);update();
  return {select,update,dispose(){disposed=true;unsubscribe();root.remove();}};
}
