/* Public educational module. Only favorite species IDs are stored locally. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const catalog = window.FAUNA_CATALOG;
  const riskNames = { CR: 'Criticamente em perigo', EN: 'Em perigo', VU: 'Vulnerável' };
  const storeKey = 'bolsa-ajuda:fauna:favorites:v1';
  const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = (s) => { try { const u = new URL(s); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch (_) { return ''; } };
  const sourceLink = (url, title) => { const safe = safeUrl(url); return safe ? `<a href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>` : esc(title); };
  const date = (s) => s.split('-').reverse().join('/');
  const toast = (text) => {
    $('toast').textContent = text; $('toast').hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { $('toast').hidden = true; }, 4500);
  };
  if (!catalog || !Array.isArray(catalog.animals) || !Array.isArray(catalog.organizations)) {
    $('result-count').textContent = 'Não foi possível carregar o catálogo. Recarregue a página ou consulte o arquivo catalog.json.';
    return;
  }
  const animals = catalog.animals;
  const byId = new Map(animals.map((a) => [a.id, a]));
  const orgs = new Map(catalog.organizations.map((o) => [o.id, o]));
  const searchText = new Map(animals.map((a) => [a.id, normalize([a.name, a.scientific, a.group, ...a.regions, a.habitat, a.threat, a.action].join(' '))]));
  let favorites = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem(storeKey) || '[]');
    if (Array.isArray(stored)) favorites = new Set(stored.filter((id) => typeof id === 'string' && byId.has(id)));
  } catch (_) { $('storage-note').textContent = 'Armazenamento indisponível ou inválido. Os favoritos podem funcionar apenas nesta visita; exporte para guardar sua seleção.'; }
  const save = () => {
    try { localStorage.setItem(storeKey, JSON.stringify([...favorites])); return true; }
    catch (_) { $('storage-note').textContent = 'Não foi possível guardar os favoritos neste navegador. Exporte sua seleção antes de sair.'; return false; }
  };
  const badge = (a) => `<span class="badge ${a.risk}">${a.risk} · ${riskNames[a.risk]}</span>`;
  const card = (a) => `<article class="animal-card" data-animal="${a.id}">
    <div class="card-art ${a.regions.includes('Oceanos') ? 'water' : ''}"><span class="habitat-tag">${esc(a.regions.slice(0,2).join(' / '))}</span><span class="symbol" aria-hidden="true">${a.symbol}</span><button class="favorite" type="button" data-favorite="${a.id}" aria-label="${favorites.has(a.id) ? 'Remover dos' : 'Adicionar aos'} favoritos: ${esc(a.name)}" aria-pressed="${favorites.has(a.id)}">${favorites.has(a.id) ? '★' : '☆'}</button></div>
    <div class="card-body">${badge(a)}<h3>${esc(a.name)}</h3><p class="scientific">${esc(a.scientific)}${a.taxon === 'subespécie' ? ' · subespécie' : ''}</p>
    <p class="detail-label">ONDE VIVE</p><p class="copy">${esc(a.habitat)}</p><p class="detail-label">PRINCIPAL AMEAÇA</p><p class="copy">${esc(a.threat)}</p>
    <div class="action"><strong>AÇÃO PRIORITÁRIA</strong>${esc(a.action)}</div><div class="card-footer"><button type="button" data-detail="${a.id}">Ficha, fontes e apoio ↗</button><small>${esc(a.group)}</small></div></div></article>`;
  function render() {
    const q = normalize($('search').value.trim()), r = $('risk').value, region = $('region').value;
    const tokens = q.split(/\s+/).filter(Boolean);
    const filtered = animals.filter((a) => (!r || a.risk === r) && (!region || a.regions.includes(region)) && (!$('favorites-only').checked || favorites.has(a.id)) && tokens.every((t) => searchText.get(a.id).includes(t)));
    const active = document.activeElement;
    const activeFavorite = active?.dataset?.favorite;
    $('animal-grid').innerHTML = filtered.map(card).join('');
    $('result-count').textContent = `${filtered.length} de ${animals.length} animais · ${favorites.size} favorito${favorites.size === 1 ? '' : 's'}`;
    $('empty').hidden = filtered.length !== 0;
    $('export-favorites').disabled = favorites.size === 0;
    document.querySelectorAll('[data-quick]').forEach((b) => {
      const v = b.dataset.quick;
      b.setAttribute('aria-pressed', String(v === 'CR' ? r === 'CR' && !region : v ? region === v && !r : !r && !region));
    });
    if (activeFavorite) {
      const replacement = document.querySelector(`[data-favorite="${activeFavorite}"]`);
      if (replacement) replacement.focus({preventScroll:true});
      else $('favorites-only').focus({preventScroll:true});
    }
  }
  function organizationCard(o) {
    const domain = new URL(o.url).hostname;
    return `<article class="org-card" id="org-${esc(o.id)}"><span class="org-region">${esc(o.region)}</span><h3>${esc(o.name)}</h3><p>${esc(o.description)}</p><p class="scope">${esc(o.scope)}</p><div class="org-links">${sourceLink(o.url,o.label)}${o.report ? sourceLink(o.report,'Atuação e acompanhamento') : ''}</div><p class="verified">Canal de referência: ${date(o.verifiedAt)} · ${esc(domain)}<br>Identificação do canal não equivale a auditoria financeira.</p></article>`;
  }
  let opener = null;
  const dialog = $('animal-dialog');
  function openAnimal(id) {
    const a = byId.get(id); if (!a) return;
    opener = document.activeElement;
    const relevant = a.organizations.map((i) => orgs.get(i)).filter(Boolean);
    const related = (a.relatedOrganizations || []).map((i) => orgs.get(i)).filter(Boolean);
    const links = relevant.map((o) => `<a class="button secondary" href="#org-${esc(o.id)}" data-go-org="${esc(o.id)}">${esc(o.name)} ↗</a>`).join('');
    $('dialog-content').innerHTML = `${badge(a)}<h2 id="dialog-title">${esc(a.name)}</h2><p class="scientific">${esc(a.scientific)} · ${esc(a.taxon)}</p>
      <h3>Habitat</h3><p>${esc(a.habitat)}</p><h3>Ameaças principais</h3><p>${esc(a.threat)}</p><div class="action"><strong>AÇÃO PRIORITÁRIA</strong>${esc(a.action)}</div>
      <h3>Como contribuir</h3>${relevant.length ? `<p>Conheça estas instituições relacionadas à causa. Confirme o alcance do projeto: o canal pode receber apoio institucional geral.</p><div class="dialog-orgs">${links}</div>` : '<p>Ainda não há canal específico de contribuição conferido para este animal no catálogo. Consulte as fontes da ficha e o diretório de instituições; não presuma destinação exclusiva.</p><a href="#instituicoes" data-go-org="">Explorar instituições de conservação ↗</a>'}
      ${related.length ? `<p><strong>Causa relacionada, não a mesma espécie:</strong> ${related.map((o) => `<a href="#org-${o.id}" data-go-org="${o.id}">${esc(o.name)}</a>`).join(', ')}. O Projeto Albatroz atua no Brasil; não atribua esse apoio automaticamente ao albatroz-das-galápagos.</p>` : ''}
      <h3>Fontes da ficha</h3><ul>${a.sources.map((s) => `<li>${sourceLink(s.url,s.title)}</li>`).join('')}</ul><p class="small">Categoria global na pesquisa-base de ${date(a.reviewedAt)}. As datas das avaliações originais variam. Consulte a referência para revisões mais recentes. Medidas apresentadas são sínteses educativas, não garantia de resultado.</p>`;
    dialog.showModal(); document.body.classList.add('dialog-open'); $('close-dialog').focus();
  }
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (opener?.isConnected) opener.focus({preventScroll:true}); });
  $('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    const link = e.target.closest('[data-go-org]');
    if (link) {
      e.preventDefault(); const target = link.dataset.goOrg ? `org-${link.dataset.goOrg}` : 'instituicoes';
      dialog.close(); const element = $(target); if (element) { element.setAttribute('tabindex','-1'); element.focus({preventScroll:true}); element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }
      return;
    }
    if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); }
  });
  $('animal-grid').addEventListener('click', (e) => {
    const detail = e.target.closest('[data-detail]'); if (detail) { openAnimal(detail.dataset.detail); return; }
    const favorite = e.target.closest('[data-favorite]'); if (!favorite) return;
    const id = favorite.dataset.favorite; if (!byId.has(id)) return;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    const persisted = save(); render(); toast(persisted ? 'Favoritos atualizados neste navegador.' : 'Favorito atualizado somente nesta visita. Exporte para guardar.');
  });
  $('search').addEventListener('input',render); ['risk','region','favorites-only'].forEach((id) => $(id).addEventListener('change',render));
  const clear = () => { $('search').value=''; $('risk').value=''; $('region').value=''; $('favorites-only').checked=false; render(); };
  $('clear-filters').addEventListener('click',clear);
  document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => { const v=b.dataset.quick; $('search').value=''; $('favorites-only').checked=false; $('risk').value=v==='CR'?'CR':''; $('region').value=v && v!=='CR'?v:''; render(); }));
  $('erase-favorites').addEventListener('click', () => { if (!favorites.size) { toast('Nenhum favorito para apagar.'); return; } if (!confirm('Apagar todos os favoritos deste navegador?')) return; favorites.clear(); save(); render(); toast('Favoritos removidos.'); });
  $('export-favorites').addEventListener('click', () => {
    if (!favorites.size) return;
    const data = {type:'selecao-de-causas-nao-doacoes',exportedAt:new Date().toISOString(),catalogVersion:catalog.version,animals:animals.filter((a) => favorites.has(a.id))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='fauna-360-favoritos.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
  });
  $('stat-total').textContent=animals.length; $('stat-critical').textContent=animals.filter((a) => a.risk==='CR').length; $('stat-orgs').textContent=catalog.organizations.length;
  $('org-grid').innerHTML=catalog.organizations.map(organizationCard).join('');
  render();
})();
