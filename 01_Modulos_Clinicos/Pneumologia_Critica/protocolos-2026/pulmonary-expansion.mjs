import { PULMONARY_SECTIONS, EXPANSION_SOURCES, CORTICOSTEROID_GUIDE, SEVERITY_ALERTS } from './pulmonary-expansion-data.mjs?v=1aec3cbe19cde326';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PHASES = [['signal', '01 · Contexto', 'O que reconhecer?'], ['mechanism', '02 · Mecanismo', 'Qual é a conexão?'], ['decision', '03 · Decisão', 'Qual é o próximo passo?'], ['pitfall', '04 · Transferência', 'Qual armadilha evitar?']];
const RELATED_TRAINING = {raras:['antifungicos','Aprofundar antifúngicos'], 'tb-pulmonar':['tb-resistente','Aprofundar TB resistente'], 'tb-extra':['neuro-tb','Aprofundar neuro-TB']};
const MODES = [['guide', '🔬 Micropartículas'], ['atlas', '◫ Atlas · 10 imagens'], ['steroids', '💊 Corticoide na TB'], ['severity', '🚨 Gravidade'], ['sources', '↗ Fontes']];
const refs = ids => [...new Set(ids)].map(id => { const s = EXPANSION_SOURCES[id]; return s ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>` : ''; }).join(' · ');
const button = (cmd, label, attrs='') => `<button type="button" data-pulmonary-action="${cmd}" ${attrs}>${label}</button>`;

export function initPulmonaryExpansion(root, {onSectionChange = () => {}, onImage = () => {}} = {}) {
  let section = PULMONARY_SECTIONS[0], mode = 'guide', visible = false;
  const positions = Object.fromEntries(PULMONARY_SECTIONS.map(s => [s.id, {block: 0, phase: 0, revealed: false, cycle: 1}]));
  let auto = false, cadence = 30, deadline = null;
  function pause() { auto = false; deadline = null; }
  function next() {
    const state = positions[section.id]; state.phase++;
    if (state.phase === PHASES.length) { state.phase = 0; state.block++; }
    if (state.block === section.blocks.length) { state.block = 0; state.cycle++; }
    state.revealed = false;
  }
  function guide() {
    const state = positions[section.id], b = section.blocks[state.block], [field, , question] = PHASES[state.phase];
    return `<section class="pulmonary-particle" aria-labelledby="pulmonary-particle-title"><div class="pulmonary-controls"><label for="pulmonary-block">Escolha uma conexão<select id="pulmonary-block">${section.blocks.map((x, i) => `<option value="${i}" ${i === state.block ? 'selected' : ''}>${i+1}. ${esc(x.title)}</option>`).join('')}</select></label><span>PARTÍCULA ${state.block * 4 + state.phase + 1} / ${section.blocks.length * 4} · CICLO ${state.cycle}</span></div>
      <ol class="particle-stream" aria-label="Fases do percurso">${PHASES.map(([,label], i) => `<li ${state.phase === i ? 'aria-current="step"' : ''}><span aria-hidden="true">●</span>${label}</li>`).join('')}</ol>
      <div class="pulmonary-window"><figure><button type="button" data-pulmonary-image="${state.block}" aria-label="Ampliar: ${esc(b.title)}"><img src="${esc(b.image)}" alt="${esc(b.imageAlt)}" width="1672" height="941" loading="lazy" decoding="async"></button><figcaption>${esc(b.caption)}</figcaption></figure><div><p class="eyebrow">${esc(b.title)}</p><h3 id="pulmonary-particle-title">${question}</h3>${state.revealed ? `<div class="learn-answer"><p>${esc(b[field])}</p>${state.phase===2?`<p class="pulmonary-redflag"><strong>Gravidade:</strong> ${esc(b.severity)}</p>`:''}<p class="learn-refs">${refs(b.sourceIds)}</p></div>` : '<p class="muted">Recupere uma ideia antes de abrir o comentário.</p>'}<div class="learn-actions">${button('reveal', state.revealed ? '✓ Comentário aberto' : 'Revelar micropartícula', state.revealed ? 'disabled' : 'class="primary"')}${button('next', 'Próxima partícula →')}</div></div></div>
      <div class="flow-controls"><label for="pulmonary-cadence">Tempo por pergunta / comentário<select id="pulmonary-cadence">${[10,20,30,45,60].map(n=>`<option value="${n}" ${n===cadence?'selected':''}>${n} segundos</option>`).join('')}</select></label>${button('auto', auto ? 'Ⅱ Pausar fluxo' : '▶ Fluxo contínuo', `aria-pressed="${auto}"`)}<output id="pulmonary-clock" aria-live="off">${auto ? 'Em fluxo' : 'No seu ritmo'}</output></div><p class="muted">Pergunta → comentário → próxima conexão. Fluxo opcional, sem pontuação por exposição. Ao terminar, o percurso recomeça; sair desta camada pausa o fluxo.</p></section>`;
  }
  function atlas() {
    return `<p class="muted">10 ilustrações conceituais geradas por IA, em widescreen. Não são exames nem fotografias de pacientes. Consulte as legendas e referências.</p><div class="gallery">${section.blocks.map((b,i)=>`<figure><button type="button" data-pulmonary-image="${i}" aria-label="Ampliar: ${esc(b.title)}"><img src="${esc(b.image)}" alt="${esc(b.imageAlt)}" width="1672" height="941" loading="lazy" decoding="async"></button><figcaption><span class="image-id">${i+1} / 10 · WIDESCREEN</span><h3>${esc(b.title)}</h3><p>${esc(b.caption)}</p><p class="learn-refs">${refs(b.sourceIds)}</p><a href="${esc(b.image)}" download>Baixar original ↓</a></figcaption></figure>`).join('')}</div>`;
  }
  function steroids() {
    return `<div class="pulmonary-heading"><p class="eyebrow">INDICAÇÃO DEPENDE DO SÍTIO E DO CONTEXTO</p><h3>Quando associar corticoide à terapia da tuberculose?</h3><p>Adjuvante significa junto ao tratamento antituberculose. A indicação para um sítio não se transfere automaticamente para os demais.</p></div><div class="pulmonary-comparisons">${CORTICOSTEROID_GUIDE.map(g=>`<article><h4>${esc(g.setting)}</h4><p class="pulmonary-recommendation">${esc(g.recommendation)}</p><p>${esc(g.rationale)}</p><p class="learn-refs">${refs(g.sourceIds)}</p></article>`).join('')}</div>`;
  }
  function severity() {
    return `<div class="pulmonary-heading"><p class="eyebrow">O RISCO MUDA COM A DISFUNÇÃO ORGÂNICA</p><h3>Formas e complicações de maior gravidade</h3><p>A localização isolada não substitui a avaliação de instabilidade. Comprometimento neurológico, respiratório ou circulatório exige resposta imediata.</p></div><div class="pulmonary-comparisons">${SEVERITY_ALERTS.map(a=>`<article class="pulmonary-alert"><h4>🚨 ${esc(a.title)}</h4><p><strong>Reconheça:</strong> ${esc(a.signals)}</p><p><strong>Próximo passo:</strong> ${esc(a.action)}</p><p class="learn-refs">${refs(a.sourceIds)}</p></article>`).join('')}</div>`;
  }
  function sources() {
    const ids = new Set(section.blocks.flatMap(b => b.sourceIds));
    return `<div class="source-list">${[...ids].map(id=>{const s=EXPANSION_SOURCES[id];return `<article class="source-item"><h3>${esc(s.title)}</h3><p>${esc(s.year)} · ${esc(s.scope)}</p>${refs([id])}</article>`;}).join('')}</div><p class="muted">Fontes conferidas nesta edição. A legenda identifica o raciocínio clínico; a arte não constitui evidência diagnóstica.</p>`;
  }
  function render() {
    const active = document.activeElement;
    let focusSelector = null;
    if(root.contains(active)){
      for(const [key,attr] of [['pulmonaryAction','data-pulmonary-action'],['pulmonaryMode','data-pulmonary-mode'],['pulmonaryTopic','data-pulmonary-topic'],['pulmonaryImage','data-pulmonary-image']]){
        const value=active?.dataset?.[key];if(value!==undefined&&/^[a-z0-9-]+$/.test(value))focusSelector=`[${attr}="${value}"]`;
      }
      if(['pulmonary-block','pulmonary-cadence'].includes(active?.id))focusSelector=`#${active.id}`;
    }
    root.innerHTML = `<div class="learn-intro"><div><p class="eyebrow">TURBO TEMI 360X · PULMÃO ALÉM DO HABITUAL</p><h1 class="pulmonary-title">${esc(section.title)}</h1><p>${esc(section.summary)}</p></div><span class="learn-badge">UMA CONEXÃO<br>POR VEZ</span></div><p class="pulmonary-status">${esc(section.clinicalStatus)}</p><nav class="pulmonary-topics" aria-label="Temas pulmonares ampliados">${PULMONARY_SECTIONS.map(s=>`<button type="button" data-pulmonary-topic="${s.id}" aria-pressed="${s.id===section.id}">${esc(s.title)}</button>`).join('')}</nav><p class="specialty-bridge"><strong>🧠 Conecte ao painel de erros</strong><br><button type="button" data-open-study="${section.id==='raras'?'micoses':section.id}">Treinar casos, flashcards e simulado de ${section.id==='raras'?'micoses':section.id==='tb-pulmonar'?'TB pulmonar':'TB extrapulmonar'} →</button> <button type="button" data-open-study="${RELATED_TRAINING[section.id][0]}">${RELATED_TRAINING[section.id][1]} →</button></p><nav class="learn-modes" aria-label="Camadas do tema ampliado">${MODES.map(([id,label])=>`<button type="button" data-pulmonary-mode="${id}" aria-pressed="${id===mode}">${label}</button>`).join('')}</nav><div id="pulmonary-body">${({guide,atlas,steroids,severity,sources})[mode]()}</div><details class="learn-method"><summary>🔬 Como estudar em micropartículas?</summary><div><p>São 40 passos por seção: 10 conexões × contexto, mecanismo, decisão e transferência. Pense, revele e avance. A citometria de fluxo é uma metáfora visual da organização autoral; não é um método validado especificamente para TDAH.</p><p>As novas seções são uma prévia educacional com fontes. Não constituem prescrição individual. O treino de DPOC, PAC, TB pulmonar, TB extrapulmonar e micoses compartilha o painel de erros e a revisão dirigida. Use o botão acima para entrar no tema correspondente.</p></div></details>`;
    if(focusSelector){const target=root.querySelector(`${focusSelector}:not([disabled])`)||root.querySelector('[data-pulmonary-action="next"]');target?.focus({preventScroll:true});}
  }
  function setSection(id) {
    const nextSection = PULMONARY_SECTIONS.find(s=>s.id===id); if (!nextSection) return false;
    pause(); section = nextSection; render(); onSectionChange(id); return true;
  }
  root.addEventListener('click', event=>{
    const b=event.target.closest('button'); if(!b||!root.contains(b))return;
    if(b.dataset.pulmonaryTopic){setSection(b.dataset.pulmonaryTopic);return;}
    if(b.dataset.pulmonaryMode){pause();mode=b.dataset.pulmonaryMode;render();return;}
    if(b.dataset.pulmonaryImage!==undefined){const block=section.blocks[Number(b.dataset.pulmonaryImage)];if(block){pause();render();onImage(block);}return;}
    const cmd=b.dataset.pulmonaryAction,state=positions[section.id];
    if(cmd==='reveal')state.revealed=true;
    if(cmd==='next')next();
    if(cmd==='auto')auto=!auto;
    if(cmd){deadline=auto?Date.now()+cadence*1000:null;render();}
  });
  root.addEventListener('change',event=>{
    if(event.target.id==='pulmonary-block'){pause();const i=Number(event.target.value);if(Number.isInteger(i)&&section.blocks[i])positions[section.id]={block:i,phase:0,revealed:false,cycle:1};render();}
    if(event.target.id==='pulmonary-cadence'){const n=Number(event.target.value);if([10,20,30,45,60].includes(n))cadence=n;if(auto)deadline=Date.now()+cadence*1000;}
  });
  function tick(){if(!visible||document.hidden||mode!=='guide'||!auto)return;const now=Date.now();if(now>=deadline){const s=positions[section.id];if(s.revealed)next();else s.revealed=true;deadline=now+cadence*1000;render();}const out=root.querySelector('#pulmonary-clock');if(out)out.textContent=`${Math.max(0,Math.ceil((deadline-now)/1000))} s · ${positions[section.id].revealed?'comentário':'pergunta'}`;}
  let timer=setInterval(tick,250);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();render();}});
  window.addEventListener('pagehide',()=>{pause();clearInterval(timer);});
  window.addEventListener('pageshow',event=>{if(event.persisted){timer=setInterval(tick,250);render();}});
  render();
  return {setSection,getSection(){return section.id;},setVisible(value){visible=Boolean(value);if(!visible){pause();render();}}};
}
