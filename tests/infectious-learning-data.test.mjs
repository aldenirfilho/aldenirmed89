import test from 'node:test';
import assert from 'node:assert/strict';
import { TB_PULMONAR_LEARNING as pulmonary } from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-tb-pulmonar.mjs';
import { TB_EXTRA_LEARNING as extra } from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-tb-extra.mjs';
import { MICOSES_LEARNING as fungi } from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-micoses.mjs';
import { EXPANSION_SOURCES } from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/pulmonary-expansion-data.mjs';
import { gradeExam } from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';

const banks = [pulmonary, extra, fungi];
const allItems = banks.flatMap(b => [...b.cases, ...b.flashcards, ...b.particles]);
const phases = ['contexto', 'mecanismo', 'decisao', 'transferencia'];
const correct = item => item.choices[item.answer];
const text = item => JSON.stringify(item);
const findCase = id => allItems.find(item => item.id === id);

test('cada banco oferece seis conceitos e o conjunto completo 6/12/24, sem colisão de IDs', () => {
  assert.deepEqual(banks.map(b => b.module), ['tb-pulmonar', 'tb-extra', 'micoses']);
  assert.equal(new Set(allItems.map(item => item.id)).size, 126);
  for (const bank of banks) {
    assert.equal(bank.clinicalStatus, 'Prévia educacional — revisão médica formal pendente');
    assert.equal(bank.concepts.length, 6);
    assert.equal(bank.cases.length, 6);
    assert.equal(bank.flashcards.length, 12);
    assert.equal(bank.particles.length, 24);
    for (const [items, kind] of [[bank.cases, 'c'], [bank.flashcards, 'f'], [bank.particles, 'p']]) {
      for (const [index, item] of items.entries()) {
        assert.equal(item.id, `${bank.module}-${kind}${String(index + 1).padStart(2, '0')}`);
        assert.equal(item.module, bank.module);
        assert.ok(Number.isInteger(item.level) && item.level >= 1 && item.level <= 3);
      }
    }
  }
});

test('mapeamento editorial cobre cada caso, card e partícula exatamente uma vez', () => {
  const conceptIds = new Set();
  for (const bank of banks) {
    const mapped = [];
    for (const concept of bank.concepts) {
      assert.ok(!conceptIds.has(concept.id));
      conceptIds.add(concept.id);
      assert.equal(concept.module, bank.module);
      assert.ok(concept.label.length > 5 && concept.comment.length > 20);
      assert.equal(concept.caseIds.length, 1);
      assert.equal(concept.cardIds.length, 2);
      assert.equal(concept.particleIds.length, 4);
      const ids = [...concept.caseIds, ...concept.cardIds, ...concept.particleIds];
      for (const id of ids) {
        const item = allItems.find(row => row.id === id);
        assert.ok(item, `Referência órfã: ${id}`);
        assert.equal(item.module, concept.module);
        assert.equal(item.topic, concept.label);
      }
      assert.deepEqual(concept.particleIds.map(id => allItems.find(item => item.id === id).phase), phases);
      mapped.push(...ids);
    }
    assert.equal(new Set(mapped).size, 42);
    assert.deepEqual(new Set(mapped), new Set([...bank.cases, ...bank.flashcards, ...bank.particles].map(item => item.id)));
  }
  assert.equal(conceptIds.size, 18);
});

test('18 casos sintéticos têm quatro alternativas distintas e todas justificadas', () => {
  for (const bank of banks) {
    assert.ok(new Set(bank.cases.map(item => item.answer)).size >= 3);
    for (const item of bank.cases) {
      assert.match(item.stem, /^Caso sintético\./);
      for (const field of ['title', 'stem', 'question', 'takeaway']) assert.ok(item[field]?.length > 12, `${item.id}: ${field}`);
      assert.equal(item.choices.length, 4);
      assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4);
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4);
      for (const choice of item.choices) assert.ok(choice.text.length > 20 && choice.why.length > 35, item.id);
      assert.match(correct(item).why, /^Correto\./);
    }
  }
});

test('cards e micropartículas são completos e referenciados por fontes existentes', () => {
  for (const bank of banks) {
    for (const item of bank.flashcards) {
      for (const field of ['front', 'back', 'pitfall']) assert.ok(item[field]?.length > 20, `${item.id}: ${field}`);
    }
    for (const item of bank.particles) {
      for (const field of ['title', 'prompt', 'answer', 'takeaway']) assert.ok(item[field]?.length > 10, `${item.id}: ${field}`);
      assert.ok(phases.includes(item.phase));
    }
  }
  for (const item of allItems) {
    assert.ok(Array.isArray(item.sources) && item.sources.length > 0, item.id);
    for (const id of item.sources) assert.ok(EXPANSION_SOURCES[id]?.url.startsWith('https://'), `${item.id}: fonte ${id}`);
  }
});

test('motor do simulado aceita os bancos e mantém acerto, erro e ausência distintos', () => {
  const cases = banks.flatMap(b => b.cases);
  const answers = Object.fromEntries(cases.map(item => [item.id, item.answer]));
  const perfect = gradeExam(cases, answers);
  assert.equal(perfect.correct, 18);
  assert.equal(perfect.unanswered, 0);
  answers[cases[0].id] = (cases[0].answer + 1) % 4;
  delete answers[cases[1].id];
  const mixed = gradeExam(cases, answers);
  assert.equal(mixed.correct, 16);
  assert.equal(mixed.unanswered, 1);
  assert.equal(mixed.items.find(item => item.id === cases[0].id).correct, false);
  assert.equal(mixed.items.find(item => item.id === cases[1].id).selected, null);
});

test('gabaritos de TB pulmonar preservam limites diagnósticos e urgência funcional', () => {
  assert.match(correct(findCase('tb-pulmonar-c01')).text, /Reavaliar.*amostra.*cultura/);
  assert.match(correct(findCase('tb-pulmonar-c02')).text, /controle de fonte.*PFF2\/N95/);
  assert.match(correct(findCase('tb-pulmonar-c03')).text, /sensibilidade.*referência/);
  assert.match(correct(findCase('tb-pulmonar-c04')).text, /paralelo ao suporte/);
  assert.match(correct(findCase('tb-pulmonar-c05')).text, /proteção de via aérea/);
  assert.match(correct(findCase('tb-pulmonar-c06')).text, /Não usar adjuvante rotineiro/);
});

test('SNC e pericardite mantêm as populações, divergências e durações sem receita universal', () => {
  const snc = findCase('tb-extra-c02');
  assert.match(correct(snc).text, /WHO 2025.*6–8 semanas.*NIH\/HIV.*12 semanas/);
  assert.ok(snc.sources.includes('whoSteroids') && snc.sources.includes('nihTB'));
  const pericarditis = findCase('tb-extra-c04');
  assert.match(correct(pericarditis).text, /No HIV, NIH recomenda contra.*WHO 2025 é condicional.*não recomenda uso rotineiro/);
  assert.match(correct(findCase('tb-extra-c03')).text, /neuroimagem.*neurocirúrgica/);
  assert.match(correct(findCase('tb-extra-c06')).text, /Não usar adjuvante de rotina/);
  assert.match(extra.flashcards.find(item => item.id === 'tb-extra-f12').back, /paralelo.*sem atrasá-lo/);
});

test('Pott possui conceito próprio e o déficit novo recebe prioridade urgente', () => {
  const concept = extra.concepts.find(item => item.id === 'tb-extra-pott');
  assert.ok(concept);
  const item = findCase(concept.caseIds[0]);
  assert.match(item.stem, /fraqueza.*retenção urinária/);
  assert.match(correct(item).text, /compressão medular.*urgência/);
  assert.ok(item.sources.includes('idsaTB') && item.sources.includes('msManual'));
});

test('micoses distinguem grave, mecanismo de invasão e controle da pressão criptocócica', () => {
  assert.equal(EXPANSION_SOURCES.idsaHistoplasma.year, 2026);
  assert.match(correct(findCase('micoses-c01')).text, /suporte.*anfotericina B.*lipossomal/);
  assert.match(correct(findCase('micoses-c02')).text, /confirmação laboratorial.*diferencial/);
  assert.match(correct(findCase('micoses-c03')).text, /controle específico da pressão.*corticoide não substitui/);
  assert.match(correct(findCase('micoses-c04')).text, /hospedeiro.*micologia.*precoce/);
  assert.match(correct(findCase('micoses-c06')).text, /coccidioidomicose ao diferencial.*paralelo/);
});

test('PCP testa os limites exatos e o OU, sem extrapolar automaticamente para não HIV', () => {
  const item = findCase('micoses-c05');
  assert.match(item.stem, /PaO₂ 70 mmHg.*35 mmHg/);
  assert.match(correct(item).text, /A–a ≥35 mmHg.*70.*<70/);
  assert.match(correct(item).why, /critérios são alternativos.*OU/);
  const card = fungi.flashcards.find(item => item.id === 'micoses-f09');
  assert.match(card.back, /PaO₂ em ar ambiente <70 mmHg OU gradiente A–a ≥35 mmHg/);
  assert.match(card.back, /72 horas após o início/);
  const transfer = fungi.particles.find(item => item.id === 'micoses-p20');
  assert.match(transfer.answer, /não deve ser transferida automaticamente/i);
});

test('novo conteúdo evita doses prescritivas e alegação de homologação clínica', () => {
  const body = text(allItems);
  assert.doesNotMatch(body, /\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg)\s*(?:\/\s*kg|\/\s*dia|a cada)/);
  assert.doesNotMatch(body, /(?:revisado|aprovado|homologado) por (?:médico|especialista)|questão oficial/i);
  assert.equal(allItems.length, 126);
});
