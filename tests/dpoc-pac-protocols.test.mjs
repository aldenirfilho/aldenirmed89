import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SOURCES, ATS_MINOR, ENGINES, classifyCOPD, followCOPD, acuteCOPD,
  curb65, severeCAP, therapyCAP, durationCAP
} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/clinical-engine.mjs';
import { FORMS, MODULES, IMAGES } from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/content.mjs';

// Casos sintéticos. Verificam critérios, limites e barreiras de segurança;
// não validam indicação individual, desempenho diagnóstico nem uso clínico.
const stable = (overrides={}) => ({age:'60',ratio:'0.59',post:'yes',clinical:'yes',asthma:'no',moderate:'0',severe:'0',cat:'9',mmrc:'',fev:'80',eos:'',...overrides});
const follow = (overrides={}) => ({age:'60',asthma:'no',optimized:'yes',current:'dual',problem:'exacerbation',eos:'100',...overrides});
const acute = (overrides={}) => ({age:'60',instability:'no',safe:'yes',ph:'7.4',co2:'40',purulence:'no',dyspnea:'no',fever:'no',volume:'no',culture:'no',vent:'no',...overrides});
const curb = (overrides={}) => ({age:'64',rr:'29',sbp:'90',dbp:'61',unit:'mmol',urea:'7',confusion:'no',...overrides});
const cap = (overrides={}) => ({age:'60',immune:'yes',influenza:'no',mrsa:'no',pseudo:'no',setting:'ward',viral:'negative',...overrides});
const duration = (overrides={}) => ({days:'3',stable:'yes',severe:'no',exception:'no',eligible:'yes',...overrides});
const text = result => [...(result.alerts||[]),...(result.items||[]),...(result.warnings||[]),result.note||''].join('\n');
const minorKeys = Array.from({length:9},(_,i)=>`m${i}`);
const allCapNo = Object.fromEntries(['imv','shock',...minorKeys].map(k=>[k,'no']));

test('DPOC: uma exacerbação já define E, mesmo com sintomas baixos ou não aferidos',()=>{
  for (const kind of ['moderate','severe']) {
    for (const symptoms of [{cat:'4',mmrc:'0'},{cat:'',mmrc:''}]) {
      const result=classifyCOPD(stable({[kind]:'1',...symptoms}));
      assert.equal(result.score,'Grupo E');assert.deepEqual(result.errors,[]);
    }
  }
});

test('DPOC: A/B respeitam CAAT 10 e mMRC 2; sem escalas A/B permanece indeterminado',()=>{
  for (const [values,score] of [
    [{cat:'9',mmrc:''},'Grupo A'],[{cat:'10',mmrc:''},'Grupo B'],
    [{cat:'',mmrc:'1'},'Grupo A'],[{cat:'',mmrc:'2'},'Grupo B']
  ]) assert.equal(classifyCOPD(stable(values)).score,score);
  const unknown=classifyCOPD(stable({cat:'',mmrc:''}));
  assert.equal(unknown.score,'Dados incompletos');assert.ok(unknown.errors.length);
});

test('DPOC: escalas discordantes exibem aviso e não apagam maior carga sintomática',()=>{
  for(const values of [{cat:'9',mmrc:'2'},{cat:'10',mmrc:'0'}]){
    const result=classifyCOPD(stable(values));
    assert.equal(result.score,'Grupo B');assert.match(text(result),/discordantes/);
  }
});

test('DPOC: grau de obstrução não substitui ABE, com limites 80/50/30',()=>{
  for(const [fev,grade] of [['80',1],['79.99',2],['50',2],['49.99',3],['30',3],['29.99',4]]){
    const result=classifyCOPD(stable({fev}));
    assert.equal(result.score,'Grupo A');assert.match(text(result),new RegExp(`GOLD ${grade} \\(`));
  }
});

test('DPOC: razão 0,70 não confirma obstrução e 0,60–0,80 sempre pede repetição',()=>{
  for(const ratio of ['0.60','0.69','0.70','0.75','0.80']){
    const result=classifyCOPD(stable({ratio}));
    assert.match(text(result),/outra ocasião/);
    assert.equal(result.score,Number(ratio)<0.7?'Grupo A':'Rever diagnóstico');
  }
  assert.doesNotMatch(text(classifyCOPD(stable({ratio:'0.59'}))),/outra ocasião/);
});

test('DPOC: exige pós-BD e contexto clínico; entradas inválidas não viram normais',()=>{
  for(const override of [{post:'no'},{clinical:'no'}])assert.equal(classifyCOPD(stable(override)).score,'Rever diagnóstico');
  for(const override of [{age:'17'},{age:'60.5'},{moderate:'0.5'},{severe:'-1'},{cat:'41'},{mmrc:'5'},{ratio:''}]){
    assert.equal(classifyCOPD(stable(override)).score,'Dados incompletos');
  }
});

test('DPOC: asma exige aviso CI mesmo antes da revisão de técnica e adesão',()=>{
  for(const current of ['mono','dual','labaics','triple']){
    for(const optimized of ['yes','no']){
      const result=followCOPD(follow({asthma:'yes',optimized,current,problem:'dyspnea'}));
      assert.match(text(result),/Asma concomitante requer CI/);
    }
  }
  assert.match(text(classifyCOPD(stable({asthma:'yes'}))),/incluir corticoide inalatório/);
});

test('DPOC: seguimento em LABA/LAMA usa eos ≥100 e pede dado desconhecido',()=>{
  for(const eos of ['100','299','300'])assert.match(text(followCOPD(follow({eos}))),/considerar LABA \+ LAMA \+ CI/);
  assert.match(text(followCOPD(follow({eos:'99'}))),/benefício de CI tende a ser menor/);
  assert.match(text(followCOPD(follow({eos:''}))),/Eosinófilos ausentes/);
  assert.match(text(followCOPD(follow({current:'labaics',eos:'99'}))),/sem asma: considerar troca/);
  assert.doesNotMatch(text(followCOPD(follow({current:'labaics',eos:'99',asthma:'yes'}))),/sem asma: considerar troca/);
  assert.match(text(followCOPD(follow({current:'triple'}))),/hospitalização prévia por exacerbação/);
});

test('Exacerbação: instabilidade prevalece com todos os outros campos ausentes',()=>{
  const result=acuteCOPD({instability:'yes'});
  assert.equal(result.score,'Urgência');assert.match(text(result),/não deve atrasar intubação/);assert.deepEqual(result.errors,[]);
});

test('Exacerbação: acidose conhecida preserva alerta apesar de qualquer outro campo ausente',()=>{
  for(const key of ['age','instability','safe','purulence','dyspnea','fever','volume','culture','vent']){
    const result=acuteCOPD(acute({ph:'7.10',co2:'80',[key]:''}));
    assert.ok(result.errors.length,`deve registrar pendência ${key}`);
    assert.match((result.alerts||[]).join(' '),/acidose hipercápnica/,`deve preservar gravidade com ${key} ausente`);
  }
});

test('Exacerbação: pH extremo informado exige confirmação urgente, não apenas erro de faixa',()=>{
  const result=acuteCOPD(acute({ph:'6.79',co2:'80'}));
  assert.ok(result.errors.length);assert.match((result.alerts||[]).join(' '),/confirmar o dado.*acidemia grave/);
  assert.match(text(acuteCOPD({ph:'7.10'})),/pH muito baixo/);
});

test('VNI: igualdade GOLD 7,35/45 é positiva; CO₂ alto sem acidose não basta',()=>{
  assert.match(text(acuteCOPD(acute({ph:'7.35',co2:'45'}))),/Acidose hipercápnica: avaliar VNI/);
  for(const values of [{ph:'7.36',co2:'80'},{ph:'7.40',co2:'60'},{ph:'7.30',co2:'44.9'}]){
    assert.match(text(acuteCOPD(acute(values))),/não preenche o par/);
  }
  assert.match(text(acuteCOPD(acute({ph:'7.24',co2:'80'}))),/risco elevado de falha/);
  assert.match(text(acuteCOPD(acute({ph:'7.30',co2:'80',safe:'no'}))),/suporte avançado e via aérea imediatamente/);
  assert.match(text(acuteCOPD(acute({ph:'',co2:'80'}))),/Gasometria incompleta/);
});

test('Exacerbação: antibiótico GOLD 2026 contempla cada sintoma adicional, cultura ou VM',()=>{
  const positives=[{purulence:'yes',dyspnea:'yes'},{purulence:'yes',fever:'yes'},{purulence:'yes',volume:'yes'},{culture:'yes'},{vent:'yes'}];
  for(const fields of positives)assert.match(text(acuteCOPD(acute(fields))),/Há critério GOLD 2026 para avaliar antibiótico/);
  for(const fields of [{},{purulence:'yes'},{dyspnea:'yes',fever:'yes',volume:'yes'}]){
    assert.match(text(acuteCOPD(acute(fields))),/Não foi preenchido critério GOLD 2026 de antibiótico/);
  }
  const missing=acuteCOPD(acute({purulence:''}));assert.ok(missing.errors.length);assert.equal(missing.items.length,0);
});

test('Exacerbação: doses de referência e oxigenação preservam unidades e duração',()=>{
  const result=acuteCOPD(acute());
  assert.match(text(result),/40 mg\/dia por 5 dias/);assert.match(text(result),/88–92%/);
  assert.ok(result.source.includes('gold'));assert.ok(result.source.includes('niv'));
});

test('CURB-65: cinco critérios e fronteiras não arredondadas',()=>{
  assert.equal(curb65(curb()).score,'0 / 5');
  for(const single of [{age:'65'},{rr:'30'},{sbp:'89'},{dbp:'60'},{confusion:'yes'},{urea:'7.0001'}]){
    assert.equal(curb65(curb(single)).score,'1 / 5',JSON.stringify(single));
  }
  assert.equal(curb65(curb({age:'65',rr:'30',sbp:'89',dbp:'60',confusion:'yes',urea:'7.001'})).score,'5 / 5');
});

test('CURB-65: ureia/BUN convertem explicitamente e mantêm corte canônico >7',()=>{
  for(const [unit,value] of [['urea','42.042'],['bun','19.607'],['mmol','7']])assert.equal(curb65(curb({unit,urea:value})).score,'0 / 5');
  for(const [unit,value] of [['urea','42.05'],['bun','19.61'],['mmol','7.001']])assert.equal(curb65(curb({unit,urea:value})).score,'1 / 5');
  assert.equal(curb65(curb({unit:'urea',urea:'30'})).score,'0 / 5');
  assert.equal(curb65(curb({unit:'bun',urea:'30'})).score,'1 / 5');
});

test('CURB-65: incompletude nunca elimina hipotensão, taquipneia ou confusão conhecidas',()=>{
  for(const danger of [{sbp:'70',dbp:'40'},{rr:'36'},{confusion:'yes'}]){
    const result=curb65(curb({...danger,urea:''}));
    assert.equal(result.score,'Dados incompletos');assert.ok(result.errors.length);assert.match((result.alerts||[]).join(' '),/Não aguardar completar/);
  }
  assert.ok(curb65(curb({sbp:'70',dbp:'40',urea:''})).items.length===0,'não emitir escore parcial baixo');
  assert.ok(curb65(curb({unit:''})).errors.length);assert.ok(curb65(curb({sbp:'80',dbp:'90'})).errors.length);
});

test('PAC grave: cada critério maior isolado prevalece sobre os demais ausentes',()=>{
  for(const major of ['imv','shock']){
    const result=severeCAP({[major]:'yes'});
    assert.equal(result.score,'PAC grave');assert.match(text(result),/Avaliação imediata/);assert.match(text(result),/desconhecidos/);
  }
});

test('PAC grave: três menores quaisquer bastam e dois não excluem gravidade',()=>{
  for(let i=0;i<7;i++)for(let j=i+1;j<8;j++)for(let k=j+1;k<9;k++){
    const fields={[minorKeys[i]]:'yes',[minorKeys[j]]:'yes',[minorKeys[k]]:'yes'};
    assert.equal(severeCAP(fields).score,'PAC grave',`menores ${i}/${j}/${k}`);
  }
  const incomplete=severeCAP({m0:'yes',m1:'yes'});
  assert.equal(incomplete.score,'Incompleto');assert.match(text(incomplete),/Não é possível excluir/);
  assert.equal(severeCAP(allCapNo).score,'Sem critério grave preenchido');
  assert.equal(severeCAP({}).score,'Incompleto');
});

test('PAC grave: descrições mantêm nove menores e limites exatos',()=>{
  assert.equal(ATS_MINOR.length,9);
  for(const criterion of [/FR ≥30/,/≤250/,/BUN ≥20/,/Leucócitos <4.000/,/Plaquetas <100.000/,/<36/])assert.ok(ATS_MINOR.some(x=>criterion.test(x)),String(criterion));
});

test('PAC: doses usuais conferidas e combinação obrigatória na grave',()=>{
  const low=text(therapyCAP(cap({setting:'outlow'})));
  assert.match(low,/amoxicilina 1 g VO a cada 8 h/);assert.match(low,/doxiciclina 100 mg VO a cada 12 h/);assert.match(low,/<25%/);
  assert.match(text(therapyCAP(cap())),/ceftriaxona 1–2 g IV\/dia \+ azitromicina 500 mg\/dia/);
  const severe=text(therapyCAP(cap({setting:'severe'})));
  assert.match(severe,/ceftriaxona 2 g IV\/dia \+ azitromicina 500 mg\/dia/);assert.match(severe,/evitar monoterapia/);
});

test('PAC: vírus positivo elegível não recebe lista empírica concorrente no cenário sem comorbidade',()=>{
  const result=therapyCAP(cap({setting:'outlow',viral:'positive'}));
  assert.match(result.items[0],/ATS sugere não iniciar antibiótico/);
  assert.doesNotMatch(result.items.join(' '),/amoxicilina 1 g|doxiciclina 100 mg/);
});

test('PAC: vírus positivo na grave mantém antibacteriano; divergência nos dois cenários intermediários',()=>{
  assert.match(text(therapyCAP(cap({setting:'severe',viral:'positive'}))),/tratamento antibacteriano empírico/);
  for(const setting of ['ward','outcomorbid'])assert.match(text(therapyCAP(cap({setting,viral:'positive'}))),/IDSA não endossa/);
});

test('PAC: influenza exclui sugestão geral de corticoide; imunossupressão sai do protocolo geral',()=>{
  assert.match(text(therapyCAP(cap({setting:'severe',influenza:'yes'}))),/sugestão ATS de corticoide para PAC grave não se aplica/);
  assert.doesNotMatch(therapyCAP(cap({setting:'severe',influenza:'yes'})).items.join(' '),/PAC grave: considerar corticoide sistêmico/);
  assert.match(text(therapyCAP(cap({setting:'severe'}))),/não fixa um esquema universal/);
  assert.match(text(therapyCAP(cap())),/não usar corticoide sistêmico rotineiramente/);
  const immune=therapyCAP(cap({immune:'no'}));assert.match(text(immune),/Imunossupressão/);assert.doesNotMatch(immune.items.join(' '),/ceftriaxona/);
});

test('PAC: riscos de resistência nunca acionam antibiótico amplo automático',()=>{
  for(const key of ['mrsa','pseudo']){
    const result=therapyCAP(cap({[key]:'yes'}));
    assert.match(text(result),/cobertura dirigida com CCIH/);assert.match(text(result),/validação local/);
    assert.doesNotMatch(result.items.join(' '),/vancomicina|meropenem|linezolida/);
  }
});

test('Duração PAC: mínimo 3 dias é restrito à não grave estável e elegível',()=>{
  assert.match(text(durationCAP(duration({days:'2'}))),/ainda não atingiu o mínimo/);
  for(const days of ['3','4'])assert.match(text(durationCAP(duration({days}))),/mínimo 3 dias \(condicional\)/);
  for(const override of [{stable:'no'},{exception:'yes'},{eligible:'no'}])assert.match(text(durationCAP(duration(override))),/Não propor interrupção/);
  for(const key of ['stable','severe','exception','eligible'])assert.ok(durationCAP(duration({[key]:''})).errors.length);
  assert.ok(durationCAP(duration({days:'2.5'})).errors.length);
});

test('Duração PAC: grave exige ≥5; não confundir limite com ordem de suspensão',()=>{
  assert.match(text(durationCAP(duration({severe:'yes',days:'4'}))),/pelo menos 5 dias/);
  assert.match(text(durationCAP(duration({severe:'yes',days:'5'}))),/revisar possibilidade de finalizar/);
});

test('Estabilidade: rótulos do motor e formulário preservam desigualdades da Tabela 6 ATS',()=>{
  const note=durationCAP(duration()).note;
  const label=FORMS.duration.fields.find(f=>f.key==='stable').help;
  for(const value of ['T ≤37,8','FC <100','FR <24','PAS ≥90','SpO₂ ≥90%','PaO₂ ≥60'])assert.ok(note.includes(value),value);
  for(const value of ['T ≤37,8','FC <100','FR <24','PAS ≥90','SpO₂ ≥90%','PaO₂ ≥60'])assert.ok(label.includes(value),value);
});

test('Conteúdo: sete cenários, CAAT recebido já aferido e vinte ilustrações mapeadas',()=>{
  assert.deepEqual(Object.keys(FORMS).sort(),['acute','curb','duration','follow','gravity','stable','therapy'].sort());
  for(const id of ['dpoc','pac']){
    assert.equal(IMAGES[id].length,10);
    assert.equal(new Set(IMAGES[id].map(x=>x[0])).size,10);
    for(const ref of MODULES[id].references)assert.ok(SOURCES[ref[2]],`fonte de ${ref[0]}`);
    assert.ok(MODULES[id].study.length>=6);
  }
  assert.match(FORMS.stable.fields.find(f=>f.key==='cat').help,/já aferido/);
});

test('Fontes do motor: HTTPS e edições distinguem ATS focada de ATS/IDSA integral',()=>{
  for(const source of Object.values(SOURCES))assert.equal(new URL(source.url).protocol,'https:');
  assert.match(SOURCES.ats.title,/ATS 2025/);assert.match(SOURCES.idsa.title,/ATS\/IDSA 2019/);assert.match(SOURCES.debate.title,/IDSA 2026/);
});

test('UI: formulário não bloqueia urgência por validação nativa; alerts são renderizados antes dos errors',async()=>{
  const html=await readFile(new URL('../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/app.mjs',import.meta.url),'utf8');
  assert.match(html,/<form[^>]*id="clinical-form"[^>]*novalidate/);
  // Estrutura contratual de segurança: alerta é interpolado no ramo de erro.
  assert.match(app,/if\(r\.errors\.length\)\{target\.innerHTML=`\$\{alerts\}/);
});


test('Flashcards: fontes específicas para CURB, critérios maiores e controvérsia viral',()=>{
  const cards=MODULES.pac.study;
  const find=(prefix)=>cards.find(([question])=>question.startsWith(prefix));
  assert.equal(find('CURB-65 baixo')[2],'idsa');
  assert.equal(find('Ureia 50')[2],'nice');
  assert.equal(find('PCR viral')[2],'debate');
  assert.equal(find('Um critério maior')[2],'idsa');
  for(const card of cards)if(card[2])assert.ok(SOURCES[card[2]]);
  const oxygen=MODULES.dpoc.study.find(([question])=>question.startsWith('Por que o oxigênio'));
  assert.equal(oxygen[2],'oxygen_phys');
  assert.equal(SOURCES.oxygen_phys.url,'https://pubmed.ncbi.nlm.nih.gov/8565533/');
});

test('Dados inteiramente ausentes nunca geram baixo risco, grupo A nem plano definitivo',()=>{
  for(const [id,engine] of Object.entries(ENGINES)){
    const result=engine({});
    if(id==='gravity')assert.equal(result.score,'Incompleto');
    else assert.equal(result.score,'Dados incompletos',id);
  }
});
