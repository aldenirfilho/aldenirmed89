/** Navegação editorial pública. A correspondência organiza busca, não valida fatos clínicos. */
const topic = value => Object.freeze({...value, themes:Object.freeze(value.themes), exactTokens:Object.freeze(value.exactTokens), prefixes:Object.freeze(value.prefixes)});
export const CLINICAL_STUDY_TOPICS = Object.freeze([
  topic({id:'tb', title:'Tuberculose', subtitle:'Pulmonar, extrapulmonar, neuro-TB e Mal de Pott', objective:'Conecte os conceitos por localização e retome os diferenciais no seu material de estudo.', image:'tb-turbo-360x.webp', alt:'Ilustração conceitual de pulmões, cérebro e coluna em tons de ciano e dourado.', themes:[], exactTokens:['tb','neurotb'], prefixes:['tubercul','pott'], publicHref:'../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/#tb-pulmonar', publicLabel:'Explorar o módulo público de TB'}),
  topic({id:'igg4', title:'Doença relacionada à IgG4', subtitle:'Conceitos, diferenciais e tratamento', objective:'Organize apresentações, diferenciais e perguntas sobre tratamento em pequenas etapas de revisão.', image:'igg4-turbo-360x.webp', alt:'Ilustração conceitual de uma célula imune com símbolos do pâncreas e do rim.', themes:[], exactTokens:['igg4'], prefixes:['igg4'], publicHref:'../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/#igg4', publicLabel:'Explorar a seção pública de IgG4'}),
  topic({id:'micoses', title:'Micoses e antifúngicos', subtitle:'Fungos, síndromes e terapias', objective:'Revise os temas do seu acervo e conecte cada erro aos cartões e às micropartículas correspondentes.', image:'micoses-turbo-360x.webp', alt:'Ilustração conceitual de formas fúngicas filamentosas e leveduriformes.', themes:[], exactTokens:['pcp'], prefixes:['micos','fung','antifung','candid','asperg','criptoc','cryptoc','histoplas','mucor','paracoccid','pneumocyst'], publicHref:'../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/#treino-micoses', publicLabel:'Explorar o treino público de micoses'}),
  topic({id:'sepse', title:'Sepse e choque', subtitle:'Raciocínio, prioridades e reavaliação', objective:'Reúna os conceitos de sepse do pacote e escolha um foco para o próximo ciclo de estudo.', image:'sepse-turbo-360x.webp', alt:'Ilustração conceitual de microvasos com hemácias e sinal luminoso de inflamação.', themes:['sepse-choque'], exactTokens:['sepse','sepsis'], prefixes:['seps','septic'], publicHref:'../01_Modulos_Clinicos/Sepse_Choque_Septico/index.html', publicLabel:'Explorar o módulo público de sepse'}),
  topic({id:'ventilacao', title:'Ventilação e SDRA', subtitle:'Mecânica respiratória e suporte', objective:'Alterne entre recuperação ativa, partículas e casos para revisar os conceitos respiratórios do seu acervo.', image:'ventilacao-turbo-360x.webp', alt:'Ilustração conceitual de pulmões, alvéolos e equipamento de ventilação sem configurações clínicas.', themes:['vm-sdra'], exactTokens:['vm','vni','sdra','ards','peep','copd','dpoc'], prefixes:['ventila','respira','alveol','hipercap','autopeep'], publicHref:'../01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/index.html', publicLabel:'Explorar o RespiraSense público'}),
  topic({id:'renal', title:'Renal e eletrólitos', subtitle:'LRA, função renal e equilíbrio', objective:'Agrupe os temas renais e eletrolíticos do pacote para estudar uma decisão de cada vez.', image:'renal-turbo-360x.webp', alt:'Ilustração conceitual de rins e elementos luminosos associados ao equilíbrio de fluidos.', themes:['nefro-aki-trs','disturbios-eletroliticos'], exactTokens:['rim','rins','lra','aki','trs','crrt','sodio','potassio','calcio','magnesio'], prefixes:['renal','renais','nefro','eletr','creatinin','hipercal','hipocal','hipernatr','hiponatr','dialise','hemodial','hiperpotass','hipopotass'], publicHref:'../03_Calculadoras_E_Apps/index.html', publicLabel:'Explorar as calculadoras clínicas públicas'}),
]);

export const clinicalStudyTopic = id => CLINICAL_STUDY_TOPICS.find(section => section.id === id) || null;
const tokens = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
export function clinicalStudyUnitText(unit){return [unit.title,unit.theme,...(unit.particles||[]).flatMap(item=>[item.title,item.text]),...(unit.cards||[]).flatMap(item=>[item.front,item.back]),...(unit.questions||[]).map(item=>item.stem)].join(' ');}

export function unitMatchesClinicalSection(unit,id){
  if(!id)return true;
  const section=clinicalStudyTopic(id);
  if(!section)return false;
  if(section.themes.includes(unit.theme))return true;
  const words=tokens(clinicalStudyUnitText(unit)),exact=new Set(section.exactTokens);
  // Short abbreviations and renal anatomy use full tokens; prefixes are explicit
  // and contain at least four characters (e.g. "rim" never matches rimantadina).
  return words.some(word=>exact.has(word)||section.prefixes.some(prefix=>word.startsWith(prefix)));
}

export function clinicalSectionCounts(pkg,id){
  const units=(pkg?.units||[]).filter(unit=>unitMatchesClinicalSection(unit,id));
  return {units:units.length,particles:units.reduce((n,u)=>n+u.particles.length,0),cards:units.reduce((n,u)=>n+u.cards.length,0),questions:units.reduce((n,u)=>n+u.questions.length,0)};
}
