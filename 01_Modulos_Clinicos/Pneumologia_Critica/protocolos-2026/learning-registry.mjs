// Banco e rótulos editoriais explícitos. IDs existentes mantidos para preservar progresso v1.
import { DPOC_LEARNING } from './learning-dpoc.mjs?v=133ae5c0be664985';
import { PAC_LEARNING } from './learning-pac.mjs?v=a25fcb6a94674d4a';
import { TB_PULMONAR_LEARNING } from './learning-tb-pulmonar.mjs?v=c5aa9564657860cd';
import { TB_EXTRA_LEARNING } from './learning-tb-extra.mjs?v=997774a59f787b8f';
import { MICOSES_LEARNING } from './learning-micoses.mjs?v=075b5372513380d7';
import { SOURCES } from './clinical-engine.mjs?v=73a92287e43bc300';
import { EXPANSION_SOURCES } from './pulmonary-expansion-data.mjs?v=1aec3cbe19cde326';

export const LEARNING_TOPICS = Object.freeze([
  {id:'dpoc',label:'DPOC',preview:false},
  {id:'pac',label:'Pneumonia comunitária',preview:false},
  {id:'tb-pulmonar',label:'Tuberculose pulmonar',preview:true},
  {id:'tb-extra',label:'Tuberculose extrapulmonar',preview:true},
  {id:'micoses',label:'Micoses pulmonares',preview:true},
].map(Object.freeze));
export const LEARNING_TOPIC_IDS = Object.freeze(LEARNING_TOPICS.map(t=>t.id));
export const topicInfo = id => LEARNING_TOPICS.find(t=>t.id===id) || null;
export const BANK = Object.freeze({dpoc:DPOC_LEARNING,pac:PAC_LEARNING,
  'tb-pulmonar':TB_PULMONAR_LEARNING,'tb-extra':TB_EXTRA_LEARNING,micoses:MICOSES_LEARNING});
export const ALL_CASES = Object.freeze(Object.values(BANK).flatMap(b=>b.cases));
export const ALL_CARDS = Object.freeze(Object.values(BANK).flatMap(b=>b.flashcards));
export const ALL_PARTICLES = Object.freeze(Object.values(BANK).flatMap(b=>b.particles));
export const CARD_IDS = Object.freeze(ALL_CARDS.map(c=>c.id));
export const LEARNING_SOURCES = Object.freeze({...SOURCES,...EXPANSION_SOURCES});

// Mapeamento editorial explícito; não infere conteúdo clínico por palavras ou similaridade.
const LEGACY_CONCEPTS = [
  {id:'dpoc-diagnostico',module:'dpoc',label:'Diagnóstico',comment:'Retome contexto, espirometria e confirmação perto do corte.',caseIds:['dpoc-c01'],cardIds:['dpoc-f01','dpoc-f02'],particleIds:['dpoc-p01','dpoc-p02','dpoc-p03','dpoc-p04']},
  {id:'dpoc-classificacao',module:'dpoc',label:'Classificação',comment:'Separe obstrução, sintomas e eventos antes de classificar.',caseIds:['dpoc-c02'],cardIds:['dpoc-f03','dpoc-f04'],particleIds:['dpoc-p05','dpoc-p06','dpoc-p07','dpoc-p08']},
  {id:'dpoc-ci',module:'dpoc',label:'CI e eosinófilos',comment:'Cruze asma, exacerbações e o contexto do biomarcador.',caseIds:['dpoc-c03'],cardIds:['dpoc-f05','dpoc-f06'],particleIds:['dpoc-p09','dpoc-p10','dpoc-p11','dpoc-p12']},
  {id:'dpoc-reavaliacao',module:'dpoc',label:'Reavaliação',comment:'Reveja técnica, adesão e o problema que ainda persiste.',caseIds:['dpoc-c04'],cardIds:['dpoc-f07','dpoc-f08'],particleIds:['dpoc-p13','dpoc-p14','dpoc-p15','dpoc-p16']},
  {id:'dpoc-suporte',module:'dpoc',label:'Oxigênio e VNI',comment:'Integre gasometria, esforço, via aérea e resposta ao suporte.',caseIds:['dpoc-c05'],cardIds:['dpoc-f09','dpoc-f10'],particleIds:['dpoc-p17','dpoc-p18','dpoc-p19','dpoc-p20']},
  {id:'dpoc-antibiotico',module:'dpoc',label:'Exacerbação e antibiótico',comment:'Releia os critérios e diferencie indicação de prescrição pronta.',caseIds:['dpoc-c06'],cardIds:['dpoc-f11','dpoc-f12'],particleIds:['dpoc-p21','dpoc-p22','dpoc-p23','dpoc-p24']},
  {id:'pac-imagem',module:'pac',label:'Diagnóstico e imagem',comment:'Conecte síndrome, imagem e competência do operador.',caseIds:['pac-c01'],cardIds:['pac-f01','pac-f02'],particleIds:['pac-p01','pac-p02','pac-p03','pac-p04']},
  {id:'pac-risco',module:'pac',label:'Risco e unidades',comment:'Confira analito, unidade e fisiologia além do escore.',caseIds:['pac-c02'],cardIds:['pac-f03','pac-f04'],particleIds:['pac-p05','pac-p06','pac-p07','pac-p08']},
  {id:'pac-gravidade',module:'pac',label:'PAC grave',comment:'Retome maiores, menores e suporte sem esperar o formulário.',caseIds:['pac-c03'],cardIds:['pac-f05','pac-f06'],particleIds:['pac-p09','pac-p10','pac-p11','pac-p12']},
  {id:'pac-virus',module:'pac',label:'Vírus e antibióticos',comment:'Situe gravidade, coinfecção e a divergência entre as fontes.',caseIds:['pac-c04'],cardIds:['pac-f07','pac-f08'],particleIds:['pac-p13','pac-p14','pac-p15','pac-p16']},
  {id:'pac-duracao',module:'pac',label:'Duração e estabilidade',comment:'Use tempo, estabilidade e elegibilidade em conjunto.',caseIds:['pac-c05'],cardIds:['pac-f09','pac-f10'],particleIds:['pac-p17','pac-p18','pac-p19','pac-p20']},
  {id:'pac-corticoide',module:'pac',label:'Corticoide e reavaliação',comment:'Confira indicação, influenza e causas de falha do plano.',caseIds:['pac-c06'],cardIds:['pac-f11','pac-f12'],particleIds:['pac-p21','pac-p22','pac-p23','pac-p24']},
];

export const LEARNING_CONCEPTS = Object.freeze([...LEGACY_CONCEPTS,
  ...TB_PULMONAR_LEARNING.concepts,...TB_EXTRA_LEARNING.concepts,...MICOSES_LEARNING.concepts,
].map(c=>Object.freeze({...c,caseIds:Object.freeze([...c.caseIds]),cardIds:Object.freeze([...c.cardIds]),particleIds:Object.freeze([...c.particleIds])})));
