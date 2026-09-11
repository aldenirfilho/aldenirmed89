(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NIHSS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
// NIHSS — versão educacional AldenirMed89 (edição 1.1). Tradução didática própria, não certificada.
// Contrato: vazio nunca é zero; UN só onde o manual prevê barreira física; subtotal nunca vira total.
const VERSION='1.1';
const item=(id,title,help,options,un)=>({id,title,help,options:options.map((text,value)=>({value:String(value),text})),un:un||null});
const items=[
item('1a','Nível de consciência','Escolha uma pontuação mesmo com tubo, barreira linguística ou trauma. O grau 3 exige apenas resposta reflexa/autonômica ou ausência de resposta ao estímulo.',['Alerta e responsivo','Desperta com estímulo leve e responde','Precisa de estímulos repetidos ou vigorosos para responder','Apenas resposta reflexa/autonômica ou nenhuma resposta']),
item('1b','Perguntas: mês e idade','Pontue a primeira resposta; não dê pistas. Afasia/estupor com incompreensão: 2. Impedimento de fala por tubo, trauma, disartria grave ou barreira linguística, sem afasia: 1.',['Acerta as duas','Acerta uma / impedimento não afásico previsto','Não acerta nenhuma']),
item('1c','Comandos: olhos e mão','Peça abrir/fechar olhos e apertar/soltar a mão não parética. Se necessário, demonstre; substitua tarefa em impedimento físico. Tentativa inequívoca limitada por fraqueza recebe crédito.',['Executa os dois','Executa um','Não executa nenhum']),
item('2','Melhor olhar conjugado','Avalie movimentos horizontais voluntários/reflexos, sem prova calórica. Desvio vencido por movimento voluntário/reflexo: 1. Paralisia isolada de nervo ocular: 1.',['Normal','Paresia parcial do olhar','Desvio forçado/paralisia total não vencida por reflexo oculocefálico']),
item('3','Campos visuais','Confrontação dos quadrantes, contagem de dedos ou ameaça. Na cegueira unilateral prévia, examine o olho remanescente; cegueira bilateral por qualquer causa pontua 3. Extinção visual pode pontuar 1 e deve ser considerada no item 11.',['Sem perda de campo','Hemianopsia parcial / extinção visual','Hemianopsia completa','Hemianopsia bilateral, incluindo cegueira cortical']),
item('4','Paralisia facial','Peça mostrar dentes, elevar sobrancelhas e fechar olhos; use mímica ou careta ao estímulo em paciente pouco responsivo. Remova barreiras quando seguro.',['Simétrica','Paresia discreta: sulco/assimetria ao sorrir','Paralisia parcial, face inferior total/quase total','Paralisia completa superior e inferior em um ou ambos os lados']),
item('5a','Braço esquerdo','Braço a 90° sentado ou 45° deitado, palma para baixo, por 10 s. Avalie um membro por vez. Não use estímulo doloroso para encorajar.',['Mantém 10 s, sem queda','Cai antes de 10 s, sem atingir apoio','Algum esforço antigravitacional, mas chega ao apoio','Sem esforço contra gravidade; cai','Sem movimento'],'Amputação ou fusão articular do ombro; descreva.'),
item('5b','Braço direito','Mesmo método: 90° sentado ou 45° deitado, palma para baixo, por 10 s. Lado direito do paciente.',['Mantém 10 s, sem queda','Cai antes de 10 s, sem atingir apoio','Algum esforço antigravitacional, mas chega ao apoio','Sem esforço contra gravidade; cai','Sem movimento'],'Amputação ou fusão articular do ombro; descreva.'),
item('6a','Perna esquerda','Em decúbito, elevar a 30° e observar por 5 s. Avaliar um membro de cada vez.',['Mantém 5 s, sem queda','Cai antes de 5 s, sem tocar o leito','Cai ao leito em até 5 s, com algum esforço antigravitacional','Cai imediatamente; sem esforço contra gravidade','Sem movimento'],'Amputação ou fusão articular do quadril; descreva.'),
item('6b','Perna direita','Mesmo método, 30° em decúbito por 5 s. Lado direito do paciente.',['Mantém 5 s, sem queda','Cai antes de 5 s, sem tocar o leito','Cai ao leito em até 5 s, com algum esforço antigravitacional','Cai imediatamente; sem esforço contra gravidade','Sem movimento'],'Amputação ou fusão articular do quadril; descreva.'),
item('7','Ataxia dos membros','Índex-nariz e calcanhar-joelho bilateral, olhos abertos. Pontue somente ataxia desproporcional à fraqueza. Na paralisia ou incapacidade de compreender, ataxia é considerada ausente; não use UN por isso. Em cegueira, teste tocando o nariz a partir do braço estendido.',['Ausente','Em um membro','Em dois membros'],'Amputação ou fusão articular que impeça teste; descreva.'),
item('8','Sensibilidade','Teste face, braços, pernas e tronco conforme necessário, por estímulo apropriado e resposta/careta. Pontue perda atribuível ao AVC. Coma (1a=3): 2. Tetraplégico sem resposta: 2.',['Normal','Perda leve/moderada, ainda percebe toque','Perda grave/total; não percebe toque em face, braço e perna']),
item('9','Melhor linguagem','Use descrição de cena, nomeação e leitura padronizadas; integre compreensão durante exame. Na intubação, tente escrita. Na limitação visual, use objetos pelo tato/fala. Coma (1a=3): 3.',['Sem afasia','Afasia leve/moderada; comunicação ainda permite reconhecer conteúdo','Afasia grave; comunicação fragmentada exige muita inferência','Afasia global/mutismo sem fala útil nem compreensão auditiva']),
item('10','Disartria','Obtenha amostra de leitura/repetição com lista padronizada. Na afasia grave, avalie articulação da fala espontânea. Mutismo sem barreira física não é UN: pontua 2.',['Normal','Leve/moderada; compreensível com alguma dificuldade','Grave, ininteligível ou anártrico/mudo'],'Intubação ou outra barreira física à fala; descreva.'),
item('11','Extinção / desatenção','Avalie estimulação simultânea visual/tátil e informações anteriores. Afasia isolada não equivale a negligência. Considere anosognosia e orientação espacial/corporal.',['Sem alteração','Extinção/desatenção em uma modalidade','Hemidesatenção profunda ou em mais de uma modalidade'])
];
const filled=(values,id)=>values[id]!==undefined&&values[id]!==null&&values[id]!=='';
function assess(values={},reasons={}){
 let subtotal=0;const missing=[],untestable=[],errors=[];
 for(const i of items){const raw=values[i.id];if(raw===undefined||raw===null||raw===''){missing.push(i.id);continue;}const v=String(raw);
  if(v==='UN'){if(!i.un){errors.push(i.id+': UN não permitido');continue;}untestable.push(i.id);if(!(reasons[i.id]||'').trim())errors.push(i.id+': explique o motivo de UN');continue;}
  if(!i.options.some(o=>o.value===v)){errors.push(i.id+': pontuação inválida');continue;}subtotal+=Number(v);
 }
 if(String(values['1a'])==='3'){
  // Regras do manual em coma: 1b=2, 1c=2 (não responde), 8=2, 9=3, 10=2 ou UN por barreira física; ataxia não é demonstrável.
  if(filled(values,'1b')&&String(values['1b'])!=='2')errors.push('Coma: perguntas (1b) devem ser 2 (manual NIHSS).');
  if(filled(values,'1c')&&String(values['1c'])!=='2')errors.push('Coma: comandos (1c) devem ser 2 (manual NIHSS).');
  if(filled(values,'8')&&String(values['8'])!=='2')errors.push('Coma: sensibilidade deve ser 2 (manual NIHSS).');
  if(filled(values,'9')&&String(values['9'])!=='3')errors.push('Coma: linguagem deve ser 3 (manual NIHSS).');
  if(filled(values,'10')&&!['2','UN'].includes(String(values['10'])))errors.push('Coma: disartria deve ser 2 (mudo/anártrico) ou UN se intubado.');
  if(filled(values,'7')&&!['0','UN'].includes(String(values['7'])))errors.push('Coma/incapacidade de compreender: não atribuir ataxia demonstrada.');
 }
 const complete=!missing.length&&!untestable.length&&!errors.length;
 return {subtotal,total:complete?subtotal:null,complete,missing,untestable,errors,answered:items.length-missing.length};
}
// Comparação item a item entre dois exames (valores brutos). Não interpreta; só descreve o que mudou.
function compare(prev={},cur={}){
 const changes=[];let worse=0,better=0;
 for(const i of items){const a=prev[i.id],b=cur[i.id];const fa=a!==undefined&&a!==null&&a!=='',fb=b!==undefined&&b!==null&&b!=='';if(!fa&&!fb)continue;
  if(!fa||!fb||a==='UN'||b==='UN'){if(String(a)!==String(b))changes.push({id:i.id,title:i.title,from:fa?String(a):'—',to:fb?String(b):'—',direction:'n/a'});continue;}
  const na=Number(a),nb=Number(b);if(na===nb)continue;const direction=nb>na?'pior':'melhor';if(direction==='pior')worse++;else better++;changes.push({id:i.id,title:i.title,from:String(a),to:String(b),direction});}
 return {changes,worse,better,summary:changes.length?`${changes.length} item(ns) mudaram: ${worse} pior(es), ${better} melhor(es)`:'Nenhum item mudou.'};
}
function fisherModified(sah,ivh){if(!['absent','thin','thick'].includes(sah)||!['no','yes'].includes(ivh))return{grade:null,text:'Selecione os dois achados.'};if(sah==='absent'&&ivh==='yes')return{grade:null,text:'Sangue ventricular isolado: fora da classificação simplificada de HSA deste módulo. Descreva e confirme com neurorradiologia.'};const grade=sah==='absent'?0:sah==='thin'?(ivh==='yes'?2:1):(ivh==='yes'?4:3);return{grade,text:'Fisher modificado '+grade+' · descreve sangue na TC; não determina tratamento nem probabilidade individual. “Espesso” = preenche completamente ≥1 cisterna/fissura (Frontera 2006).'};}
return{VERSION,items,assess,compare,fisherModified};});
