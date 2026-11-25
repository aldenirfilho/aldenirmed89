import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  CLINICAL_STUDY_TOPICS,
  clinicalStudyTopic,
  unitMatchesClinicalSection,
  clinicalSectionCounts,
} from '../02_Biblioteca_IA_Engine/assets/clinical-study-topics.mjs';

const sourceId='library-study-sections-source';
const referenceId='sections-reference';
const unit=(id,title,theme)=>({
  id:'library-study-sections-unit-'+id,title,theme,sourceIds:[sourceId],refIds:[referenceId],
  particles:[1,2,3].map(n=>({id:'library-study-sections-'+id+'-p'+n,title:'Ideia sintética '+n,
    text:'Texto inteiramente sintético para testar a navegação de '+title+'.',
    sourceId,locator:{pages:[n],paragraphs:[]},relationBasis:'document-grounded',refIds:[]})),
  cards:[1,2].map(n=>({id:'library-study-sections-'+id+'-c'+n,front:'Pergunta de interface '+n+' · '+title,
    back:'Resposta sintética de interface.',sourceId,locator:{pages:[n],paragraphs:[]},relationBasis:'document-grounded',refIds:[]})),
  questions:[{id:'library-study-sections-'+id+'-q1',stem:'Situação sintética de interface · '+title,
    choices:[{id:'A',text:'Seleção de teste inicial.',why:'Retorno sintético para conferir o painel.'},
      {id:'B',text:'Seleção de teste esperada.',why:'Retorno sintético para conferir a recuperação.'}],
    answer:'B',takeaway:'Somente teste de interface, sem orientação clínica.',sourceIds:[sourceId],refIds:[referenceId],relationBasis:'topic-application'}],
});
const fixture=()=>({units:[
  unit('tb','Tuberculose pulmonar e Mal de Pott','infectologia'),
  unit('igg4','Doença relacionada à IgG4-RD','reumatologia'),
  unit('micoses','Criptococose e micose sistêmica','infectologia'),
  unit('sepse','Resposta sintética de teste','sepse-choque'),
  unit('ventilacao','Resposta sintética de teste','vm-sdra'),
  unit('renal','Resposta sintética de teste','nefro-aki-trs'),
  unit('eletrolitos','Resposta sintética de teste','disturbios-eletroliticos'),
  unit('unrelated','Outbreak sem tema relacionado','saude-coletiva-epidemiologia'),
]});

test('há seis seções editoriais únicas, sem criar identificadores de documentos privados',()=>{
  assert.deepEqual(CLINICAL_STUDY_TOPICS.map(x=>x.id),['tb','igg4','micoses','sepse','ventilacao','renal']);
  assert.equal(new Set(CLINICAL_STUDY_TOPICS.map(x=>x.id)).size,6);
  for(const item of CLINICAL_STUDY_TOPICS){
    assert.equal(clinicalStudyTopic(item.id)?.id,item.id);
    assert.doesNotMatch(JSON.stringify(item),/library-study-source-|\/Users\/|CloudDocs|modifiedMs|modifiedNs/);
  }
});

test('TB usa palavras e prefixos clínicos explícitos, sem encontrar letras dentro de outbreak',()=>{
  for(const title of ['Tuberculose pulmonar','Neuro-TB','Mal de Pott','TB resistente'])
    assert.equal(unitMatchesClinicalSection(unit('check',title,'clinica-medica'),'tb'),true,title);
  assert.equal(unitMatchesClinicalSection(unit('check','Outbreak de amostra','infectologia'),'tb'),false);
  assert.equal(unitMatchesClinicalSection(unit('check','Pneumonia de amostra','infectologia'),'tb'),false);
});

test('IgG4 e micoses reconhecem variantes, acentos e sua própria família temática',()=>{
  assert.equal(unitMatchesClinicalSection(unit('check','Doença IgG4-RD','clinica-medica'),'igg4'),true);
  assert.equal(unitMatchesClinicalSection(unit('check','Doença IgG5','reumatologia'),'igg4'),false);
  for(const title of ['Infecção fúngica','Candidemia','Aspergilose','Histoplasmose','Mucormicose','Criptococose'])
    assert.equal(unitMatchesClinicalSection(unit('check',title,'clinica-medica'),'micoses'),true,title);
});

test('sepse, ventilação e renal incluem os temas canônicos, com eletrólitos na trilha renal',()=>{
  assert.equal(unitMatchesClinicalSection(unit('check','Amostra','sepse-choque'),'sepse'),true);
  assert.equal(unitMatchesClinicalSection(unit('check','Amostra','vm-sdra'),'ventilacao'),true);
  assert.equal(unitMatchesClinicalSection(unit('check','Amostra','nefro-aki-trs'),'renal'),true);
  assert.equal(unitMatchesClinicalSection(unit('check','Amostra','disturbios-eletroliticos'),'renal'),true);
  assert.equal(unitMatchesClinicalSection(unit('check','Amostra','saude-coletiva-epidemiologia'),'renal'),false);
});

test('as contagens vêm exclusivamente das unidades correspondentes do pacote atual',()=>{
  const pkg=fixture(),before=JSON.stringify(pkg);
  for(const id of ['tb','igg4','micoses','sepse','ventilacao'])
    assert.deepEqual(clinicalSectionCounts(pkg,id),{units:1,particles:3,cards:2,questions:1});
  assert.deepEqual(clinicalSectionCounts(pkg,'renal'),{units:2,particles:6,cards:4,questions:2});
  assert.equal(JSON.stringify(pkg),before);
});

test('seção sem correspondência informa contagens vazias e nunca traz outro tema',()=>{
  const pkg={units:[unit('unrelated','Outbreak de amostra','saude-coletiva-epidemiologia')]};
  for(const {id} of CLINICAL_STUDY_TOPICS)
    assert.deepEqual(clinicalSectionCounts(pkg,id),{units:0,particles:0,cards:0,questions:0});
});

test('referências e nomes de arquivos não inferem assunto nem a ausência de pacote fabrica contagem',()=>{
  const other=unit('check','Conteúdo sem afinidade','saude-coletiva-epidemiologia');
  other.sourceIds=['library-study-tb-source'];other.refIds=['tb-guideline'];
  assert.equal(unitMatchesClinicalSection(other,'tb'),false);
  assert.equal(unitMatchesClinicalSection(other,'desconhecida'),false);
  assert.equal(clinicalStudyTopic('desconhecida'),null);
  assert.deepEqual(clinicalSectionCounts(null,'tb'),{units:0,particles:0,cards:0,questions:0});
});

test('o componente de navegação não envia dados privados nem os grava em localStorage',async()=>{
  const text=await readFile(new URL('../02_Biblioteca_IA_Engine/assets/clinical-study-sections.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(text,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage\./);
});

test('a Biblioteca mantém um único player privado e expõe a nova seção no HTML',async()=>{
  const html=await readFile(new URL('../02_Biblioteca_IA_Engine/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/id="libraryPrivateStudyHost"/g)||[]).length,1);
  assert.ok(/id="clinicalStudySections"/.test(html),'o host das seis seções deve existir no HTML');
});
