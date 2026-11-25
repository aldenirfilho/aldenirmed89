import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, addTask, normalizeState, readState, writeState, cards, scheduleReview, dueCards, validateConfig } from '../src/model.mjs';

test('sessão limita a três tarefas e preserva texto como dados', () => {
  const state = emptyState();
  assert.equal(addTask(state, '  <script>texto</script>  ', 'a'), true);
  assert.equal(state.tasks[0].text, '<script>texto</script>');
  addTask(state, 'Dois', 'b'); addTask(state, 'Três', 'c');
  assert.equal(addTask(state, 'Quatro', 'd'), false);
  assert.equal(addTask(emptyState(), '  ', 'a'), false);
});
test('estado inválido/corrompido não impede abertura e não importa favoritos arbitrários', () => {
  assert.deepEqual(readState({ getItem: () => '{' }), emptyState());
  assert.deepEqual(readState({ getItem: () => { throw Error(); } }), emptyState());
  const state = normalizeState({ tasks: [null, { id: 'a', text: 'x'.repeat(300), done: 1 }], note: 'n'.repeat(2000), favorites: ['retomada', 'retomada', '../../private'], reviews: { retomada: 1000, fake: 10, pergunta: 'amanhã' } });
  assert.equal(state.note.length, 1000); assert.equal(state.tasks[0].text.length, 120);
  assert.deepEqual(state.favorites, ['retomada']); assert.deepEqual(state.reviews, { retomada: 1000 });
  assert.equal(writeState({ setItem: () => { throw Error(); } }, state), false);
});
test('agendamento respeita intervalos explícitos e reencontra o cartão na data', () => {
  const state = emptyState();
  assert.equal(dueCards(state, 1000).length, cards.length);
  assert.equal(scheduleReview(state, 'retomada', 7, 1000), true);
  assert.equal(dueCards(state, 1001).length, cards.length - 1);
  assert.equal(dueCards(state, 1000 + 7 * 86400000).length, cards.length);
  assert.equal(scheduleReview(state, 'retomada', -1, 1000), false);
  assert.equal(scheduleReview(state, 'unknown', 1, 1000), false);
});
test('conta permanece indisponível sem URLs completas e chave pública válida', () => {
  assert.equal(validateConfig({}), null);
  const config = { apiBaseUrl: 'https://members.example.com', supabaseUrl: 'https://test.supabase.co', supabasePublishableKey: 'sb_publishable_example' };
  assert.equal(validateConfig(config).apiBaseUrl, config.apiBaseUrl);
  assert.equal(validateConfig({ ...config, apiBaseUrl: 'http://localhost:3000' }), null);
  assert.equal(validateConfig({ ...config, apiBaseUrl: 'https://user:password@example.com' }), null);
  assert.equal(validateConfig({ ...config, supabaseUrl: 'https://supabase.co.attacker.example' }), null);
  assert.equal(validateConfig({ ...config, supabasePublishableKey: 'sb_secret_do-not-ship' }), null);
  const serviceKey = `ey.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`;
  assert.equal(validateConfig({ ...config, supabasePublishableKey: serviceKey }), null);
});
