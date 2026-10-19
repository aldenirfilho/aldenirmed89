import test from 'node:test';
import assert from 'node:assert/strict';
import {NEURO_TB_LEARNING as neuro} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-neuro-tb.mjs';
import {TB_RESISTENTE_LEARNING as resistant} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-tb-resistente.mjs';
import {ADVANCED_TB_SOURCES as sources} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/advanced-tb-sources.mjs';
import {EXPANSION_SOURCES} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/pulmonary-expansion-data.mjs';
import {gradeExam} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';

const banks=[neuro,resistant];
const items=banks.flatMap(b=>[...b.cases,...b.flashcards,...b.particles]);
const answer=id=>{const item=items.find(row=>row.id===id);return item.choices[item.answer];};
const phases=['contexto','mecanismo','decisao','transferencia'];

test('contrato dos dois bancos: 12 conceitos, 12 casos, 24 cards e 48 partículas',()=>{
  assert.deepEqual(banks.map(b=>b.module),['neuro-tb','tb-resistente']);
  assert.equal(items.length,84);
  assert.equal(new Set(items.map(item=>item.id)).size,84);
  for(const bank of banks){
    assert.equal(bank.clinicalStatus,'Prévia educacional — revisão médica formal pendente');
    assert.equal(bank.concepts.length,6);
    for(const [collection,kind,count] of [[bank.cases,'c',6],[bank.flashcards,'f',12],[bank.particles,'p',24]]){
      assert.equal(collection.length,count);
      for(const [i,item] of collection.entries()){
        assert.equal(item.id,`${bank.module}-${kind}${String(i+1).padStart(2,'0')}`);
        assert.equal(item.module,bank.module);
        assert.ok(Number.isInteger(item.level)&&item.level>=1&&item.level<=3);
      }
    }
  }
});

test('cada conceito tem mapa completo 1/2/4 sem órfãos, colisões ou inferência por palavras',()=>{
  const concepts=new Set();
  for(const bank of banks){
    const mapped=[];
    for(const concept of bank.concepts){
      assert.ok(!concepts.has(concept.id));concepts.add(concept.id);
      assert.equal(concept.module,bank.module);
      assert.ok(concept.label.length>5&&concept.comment.length>20);
      assert.equal(concept.caseIds.length,1);
      assert.equal(concept.cardIds.length,2);
      assert.equal(concept.particleIds.length,4);
      const ids=[...concept.caseIds,...concept.cardIds,...concept.particleIds];
      for(const id of ids){const item=items.find(item=>item.id===id);assert.ok(item,id);assert.equal(item.module,bank.module);assert.equal(item.topic,concept.label);}
      assert.deepEqual(concept.particleIds.map(id=>items.find(item=>item.id===id).phase),phases);
      mapped.push(...ids);
    }
    assert.equal(new Set(mapped).size,42);
    assert.deepEqual(new Set(mapped),new Set([...bank.cases,...bank.flashcards,...bank.particles].map(item=>item.id)));
  }
  assert.equal(concepts.size,12);
});

test('casos autorais têm quatro alternativas distintas, explicadas e gabarito válido',()=>{
  for(const bank of banks){
    assert.ok(new Set(bank.cases.map(item=>item.answer)).size>=3);
    for(const item of bank.cases){
      assert.match(item.stem,/^Caso sintético\./);
      for(const key of ['title','stem','question','takeaway'])assert.ok(item[key]?.length>12,`${item.id}: ${key}`);
      assert.equal(item.choices.length,4);
      assert.equal(new Set(item.choices.map(c=>c.text)).size,4);
      assert.ok(Number.isInteger(item.answer)&&item.answer>=0&&item.answer<4);
      for(const choice of item.choices)assert.ok(choice.text.length>20&&choice.why.length>30,item.id);
      assert.match(item.choices[item.answer].why,/^Correto\./);
    }
    for(const item of bank.flashcards)for(const key of ['front','back','pitfall'])assert.ok(item[key]?.length>20,`${item.id}: ${key}`);
    for(const item of bank.particles)for(const key of ['title','prompt','answer','takeaway'])assert.ok(item[key]?.length>10,`${item.id}: ${key}`);
  }
});

test('fontes novas têm namespace próprio e todos os itens resolvem no registry avançado',()=>{
  const allowed=/(^|\.)(who\.int|ncbi\.nlm\.nih\.gov|hiv\.gov|gov\.br|idsociety\.org|cdc\.gov)$/;
  for(const [key,source]of Object.entries(sources)){
    assert.match(key,/^advtb[A-Z]/);
    assert.ok(!Object.hasOwn(EXPANSION_SOURCES,key));
    const url=new URL(source.url);assert.equal(url.protocol,'https:');assert.match(url.hostname,allowed);
    assert.ok(source.title.length>15&&source.scope.length>40);
    assert.ok(Number.isInteger(source.year)&&source.year>=2019&&source.year<=2026);
  }
  for(const item of items){
    assert.ok(Array.isArray(item.sources)&&item.sources.length>0,item.id);
    for(const key of item.sources)assert.ok(sources[key],`${item.id}: ${key}`);
  }
  assert.match(sources.advtbWHOSteroids.url,/\.pdf#page=20$/);
  assert.match(sources.advtbWHO2026.scope,/403/);
  assert.match(sources.advtbMS2026.scope,/revoga a Nota 1\/2025/);
});

test('motor de correção aceita casos avançados e diferencia erro de ausência',()=>{
  const cases=banks.flatMap(b=>b.cases),answers=Object.fromEntries(cases.map(c=>[c.id,c.answer]));
  assert.equal(gradeExam(cases,answers).correct,12);
  answers[cases[0].id]=(cases[0].answer+1)%4;delete answers[cases[1].id];
  const result=gradeExam(cases,answers);
  assert.equal(result.correct,10);assert.equal(result.unanswered,1);
  assert.equal(result.items[0].correct,false);assert.equal(result.items[1].selected,null);
});

test('neuro-TB preserva teste negativo, segurança do líquor e investigação de complicações',()=>{
  assert.match(answer('neuro-tb-c01').text,/sem aguardar a cultura final/);
  assert.match(answer('neuro-tb-c02').text,/neurológica\/neurocirúrgica.*individualizar coleta/);
  assert.match(answer('neuro-tb-c03').text,/infarto e atividade epiléptica/);
  assert.match(answer('neuro-tb-c04').text,/não confirmar tuberculoma pelo padrão isolado/);
  assert.match(neuro.flashcards.find(c=>c.id==='neuro-tb-f08').back,/linfoma/);
  assert.match(answer('neuro-tb-c06').text,/falha, resistência, diagnósticos alternativos e complicações/);
});

test('corticoide mantém divergência no HIV e HARVEST é tratado como ensaio publicado',()=>{
  assert.match(answer('neuro-tb-c05').text,/NIH mantém indicação.*consórcio recomenda caso a caso.*WHO 2025.*6–8/);
  assert.match(answer('neuro-tb-c05').why,/12 semanas/);
  const card=neuro.flashcards.find(c=>c.id==='neuro-tb-f10');
  assert.match(card.back,/forte sem HIV.*com HIV.*caso a caso.*NIH mantém indicação/);
  assert.equal(sources.advtbHARVEST.year,2025);
  assert.match(sources.advtbHARVEST.scope,/não demonstrou benefício.*dano potencial/);
  assert.match(neuro.flashcards.find(c=>c.id==='neuro-tb-f02').back,/publicado em dezembro\/2025.*não demonstrou/);
});

test('definições XDR usam fluoroquinolona e bedaquilina/linezolida sem exigir injetável',()=>{
  const item=resistant.cases[0];
  assert.match(item.stem,/rifampicina.*fluoroquinolona.*linezolida/);
  assert.match(answer(item.id).text,/XDR: rifampicina \+ qualquer fluoroquinolona \+ ao menos bedaquilina ou linezolida/);
  assert.match(answer(item.id).why,/mesmo sem resultado de isoniazida/);
  const rr=resistant.flashcards.find(c=>c.id==='tb-resistente-f01');
  assert.match(rr.back,/MDR exige rifampicina e isoniazida/);
  assert.match(rr.back,/RR operacional/);
  assert.match(resistant.flashcards.find(c=>c.id==='tb-resistente-f02').back,/Pré-XDR: MDR\/RR.*fluoroquinolona.*XDR acrescenta.*bedaquilina ou linezolida/);
});

test('regimes curtos dependem de sítio, susceptibilidade e estratégia específica',()=>{
  assert.match(answer('tb-resistente-c02').text,/completar testes oportunos.*sem retardar/);
  assert.match(answer('tb-resistente-c03').text,/Não transferir automaticamente.*SNC.*plano especializado/);
  const exclusions=resistant.flashcards.find(c=>c.id==='tb-resistente-f06').back;
  for(const term of ['SNC','osteoarticular','disseminada','Gestação/lactação'])assert.ok(exclusions.includes(term));
  assert.match(answer('tb-resistente-c04').text,/regimes de nove meses aqui descritos.*exclusão de resistência à fluoroquinolona/);
  assert.match(resistant.flashcards.find(c=>c.id==='tb-resistente-f08').back,/extensão selecionada de BPaL e não prolongamento automático de BPaLM/);
});

test('toxicidade, referência e transmissão recebem decisões de equipe, sem doses automáticas',()=>{
  assert.match(answer('tb-resistente-c05').text,/hemograma, ECG\/eletrólitos e interações.*equipe/);
  assert.match(resistant.flashcards.find(c=>c.id==='tb-resistente-f10').back,/Citopenias.*neuropatia periférica.*alterações visuais/);
  assert.match(answer('tb-resistente-c06').text,/referência.*vigilância.*proteção respiratória.*continuidade/);
  const body=JSON.stringify(items);
  assert.doesNotMatch(body,/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg)\s*(?:\/\s*kg|\/\s*dia|a cada)/);
  assert.doesNotMatch(body,/(?:aprovado|homologado|revisado) por (?:médico|especialista)/i);
});
