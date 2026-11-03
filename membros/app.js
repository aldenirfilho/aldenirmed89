'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let config, token = null, salesEnabled = false, busy = false, downloadUrl = null, generation = 0;
  const status = message => { $('status').textContent = message; };
  function validBase(value) {
    if (!value) return null;
    try { const u = new URL(value); if (u.username || u.password || u.search || u.hash) return null;
      if (u.protocol !== 'https:' && !(u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname))) return null;
      return u.href.replace(/\/$/, '');
    } catch { return null; }
  }
  function publicSupabaseKey(value) {
    if (typeof value !== 'string') return false;
    if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
    try { return JSON.parse(atob(value.split('.')[1].replaceAll('-','+').replaceAll('_','/'))).role === 'anon'; } catch { return false; }
  }
  function availability() {
    for (const id of ['email','password','login','signup']) $(id).disabled = !config || busy;
    for (const button of document.querySelectorAll('[data-tier]')) button.disabled = !token || !salesEnabled || busy;
    $('refresh').disabled = !token || busy;
    $('portal').disabled = !token || busy;
    $('slug').disabled = !token || busy;
    $('open-content').disabled = !token || busy;
  }
  async function api(path, method = 'GET', body) {
    const requestGeneration = generation;
    const response = await fetch(config.apiBaseUrl + path, {method, credentials:'omit', cache:'no-store',
      headers:{...(token ? {Authorization:'Bearer '+token} : {}), ...(body ? {'Content-Type':'application/json'} : {})},
      ...(body ? {body:JSON.stringify(body)} : {})});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { if (response.status === 401 && requestGeneration === generation) signOut(); throw new Error(response.status === 503 ? 'Serviço em preparação. A contratação ainda não está disponível.' : response.status === 403 ? 'Sua conta não tem acesso a este recurso.' : response.status === 401 ? 'Entre novamente para continuar.' : 'Não foi possível concluir. Tente novamente em instantes.'); }
    return data;
  }
  function signOut() {
    generation++;
    token = null; $('password').value = ''; $('account').hidden = true; $('auth').hidden = false;
    $('features').replaceChildren(); $('content').hidden = true; $('content-text').textContent = '';
    $('content-catalog').replaceChildren(); $('empty-catalog').textContent = 'Entre para consultar o catálogo disponível para sua conta.';
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); downloadUrl = null; }
    availability();
  }
  async function refresh() {
    const requestGeneration = generation;
    const data = await api('/api/me');
    if (requestGeneration !== generation || !token) return;
    $('auth').hidden = true; $('account').hidden = false;
    const names = {basico:'Básico',pro:'Pro',ultra:'Ultra'};
    $('tier').textContent = names[data.tier] ? 'Plano ativo: ' + names[data.tier] : 'Nenhuma assinatura ativa confirmada.';
    $('features').replaceChildren(...(Array.isArray(data.features) ? data.features : []).map(feature => { const li = document.createElement('li'); li.textContent = String(feature).replaceAll('_',' '); return li; }));
    const materials = (Array.isArray(data.content) ? data.content : []).filter(item => item && /^[a-z0-9-]{1,80}$/.test(item.slug));
    $('content-catalog').replaceChildren(...materials.map(item => {
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.className = 'secondary'; button.textContent = String(item.title || item.slug);
      button.addEventListener('click', () => { $('slug').value = item.slug; $('content-form').requestSubmit(); });
      li.append(button); return li;
    }));
    $('empty-catalog').textContent = materials.length ? 'Selecione um material para abrir.' : 'Nenhum material privado disponível para sua assinatura neste momento.';
    availability();
  }
  async function auth(signup) {
    if (!config || busy || !$('login-form').reportValidity()) return;
    busy = true; availability();
    try {
      const response = await fetch(config.supabaseUrl + (signup ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password'), {
        method:'POST', credentials:'omit', cache:'no-store', headers:{apikey:config.supabasePublishableKey,'Content-Type':'application/json'},
        body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})});
      const data = await response.json().catch(() => ({})); $('password').value = '';
      if (!response.ok) throw new Error('Não foi possível acessar a conta. Confira os dados, confirme seu e-mail ou tente novamente mais tarde.');
      if (signup) { status('Se o cadastro for aceito, você receberá as instruções de confirmação por e-mail. Após confirmar, entre com sua senha.'); return; }
      if (!data.access_token) throw new Error('Confirme seu e-mail antes de entrar.');
      token = data.access_token; await refresh(); status('Conta conectada. As permissões são conferidas pelo servidor.');
    } catch (error) { status(error.message); } finally { busy = false; availability(); }
  }
  function redirectPayment(value, host) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== host || url.username || url.password) throw new Error('O endereço de pagamento retornado não foi reconhecido.');
    window.location.assign(url.href);
  }
  $('login-form').addEventListener('submit', event => { event.preventDefault(); auth(false); });
  $('signup').addEventListener('click', () => auth(true));
  $('logout').addEventListener('click', () => { signOut(); status('Sessão encerrada nesta aba.'); });
  $('refresh').addEventListener('click', () => refresh().catch(error => status(error.message)));
  $('portal').addEventListener('click', async () => {
    const requestGeneration = generation;
    try { const data = await api('/api/portal','POST',{}); if (requestGeneration === generation && token) redirectPayment(data.url,'billing.stripe.com'); } catch(error) { if (requestGeneration === generation) status(error.message); }
  });
  for (const button of document.querySelectorAll('[data-tier]')) button.addEventListener('click', async () => {
    if (busy || !token || !salesEnabled) return;
    const requestGeneration = generation;
    busy = true; availability();
    try { const data = await api('/api/checkout','POST',{tier:button.dataset.tier}); if (requestGeneration === generation && token) redirectPayment(data.url,'checkout.stripe.com'); }
    catch(error) { status(error.message); } finally { busy = false; availability(); }
  });
  $('content-form').addEventListener('submit', async event => {
    event.preventDefault(); if (!token || !$('content-form').reportValidity()) return;
    const requestGeneration = generation;
    try {
      const response = await fetch(config.apiBaseUrl + '/api/content/' + encodeURIComponent($('slug').value), {headers:{Authorization:'Bearer '+token}, credentials:'omit',cache:'no-store'});
      if (!response.ok) throw new Error(response.status === 403 ? 'Material indisponível para este plano.' : 'Material ainda não disponível.');
      const blob = await response.blob();
      if (requestGeneration !== generation || !token) return;
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      $('content-text').textContent = '';
      if (/^(text\/|application\/json)/.test(blob.type)) { const text = await blob.text(); if (requestGeneration !== generation || !token) return; $('content-text').textContent = text; $('content-download').hidden = true; }
      else { downloadUrl = URL.createObjectURL(blob); $('content-download').href = downloadUrl; $('content-download').download = $('slug').value; $('content-download').hidden = false; }
      $('content-name').textContent = $('slug').value; $('content').hidden = false;
    } catch(error) { if (requestGeneration === generation) status(error.message); }
  });
  fetch('config.json',{cache:'no-store'}).then(response => response.json()).then(async data => {
    const apiBaseUrl = validBase(data.apiBaseUrl), supabaseUrl = validBase(data.supabaseUrl);
    if (!apiBaseUrl || !supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl) || !publicSupabaseKey(data.supabasePublishableKey)) throw new Error('disconnected');
    config = {apiBaseUrl,supabaseUrl,supabasePublishableKey:data.supabasePublishableKey};
    const catalog = await api('/api/catalog'); salesEnabled = catalog.salesEnabled === true;
    $('sales-state').textContent = salesEnabled ? 'Entre com seu e-mail confirmado para contratar. Renovação mensal e gerenciamento pelo portal do assinante.' : 'Contratação indisponível durante a preparação do lançamento.';
    status('Área conectada. Entre para consultar sua assinatura.'); availability();
  }).catch(() => { config = null; availability(); status('Área de membros em preparação. Nenhum cadastro ou pagamento está disponível nesta página.'); });
})();
