import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPANSION_SOURCES, PULMONARY_SECTIONS, CORTICOSTEROID_GUIDE, SEVERITY_ALERTS
} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/pulmonary-expansion-data.mjs';

const textOf = item => Object.values(item).filter(v => typeof v === 'string').join(' ');
const blocks = PULMONARY_SECTIONS.flatMap(s => s.blocks);
const guide = term => CORTICOSTEROID_GUIDE.find(item => item.setting.includes(term));
const checkSources = item => {
  assert.ok(Array.isArray(item.sourceIds) && item.sourceIds.length > 0);
  for (const id of item.sourceIds) assert.ok(EXPANSION_SOURCES[id], `Fonte não resolvida: ${id}`);
};

test('três seções adultas, 30 conceitos distintos e 120 micropartículas completas', () => {
  assert.deepEqual(PULMONARY_SECTIONS.map(s => s.id), ['raras', 'tb-pulmonar', 'tb-extra']);
  assert.equal(blocks.length, 30);
  assert.equal(new Set(blocks.map(b => b.id)).size, 30);
  let particles = 0;
  for (const section of PULMONARY_SECTIONS) {
    assert.equal(section.blocks.length, 10);
    assert.equal(section.clinicalStatus, 'Prévia educacional — revisão médica formal pendente');
    for (const field of ['title', 'kicker', 'summary']) assert.ok(section[field]?.trim());
    for (const [index, block] of section.blocks.entries()) {
      const expected = `${section.id}-${String(index + 1).padStart(2, '0')}`;
      assert.equal(block.id, expected);
      assert.equal(block.image, `assets/expansao/${expected}.png`);
      for (const field of ['title', 'signal', 'mechanism', 'decision', 'pitfall', 'severity', 'imageAlt', 'caption']) {
        assert.equal(typeof block[field], 'string');
        assert.ok(block[field].trim().length >= 12, `${expected}: ${field} sem conteúdo`);
        assert.ok(block[field].length <= 500, `${expected}: ${field} deixou de ser uma micropartícula`);
      }
      for (const field of ['signal', 'mechanism', 'decision', 'pitfall']) {
        particles++;
        assert.notEqual(block[field], block.caption);
      }
      checkSources(block);
    }
  }
  assert.equal(particles, 120);
  assert.equal(new Set(blocks.map(b => b.imageAlt)).size, 30);
  assert.equal(new Set(blocks.map(b => b.caption)).size, 30);
});

test('todas as afirmações de guias e alertas possuem referências primárias resolvidas', () => {
  assert.ok(CORTICOSTEROID_GUIDE.length >= 8);
  assert.ok(SEVERITY_ALERTS.length >= 5);
  [...CORTICOSTEROID_GUIDE, ...SEVERITY_ALERTS].forEach(checkSources);
  const primaryHosts = /(^|\.)(who\.int|ncbi\.nlm\.nih\.gov|gov\.br|cdc\.gov|idsociety\.org|hiv\.gov|worldgastroenterology\.org|cff\.org|ersnet\.org)$/;
  for (const [id, source] of Object.entries(EXPANSION_SOURCES)) {
    assert.ok(source.title && source.scope && Number.isInteger(source.year), id);
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.match(url.hostname, primaryHosts, id);
    assert.ok(source.year <= 2026 && source.year >= 2010, id);
  }
  assert.match(EXPANSION_SOURCES.who2026.scope, /não foi conferido/);
  assert.match(EXPANSION_SOURCES.whoSteroids.scope, /2026/);
  assert.match(EXPANSION_SOURCES.idsaHistoplasma.scope, /não cobre integralmente/);
});

test('meningite tem indicação adjuvante sem transformar durações distintas em regra universal', () => {
  const who = guide('Meningite tuberculosa');
  assert.ok(who.sourceIds.includes('whoSteroids'));
  assert.match(who.recommendation, /dexametasona ou prednisolona/);
  assert.match(who.recommendation, /6–8 semanas/);
  assert.match(who.recommendation, /junto à terapia antituberculosa/);
  const hiv = guide('TB do SNC');
  assert.ok(hiv.sourceIds.includes('nihTB'));
  assert.match(hiv.recommendation, /12 semanas/);
  assert.match(hiv.rationale, /não fundir/);
});

test('pericardite explicita recomendação condicional e divergência em HIV', () => {
  const selective = guide('indicação seletiva');
  assert.match(selective.recommendation, /condicional/);
  assert.match(selective.recommendation, /não usar rotineiramente/);
  assert.ok(selective.sourceIds.includes('whoSteroids') && selective.sourceIds.includes('idsaTB'));
  const hiv = guide('Pericardite tuberculosa em pessoas com HIV');
  assert.match(hiv.recommendation, /recomenda contra/);
  assert.ok(hiv.sourceIds.includes('nihTB'));
  assert.match(textOf(PULMONARY_SECTIONS[2].blocks[3]), /tamponamento/);
});

test('sítios simples, miliar e IRIS não recebem a indicação da meningite por extensão', () => {
  const simple = guide('TB pulmonar simples');
  assert.match(simple.setting, /pleural.*ganglionar/);
  assert.match(simple.recommendation, /Não usar.*rotina/);
  assert.match(guide('miliar/disseminada').recommendation, /permanece incerto/);
  const iris = guide('TB-IRIS');
  assert.match(iris.recommendation, /selecionadas.*especializado/);
  assert.match(iris.rationale, /excluir falha terapêutica, resistência e outras infecções/);
});

test('risco de Strongyloides é avaliado em paralelo à urgência do SNC', () => {
  const item = guide('Strongyloides');
  assert.ok(item.sourceIds.includes('cdcStrongyloides'));
  assert.match(item.recommendation, /exposição epidemiológica/);
  assert.match(item.rationale, /hiperinfecção e disseminação/);
  assert.match(item.rationale, /sem atrasar o tratamento urgente/);
});

test('PCP mantém os operadores exatos e não extrapola o benefício do HIV', () => {
  const item = guide('PCP associada');
  assert.match(item.recommendation, /PaO₂ em ar ambiente <70 mmHg OU gradiente A–a ≥35 mmHg/);
  assert.match(item.recommendation, /até 72 horas/);
  assert.match(item.rationale, /sem HIV, não aplicar automaticamente/);
  assert.ok(item.sourceIds.includes('nihPCP'));
  assert.doesNotMatch(textOf(item), /PaO₂.*≤70|A–a >35/);
  assert.match(guide('Criptococose').recommendation, /não deve ser usado para controlar hipertensão intracraniana/);
});

test('alertas cobrem órgãos ameaçados e evitam volume fixo para hemoptise', () => {
  for (const term of ['Meningoencefalite', 'SDRA', 'Hemoptise', 'Tamponamento', 'Compressão medular']) {
    const alert = SEVERITY_ALERTS.find(a => a.title.includes(term));
    assert.ok(alert, term);
    assert.ok(alert.signals.length > 25 && alert.action.length > 25);
  }
  assert.match(SEVERITY_ALERTS.find(a => a.title.includes('Hemoptise')).signals, /independentemente/);
  assert.doesNotMatch(JSON.stringify({ blocks, CORTICOSTEROID_GUIDE }), /\b\d+(?:[.,]\d+)?\s*mg\s*\/\s*kg|\b\d+\s*mg\s*\/\s*dia/);
});
