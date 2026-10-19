import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPECIALTY_SOURCES, SPECIALTY_SECTIONS
} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/specialty-sections-data.mjs';

const pott = SPECIALTY_SECTIONS.find(s => s.id === 'pott');
const igg4 = SPECIALTY_SECTIONS.find(s => s.id === 'igg4');
const textOf = value => JSON.stringify(value);
const checkSources = item => {
  assert.ok(Array.isArray(item.sourceIds) && item.sourceIds.length > 0);
  assert.equal(new Set(item.sourceIds).size, item.sourceIds.length);
  for (const id of item.sourceIds) assert.ok(SPECIALTY_SOURCES[id], `Fonte não resolvida: ${id}`);
};

test('dois temas em prévia, 12 conexões e 48 micropartículas distintas completas', () => {
  assert.deepEqual(SPECIALTY_SECTIONS.map(s => s.id), ['pott', 'igg4']);
  const ids = new Set();
  let particles = 0;
  for (const section of SPECIALTY_SECTIONS) {
    assert.equal(section.clinicalStatus, 'Prévia educacional — revisão médica formal pendente');
    for (const field of ['title', 'kicker', 'summary']) assert.ok(section[field]?.trim());
    assert.equal(section.steps.length, 6);
    assert.ok(section.redFlags.length >= 4);
    section.redFlags.forEach(flag => assert.ok(typeof flag === 'string' && flag.trim().length >= 25));
    for (const [index, step] of section.steps.entries()) {
      assert.equal(step.id, `${section.id}-${String(index + 1).padStart(2, '0')}`);
      assert.ok(!ids.has(step.id));
      ids.add(step.id);
      assert.ok(step.title.trim());
      const phases = ['signal', 'mechanism', 'decision', 'pitfall'].map(field => {
        assert.ok(typeof step[field] === 'string' && step[field].trim().length >= 20);
        assert.ok(step[field].length <= 350, `${step.id}/${field}: partícula excessiva`);
        particles++;
        return step[field];
      });
      assert.equal(new Set(phases).size, 4);
      checkSources(step);
    }
  }
  assert.equal(ids.size, 12);
  assert.equal(particles, 48);
});

test('diferenciais com pistas, discriminadores, armadilhas e referências resolvidas', () => {
  for (const section of SPECIALTY_SECTIONS) {
    assert.ok(section.differentials.length >= 5);
    assert.equal(new Set(section.differentials.map(d => d.name)).size, section.differentials.length);
    for (const differential of section.differentials) {
      for (const field of ['name', 'clues', 'discriminator', 'caution']) {
        assert.ok(typeof differential[field] === 'string' && differential[field].trim().length >= 10);
      }
      checkSources(differential);
    }
  }
  const pottNames = pott.differentials.map(d => d.name).join(' ');
  assert.match(pottNames, /piogênica/);
  assert.match(pottNames, /mieloma.*linfoma/);
  assert.match(pottNames, /Brucella/);
  assert.match(pottNames, /fúngica/);
  assert.match(pottNames, /Fratura/);
  const igg4Names = igg4.differentials.map(d => d.name).join(' ');
  for (const term of ['Linfoma', 'Câncer', 'TB', 'micoses', 'Sjögren', 'ANCA', 'Sarcoidose', 'Castleman']) {
    assert.ok(igg4Names.includes(term), `Diferencial ausente: ${term}`);
  }
});

test('fontes primárias com ano de publicação e limites explícitos de escopo', () => {
  const hosts = new Set(['www.idsociety.org', 'www.gov.br', 'tbksp.who.int', 'rheumatology.org', 'igg4.jp', 'www.nature.com', 'link.springer.com', 'www.jstage.jst.go.jp', 'pubmed.ncbi.nlm.nih.gov']);
  const used = new Set(SPECIALTY_SECTIONS.flatMap(s => [...s.steps, ...s.differentials]).flatMap(item => item.sourceIds));
  assert.deepEqual([...used].sort(), Object.keys(SPECIALTY_SOURCES).sort());
  for (const source of Object.values(SPECIALTY_SOURCES)) {
    assert.ok(source.title.trim() && source.scope.trim());
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(hosts.has(url.hostname));
    assert.ok(Number.isInteger(source.year) && source.year >= 2012 && source.year <= 2026);
  }
  assert.match(SPECIALTY_SOURCES.msTB.scope, /não transforma.*edição 2026/);
  assert.match(SPECIALTY_SOURCES.whoDiagnosis.scope, /não inclui tecido vertebral/);
  assert.match(SPECIALTY_SOURCES.acrEular.scope, /não estabelecem o diagnóstico/);
  assert.equal(SPECIALTY_SOURCES.orbitalMimics2025.year, 2025);
});

test('Pott: urgência neural e sepse não aguardam biópsia; imagem e teste isolados não encerram etiologia', () => {
  assert.match(textOf(pott.redFlags), /urinária\/intestinal/);
  assert.match(textOf(pott.redFlags), /não atrasar intervenção.*aguardar biópsia/);
  assert.match(pott.steps[0].decision, /RM urgente.*coluna\/neurocirurgia/);
  assert.match(pott.steps[3].pitfall, /clinicamente estável.*antes.*quando viável.*urgências/);
  assert.match(pott.steps[2].pitfall, /não identifica sozinho o agente/);
  assert.match(pott.steps[4].decision, /validação laboratorial/);
  assert.match(pott.steps[4].pitfall, /negativo isolado não exclui TB.*granuloma isolado não prova/);
  assert.match(pott.steps[5].pitfall, /corticoide não é rotina.*isolada/);
});

test('IgG4: diagnóstico integrado, classificação separada e exclusão de infecção/neoplasia antes de imunossupressão', () => {
  assert.match(igg4.steps[1].pitfall, /sérica isolada confirma.*normal exclui/);
  assert.match(igg4.steps[2].mechanism, /fibrose estoriforme.*flebite obliterante/);
  assert.match(igg4.steps[2].pitfall, /sem morfologia\/contexto não bastam/);
  assert.match(igg4.steps[3].signal, /Infecção, linfoma e câncer/);
  assert.match(igg4.steps[3].pitfall, /Não usar teste terapêutico com corticoide/);
  assert.match(igg4.steps[4].mechanism, /pesquisa/);
  assert.match(igg4.steps[4].pitfall, /não exclui doença clínica.*não dispensa.*mimetizadores/);
  assert.match(igg4.steps[5].pitfall, /Resposta ao corticoide não prova/);
  const flags = textOf(igg4.redFlags);
  for (const term of ['visual', 'Hidronefrose', 'aorta', 'biliar', 'infecção e neoplasia']) assert.ok(flags.includes(term));
});

test('conteúdo diagnóstico não contém doses prescritivas nem coleta dados de pacientes', () => {
  const text = textOf(SPECIALTY_SECTIONS);
  assert.doesNotMatch(text, /\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|UI)(?:\b|\/)/i);
  assert.doesNotMatch(text, /\b(?:CPF|prontuário|nome do paciente)\b/i);
});
