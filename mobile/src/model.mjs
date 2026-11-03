export const STORAGE_KEY = 'antigravity.study.v1';
export const cards = Object.freeze([
  { id: 'retomada', question: 'O que escrever antes de interromper um estudo?', answer: 'Deixe três pistas: a última ideia compreendida, a dúvida que ficou e uma próxima ação concreta.' },
  { id: 'pergunta', question: 'Como transformar um tema amplo em uma sessão possível?', answer: 'Troque o tema por uma pergunta delimitada. “Como comparar duas formas de ventilação?” orienta uma sessão melhor do que apenas “ventilação”.' },
  { id: 'recuperacao', question: 'Como verificar o que consigo explicar sem consultar?', answer: 'Feche o material por um momento e explique a ideia com suas palavras. Depois confira a fonte e registre onde sua explicação ficou incompleta.' },
  { id: 'lacuna', question: 'Como registrar uma lacuna sem criar dívida de estudo?', answer: 'Escreva uma pergunta específica. Guarde-a como uma escolha para outra sessão, sem exigir que toda dúvida seja resolvida hoje.' },
  { id: 'passo', question: 'O que torna uma próxima ação fácil de iniciar?', answer: 'Um verbo, um objeto e um limite: “abrir o fluxograma e explicar o primeiro nó”. Evite depender de um plano inteiro para começar.' },
  { id: 'fonte', question: 'O que anotar junto de uma informação que pode mudar?', answer: 'Registre a fonte, sua data e o contexto em que a informação se aplica. A certeza de uma anotação não substitui conferir uma fonte atual.' },
  { id: 'comparacao', question: 'Como comparar duas opções sem dispersar?', answer: 'Escolha uma pergunta e use os mesmos critérios para as duas opções. Uma tabela curta pode mostrar diferenças e incertezas.' },
  { id: 'erro', question: 'Como transformar um erro em material de revisão?', answer: 'Registre o gatilho da confusão, a distinção correta e uma pergunta para reconhecê-la em outro cenário. Não é preciso copiar a aula inteira.' },
  { id: 'limite', question: 'Como terminar uma sessão com sensação de conclusão?', answer: 'Nomeie uma ideia aprendida e deixe uma pista de retomada. A sessão pode estar concluída mesmo quando o assunto inteiro continua aberto.' },
  { id: 'caso', question: 'Como usar um cenário para testar a compreensão?', answer: 'Explique qual dado do cenário muda sua escolha e por quê. Ao estudar medicina, use casos fictícios ou anonimizados e confira diretrizes atuais.' },
  { id: 'revisao', question: 'Como escolher quando rever um cartão?', answer: 'Use uma data que faça sentido para sua rotina e ajuste ao reencontrá-lo. Neste app, 1, 7 e 14 dias são opções de organização, não uma prescrição de aprendizagem.' },
  { id: 'uma-peca', question: 'Qual é a menor unidade útil de progresso?', answer: 'Uma distinção que você consegue explicar ou uma pergunta que ficou mais clara. Pequenas peças podem se conectar a um entendimento maior ao longo do tempo.' }
]);

export function emptyState() { return { tasks: [], note: '', favorites: [], reviews: {} }; }
export function normalizeState(value) {
  const state = emptyState();
  if (!value || typeof value !== 'object') return state;
  state.note = typeof value.note === 'string' ? value.note.slice(0, 1000) : '';
  state.tasks = Array.isArray(value.tasks) ? value.tasks.slice(0, 3).filter(t => t && typeof t.id === 'string' && typeof t.text === 'string').map(t => ({ id: t.id.slice(0, 80), text: t.text.slice(0, 120), done: Boolean(t.done) })) : [];
  const ids = new Set(cards.map(c => c.id));
  state.favorites = Array.isArray(value.favorites) ? [...new Set(value.favorites.filter(id => ids.has(id)))] : [];
  for (const [key, due] of Object.entries(value.reviews || {})) if (ids.has(key) && Number.isSafeInteger(due) && due > 0) state.reviews[key] = due;
  return state;
}
export function readState(storage) {
  try { return normalizeState(JSON.parse(storage.getItem(STORAGE_KEY))); } catch { return emptyState(); }
}
export function writeState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state))); return true; } catch { return false; }
}
export function addTask(state, text, id) {
  const clean = String(text).trim().slice(0, 120);
  if (!clean || state.tasks.length >= 3) return false;
  state.tasks.push({ id, text: clean, done: false }); return true;
}
export function scheduleReview(state, id, days, now = Date.now()) {
  if (!cards.some(card => card.id === id) || ![1, 7, 14].includes(days)) return false;
  state.reviews[id] = now + days * 86400000; return true;
}
export function dueCards(state, now = Date.now()) { return cards.filter(card => !state.reviews[card.id] || state.reviews[card.id] <= now); }
export function validateConfig(config) {
  if (!config || !config.apiBaseUrl || !config.supabaseUrl || !config.supabasePublishableKey) return null;
  try {
    const api = new URL(config.apiBaseUrl); const auth = new URL(config.supabaseUrl);
    if ([api, auth].some(u => u.protocol !== 'https:' || u.username || u.password || u.search || u.hash)) return null;
    if (!auth.hostname.endsWith('.supabase.co') || auth.pathname !== '/') return null;
    if (config.supabasePublishableKey.startsWith('sb_secret_') || config.supabasePublishableKey.startsWith('sk_')) return null;
    // JWT legacy anon keys are accepted only when their decoded role is anon.
    const key = config.supabasePublishableKey;
    if (!key.startsWith('sb_publishable_')) {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role !== 'anon') return null;
    }
    return { apiBaseUrl: api.href.replace(/\/$/, ''), supabaseUrl: auth.origin, supabasePublishableKey: key };
  } catch { return null; }
}
