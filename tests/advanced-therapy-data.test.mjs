import test from 'node:test';
import assert from 'node:assert/strict';
import {ANTIFUNGICOS_LEARNING as antifungals} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-antifungicos.mjs';
import {IGG4_TRATAMENTO_LEARNING as igg4} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-igg4-tratamento.mjs';
import {ADVANCED_THERAPY_SOURCES as sources} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/advanced-therapy-sources.mjs';

const banks = [antifungals,igg4];
const fields = (item,names) => names.forEach(name=>assert.ok(typeof item[name]==='string' && item[name].trim().length>=10,`${item.id}: ${name} incompleto`));
const textOf = item => JSON.stringify(item);
const correctText = item => item.choices[item.answer].text;
const find = (bank,id) => [...bank.cases,...bank.flashcards,...bank.particles].find(item=>item.id===`${bank.module}-${id}`);

test('dois bancos em prévia: 12 casos, 24 cards e 48 partículas com esquema utilizável',()=>{
  assert.deepEqual(banks.map(b=>b.module),['antifungicos','igg4-tratamento']);
  const ids=new Set();
  for(const bank of banks){
    assert.equal(bank.clinicalStatus,'Prévia educacional — revisão médica formal pendente');
    assert.equal(bank.concepts.length,6);
    for(const [kind,items,count] of [['c',bank.cases,6],['f',bank.flashcards,12],['p',bank.particles,24]]){
      assert.equal(items.length,count);
      for(const [index,item] of items.entries()){
        assert.equal(item.id,`${bank.module}-${kind}${String(index+1).padStart(2,'0')}`);
        assert.ok(!ids.has(item.id));ids.add(item.id);
        assert.equal(item.module,bank.module);
        assert.ok([1,2,3].includes(item.level));
        assert.ok(item.topic?.trim());
        if(kind==='c'){
          fields(item,['title','stem','question','takeaway']);
          assert.match(item.stem,/Caso sintético/);
          assert.equal(item.choices.length,4);
          assert.equal(new Set(item.choices.map(c=>c.text)).size,4);
          item.choices.forEach(c=>fields({...c,id:item.id},['text','why']));
          assert.ok(Number.isInteger(item.answer) && item.answer>=0 && item.answer<4);
          assert.match(item.choices[item.answer].why,/^Correto\./);
        }
        if(kind==='f') fields(item,['front','back','pitfall']);
        if(kind==='p'){
          fields(item,['title','prompt','answer','takeaway']);
          assert.equal(item.phase,['contexto','mecanismo','decisao','transferencia'][index%4]);
          assert.ok(item.answer.length<=400);
        }
      }
    }
  }
  assert.equal(ids.size,84);
});

test('cada conceito conecta exatamente 1 caso, 2 cards e 4 fases sem perda ou duplicação',()=>{
  for(const bank of banks){
    const claimed={caseIds:[],cardIds:[],particleIds:[]};
    for(const concept of bank.concepts){
      assert.equal(concept.module,bank.module);
      fields({...concept,id:concept.id},['label','comment']);
      assert.equal(concept.caseIds.length,1);
      assert.equal(concept.cardIds.length,2);
      assert.equal(concept.particleIds.length,4);
      for(const [key,items] of [['caseIds',bank.cases],['cardIds',bank.flashcards],['particleIds',bank.particles]]){
        for(const id of concept[key]){
          const item=items.find(candidate=>candidate.id===id);
          assert.ok(item,`${concept.id}: ligação inválida ${id}`);
          assert.equal(item.topic,concept.label);
          claimed[key].push(id);
        }
      }
      assert.deepEqual(concept.particleIds.map(id=>bank.particles.find(p=>p.id===id).phase),['contexto','mecanismo','decisao','transferencia']);
    }
    for(const [key,items] of [['caseIds',bank.cases],['cardIds',bank.flashcards],['particleIds',bank.particles]]){
      assert.deepEqual(claimed[key],[...new Set(claimed[key])]);
      assert.deepEqual([...claimed[key]].sort(),items.map(i=>i.id).sort());
    }
  }
});

test('toda afirmação treinável e todo conceito têm fontes resolvidas com chaves próprias',()=>{
  const used=new Set();
  for(const bank of banks){
    for(const item of [...bank.concepts,...bank.cases,...bank.flashcards,...bank.particles]){
      assert.ok(Array.isArray(item.sources) && item.sources.length>0,item.id);
      assert.equal(new Set(item.sources).size,item.sources.length);
      for(const id of item.sources){assert.ok(sources[id],`${item.id}: fonte ${id}`);used.add(id);}
    }
  }
  assert.deepEqual([...used].sort(),Object.keys(sources).sort());
  for(const [id,source] of Object.entries(sources)){
    assert.match(id,/^adv[A-Z][A-Za-z0-9]+$/);
    fields({...source,id},['title','scope']);
    assert.equal(new URL(source.url).protocol,'https:');
    assert.ok(Number.isInteger(source.year) && source.year>=2015 && source.year<=2026);
  }
});

test('antifúngicos preservam agente, controle de foco, colonização e exceções de compartimento',()=>{
  assert.match(correctText(find(antifungals,'c01')),/equinocandina.*controle do foco/);
  assert.match(find(antifungals,'p01').answer,/Geralmente não.*colonização/);
  assert.match(correctText(find(antifungals,'c02')),/baixa excreção urinária/);
  assert.match(textOf(find(antifungals,'f04')),/tecido renal.*baixa concentração urinária/);
  assert.match(find(antifungals,'f03').back,/Não.*resgate.*especializadas/);
  assert.match(find(antifungals,'f08').back,/hepática.*farmacocinética/);
});

test('histoplasmose 2026 e toxicidades de anfotericina/flucitosina têm limites claros',()=>{
  assert.match(sources.advHistoplasma2026.scope,/16\/09\/2026/);
  assert.match(correctText(find(antifungals,'c03')),/anfotericina B inicial.*lipossomal/);
  assert.match(correctText(find(antifungals,'c04')),/renal, potássio, magnésio.*nefrotóxicos/);
  assert.match(correctText(find(antifungals,'c06')),/renal.*hemograma.*níveis/);
  assert.match(find(antifungals,'f11').back,/toxicidade medular/);
  assert.match(find(antifungals,'p24').answer,/HIV.*não é rotina.*pressão intracraniana/);
});

test('azóis não são uniformizados em QT, espectro ou indicação de TDM',()=>{
  const answer=correctText(find(antifungals,'c05'));
  assert.match(answer,/isavuconazol pode encurtar QT/);
  assert.match(answer,/fluconazol não cobre Aspergillus/);
  assert.match(find(antifungals,'f10').back,/indicação varia por azol e contexto/);
  assert.match(find(antifungals,'p17').answer,/interação.*monitorização de ambos/);
});

test('IgG4 exige diagnóstico integrado e diferencia atividade, fibrose e ameaça ao órgão',()=>{
  assert.match(correctText(find(igg4,'c01')),/urgência.*tecido.*infecção\/neoplasia/);
  assert.match(find(igg4,'f01').pitfall,/resposta ao corticoide.*confirmação/);
  assert.match(find(igg4,'f02').back,/reversibilidade.*diferem/);
  assert.match(correctText(find(igg4,'c02')),/gradual.*individualizadas/);
  assert.match(correctText(find(igg4,'c06')),/obstrução.*atividade versus dano/);
});

test('biológicos: comparação correta, datas distintas e aprovação brasileira verificada',()=>{
  const answer=correctText(find(igg4,'c03'));
  assert.match(answer,/anti-CD20.*off-label.*EUA/);
  assert.match(answer,/anti-CD19.*FDA e pela Anvisa em 2025/);
  assert.match(sources.advMitigate2025.scope,/14\/11\/2024/);
  assert.equal(sources.advMitigate2025.year,2025);
  assert.match(sources.advAnvisaInebilizumab.scope,/DOU 28\/04\/2025/);
  assert.match(find(igg4,'f06').back,/placebo.*acesso.*distintas/);
  assert.match(find(igg4,'p12').answer,/Não.*verificação própria/);
});

test('segurança antes e durante depleção B inclui triagem, vacinas e infecção ativa',()=>{
  const answer=correctText(find(igg4,'c04'));
  for(const term of ['TB ativa/latente','HBV','imunoglobulinas','HIV','vacinas'])assert.ok(answer.includes(term));
  assert.match(find(igg4,'f08').back,/restrições às vivas/);
  assert.match(correctText(find(igg4,'c05')),/investigar infecção.*imunoglobulinas/);
  assert.match(find(igg4,'p19').answer,/Adiar.*até resolução da infecção/);
  assert.match(find(igg4,'f12').back,/função orgânica.*infecções.*toxicidade/);
});

test('conteúdo não contém doses prescritivas nem coleta identificadores de pacientes',()=>{
  for(const bank of banks){
    const text=textOf(bank);
    assert.doesNotMatch(text,/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|UI)(?:\b|\/)/i);
    assert.doesNotMatch(text,/\b(?:CPF|prontuário|nome do paciente)\b/i);
  }
});
