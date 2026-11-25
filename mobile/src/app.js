import './style.css';
import { Capacitor } from '@capacitor/core';
import { STORAGE_KEY, cards, readState, writeState, addTask, scheduleReview, dueCards, validateConfig, emptyState } from './model.mjs';

const $ = id => document.getElementById(id);
let state = readState(localStorage);
let currentCard = 0;
let accountConfig = null;
let token = null;

async function timedFetch(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function save() {
  const ok = writeState(localStorage, state);
  if (!ok) $('note-status').textContent = 'Não foi possível salvar. O armazenamento deste aparelho está indisponível.';
  return ok;
}
function tab(name) {
  document.querySelectorAll('.panel').forEach(panel => panel.hidden = panel.id !== name);
  document.querySelectorAll('[data-tab]').forEach(button => {
    if (button.dataset.tab === name) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (name === 'library') renderLibrary();
  window.scrollTo(0, 0);
  $('main').focus({ preventScroll: true });
}
function renderTasks() {
  $('tasks').replaceChildren();
  for (const task of state.tasks) {
    const row = document.createElement('li');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = task.done; checkbox.id = `task-${task.id}`;
    const label = document.createElement('label'); label.htmlFor = checkbox.id; label.textContent = task.text; label.classList.toggle('done', task.done);
    checkbox.addEventListener('change', () => { task.done = checkbox.checked; save(); renderTasks(); });
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remover tarefa: ${task.text}`);
    remove.addEventListener('click', () => { state.tasks = state.tasks.filter(item => item.id !== task.id); save(); renderTasks(); $('task').focus(); });
    row.append(checkbox, label, remove); $('tasks').append(row);
  }
  $('task').disabled = state.tasks.length >= 3;
  $('task-form').querySelector('button').disabled = state.tasks.length >= 3;
  $('task-status').textContent = state.tasks.length >= 3 ? 'Três passos já são suficientes. Conclua ou remova um para incluir outro.' : state.tasks.length ? `${state.tasks.filter(task => task.done).length} de ${state.tasks.length} passos concluídos.` : 'Escolha uma tarefa pequena para começar.';
}
function renderCard() {
  const card = cards[currentCard];
  $('card-count').textContent = `CARTÃO ${currentCard + 1} DE ${cards.length}`;
  $('card-question').textContent = card.question;
  $('card-answer').textContent = card.answer;
  $('card-answer').hidden = true; $('review-actions').hidden = true; $('reveal').hidden = false;
  const favorite = state.favorites.includes(card.id);
  $('favorite').textContent = favorite ? '★ Salvo' : '☆ Salvar';
  $('favorite').setAttribute('aria-pressed', String(favorite));
  $('due-summary').textContent = `${dueCards(state).length} cartões disponíveis para reencontrar. Você escolhe o ritmo.`;
}
function renderLibrary() {
  $('favorites').replaceChildren();
  const favorites = cards.filter(card => state.favorites.includes(card.id));
  if (!favorites.length) { const p = document.createElement('p'); p.className = 'card muted'; p.textContent = 'Salve um cartão com ☆ para encontrá-lo aqui.'; $('favorites').append(p); }
  for (const card of favorites) {
    const item = document.createElement('article'); item.className = 'card';
    const title = document.createElement('h3'); title.textContent = card.question;
    const answer = document.createElement('p'); answer.textContent = card.answer;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = 'Revisar este cartão';
    button.addEventListener('click', () => { currentCard = cards.findIndex(item => item.id === card.id); renderCard(); tab('cards'); });
    item.append(title, answer, button); $('favorites').append(item);
  }
}
async function loadAccount() {
  if (!accountConfig || !token) return;
  $('account-status').textContent = 'Consultando o servidor…';
  try {
    const response = await timedFetch(`${accountConfig.apiBaseUrl}/api/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw new Error('account');
    const membership = await response.json();
    const tier = membership.tier || membership.plan || membership.entitlement?.tier || 'free';
    const names = { basic: 'Básico', basico: 'Básico', pro: 'Pro', ultra: 'Ultra', free: 'Sem plano ativo' };
    $('membership-details').textContent = `Plano: ${names[tier] || 'Acesso consultado'}. Permissões e materiais são verificados pelo servidor a cada consulta.`;
    $('membership').hidden = false; $('login-form').hidden = true; $('account-status').textContent = 'Conta conectada nesta sessão.';
  } catch {
    $('account-status').textContent = 'Não foi possível verificar seu acesso. Confira a conexão e tente novamente. Nenhum conteúdo pago foi liberado pelo aparelho.';
    $('membership').hidden = true;
    $('login-form').hidden = false;
  }
}

document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => tab(button.dataset.tab)));
$('task-form').addEventListener('submit', event => { event.preventDefault(); const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; if (addTask(state, $('task').value, id)) { save(); $('task').value = ''; renderTasks(); } });
$('note').value = state.note;
$('note').addEventListener('input', () => { state.note = $('note').value.slice(0, 1000); if (save()) $('note-status').textContent = 'Pista salva somente neste aparelho.'; });
$('reveal').addEventListener('click', () => { $('card-answer').hidden = false; $('review-actions').hidden = false; $('reveal').hidden = true; });
$('previous-card').addEventListener('click', () => { currentCard = (currentCard + cards.length - 1) % cards.length; $('review-status').textContent = ''; renderCard(); });
$('next-card').addEventListener('click', () => { currentCard = (currentCard + 1) % cards.length; $('review-status').textContent = ''; renderCard(); });
$('favorite').addEventListener('click', () => { const id = cards[currentCard].id; state.favorites = state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id]; save(); renderCard(); });
document.querySelectorAll('[data-days]').forEach(button => button.addEventListener('click', () => { scheduleReview(state, cards[currentCard].id, Number(button.dataset.days)); save(); $('review-status').textContent = `Revisão marcada para ${new Date(state.reviews[cards[currentCard].id]).toLocaleDateString('pt-BR')}. Sem notificação automática.`; $('due-summary').textContent = `${dueCards(state).length} cartões disponíveis para reencontrar. Você escolhe o ritmo.`; }));
$('go-review').addEventListener('click', () => { const due = dueCards(state)[0]; currentCard = due ? cards.findIndex(card => card.id === due.id) : 0; renderCard(); tab('cards'); });
$('clear-local').addEventListener('click', () => { if (!confirm('Apagar as tarefas, a pista de retomada, os favoritos e as revisões deste aparelho? Sua conta e assinatura não serão alteradas.')) return; try { localStorage.removeItem(STORAGE_KEY); state = emptyState(); $('note').value = ''; renderTasks(); renderCard(); renderLibrary(); $('privacy-status').textContent = 'Dados locais apagados.'; } catch { $('privacy-status').textContent = 'Não foi possível apagar os dados locais.'; } });
$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!accountConfig) return;
  const submit = $('login-form').querySelector('button'); submit.disabled = true;
  $('account-status').textContent = 'Autenticando…';
  try {
    const response = await timedFetch(`${accountConfig.supabaseUrl}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: accountConfig.supabasePublishableKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: $('email').value.trim(), password: $('password').value }), redirect: 'error', cache: 'no-store' });
    $('password').value = '';
    if (!response.ok) throw new Error('login');
    const session = await response.json();
    if (!session.access_token || !session.user?.email_confirmed_at) throw new Error('unconfirmed');
    token = session.access_token;
    await loadAccount();
  } catch { token = null; $('password').value = ''; $('account-status').textContent = 'Não foi possível entrar. Confira seus dados, a confirmação do e-mail e a conexão.'; }
  finally { submit.disabled = false; }
});
$('refresh-account').addEventListener('click', loadAccount);
$('logout').addEventListener('click', () => { token = null; $('membership').hidden = true; $('login-form').hidden = false; $('account-status').textContent = 'Sessão encerrada neste aplicativo.'; });

try {
  const response = await fetch('./config.json', { cache: 'no-store' });
  accountConfig = validateConfig(await response.json());
} catch { accountConfig = null; }
$('account-configuration').textContent = accountConfig ? 'Use sua conta existente. Nenhum dado de cartão é solicitado pelo app.' : 'Conexão de assinantes em preparação. Os recursos de estudo offline já podem ser usados. Nenhuma cobrança ou acesso pago está ativo nesta versão.';
$('login-form').hidden = !accountConfig;
document.documentElement.dataset.platform = Capacitor.getPlatform();
renderTasks(); renderCard();
