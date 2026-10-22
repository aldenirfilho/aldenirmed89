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

/* fauna-real-photographs-v1: progressive enhancement, no scientific data changes. */
(() => {
  'use strict';
  const photos = {"animal-01":{"file":"Araripe Manakin (1).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Araripe_Manakin_%281%29.jpg/960px-Araripe_Manakin_%281%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/0/02/Araripe_Manakin_%281%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Araripe_Manakin_%281%29.jpg","author":"Rick elis.simpson; edição registrada: Edithsme","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","caption":"Registro do soldadinho-do-araripe.","photographedAt":"2011-10-13","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-02":{"file":"Pyrrhura griseipectus -upper body-8a.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Pyrrhura_griseipectus_-upper_body-8a.jpg/960px-Pyrrhura_griseipectus_-upper_body-8a.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/9/9a/Pyrrhura_griseipectus_-upper_body-8a.jpg","source":"https://commons.wikimedia.org/wiki/File:Pyrrhura_griseipectus_-upper_body-8a.jpg","author":"writhedhornbill","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/","caption":"Retrato do periquito-cara-suja. Contexto de captura não especificado na ficha consultada.","photographedAt":"2007-02-14","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-03":{"file":"Anodorhynchus leari (3).JPG","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Anodorhynchus_leari_%283%29.JPG/960px-Anodorhynchus_leari_%283%29.JPG","original":"https://upload.wikimedia.org/wikipedia/commons/d/d1/Anodorhynchus_leari_%283%29.JPG","source":"https://commons.wikimedia.org/wiki/File:Anodorhynchus_leari_%283%29.JPG","author":"Miguelrangeljr","license":"Domínio público","licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/","caption":"Araras-azuis-de-lear em Canudos, Bahia.","photographedAt":"2011-04-24","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-04":{"file":"Golden Lion Tamarin Poco das Antas.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Golden_Lion_Tamarin_Poco_das_Antas.jpg/960px-Golden_Lion_Tamarin_Poco_das_Antas.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/4/40/Golden_Lion_Tamarin_Poco_das_Antas.jpg","source":"https://commons.wikimedia.org/wiki/File:Golden_Lion_Tamarin_Poco_das_Antas.jpg","author":"Bart van Dorp","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/","caption":"Mico-leão-dourado na região de Poço das Antas, Rio de Janeiro.","photographedAt":"2014-04-25","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-05":{"file":"Mico leao preto SP Zoo 2.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Mico_leao_preto_SP_Zoo_2.jpg/960px-Mico_leao_preto_SP_Zoo_2.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/1/14/Mico_leao_preto_SP_Zoo_2.jpg","source":"https://commons.wikimedia.org/wiki/File:Mico_leao_preto_SP_Zoo_2.jpg","author":"Miguelrangeljr","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","caption":"Registro em cativeiro — Zoológico de São Paulo.","photographedAt":"2013-04-07","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-06":{"file":"Inia geoffrensis1.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Inia_geoffrensis1.jpg/960px-Inia_geoffrensis1.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/3/38/Inia_geoffrensis1.jpg","source":"https://commons.wikimedia.org/wiki/File:Inia_geoffrensis1.jpg","author":"Citron","license":"CC0 1.0","licenseUrl":"https://creativecommons.org/publicdomain/zero/1.0/","caption":"Boto-cor-de-rosa. Local e data da fotografia não confirmados nesta seleção.","photographedAt":null,"reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-07":{"file":"Rhinoceros sondaicus in London Zoo.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/c/ce/Rhinoceros_sondaicus_in_London_Zoo.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/c/ce/Rhinoceros_sondaicus_in_London_Zoo.jpg","source":"https://commons.wikimedia.org/wiki/File:Rhinoceros_sondaicus_in_London_Zoo.jpg","author":"T. Dixon / Zoological Society of London","license":"Domínio público","licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/","caption":"Fotografia histórica de 1884, em cativeiro no Zoológico de Londres. Não representa a população atual.","photographedAt":"1884","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-08":{"file":"Sumatran Rhino 001.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Sumatran_Rhino_001.jpg/960px-Sumatran_Rhino_001.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/7/78/Sumatran_Rhino_001.jpg","source":"https://commons.wikimedia.org/wiki/File:Sumatran_Rhino_001.jpg","author":"Ltshears","license":"Domínio público","licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/","caption":"Registro em cativeiro — Zoológico de Cincinnati.","photographedAt":"2007-07-04","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-09":{"file":"Pongo tapanuliensis.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Pongo_tapanuliensis.jpg/960px-Pongo_tapanuliensis.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/6/65/Pongo_tapanuliensis.jpg","source":"https://commons.wikimedia.org/wiki/File:Pongo_tapanuliensis.jpg","author":"Tim Laman; edição registrada: WolfmanSF","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","caption":"Orangotango-de-tapanuli na floresta de Batang Toru, Sumatra.","photographedAt":"2014-03-10","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-10":{"file":"Loxodonta cyclotis 3970045.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Loxodonta_cyclotis_3970045.jpg/960px-Loxodonta_cyclotis_3970045.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/5/5e/Loxodonta_cyclotis_3970045.jpg","source":"https://commons.wikimedia.org/wiki/File:Loxodonta_cyclotis_3970045.jpg","author":"Matt Muir","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","caption":"Elefante-africano-de-floresta no Parque Nacional Odzala-Kokoua, República do Congo.","photographedAt":"2016-06-04","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-11":{"file":"Mountain gorilla (Gorilla beringei beringei) 05.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Mountain_gorilla_%28Gorilla_beringei_beringei%29_05.jpg/960px-Mountain_gorilla_%28Gorilla_beringei_beringei%29_05.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/3/36/Mountain_gorilla_%28Gorilla_beringei_beringei%29_05.jpg","source":"https://commons.wikimedia.org/wiki/File:Mountain_gorilla_%28Gorilla_beringei_beringei%29_05.jpg","author":"Thomas Fuhrmann","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/","caption":"Gorila-das-montanhas em Bwindi, Uganda.","photographedAt":"2015-09-15","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-12":{"file":"Panthera tigris tigris.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Panthera_tigris_tigris.jpg/960px-Panthera_tigris_tigris.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/4/49/Panthera_tigris_tigris.jpg","source":"https://commons.wikimedia.org/wiki/File:Panthera_tigris_tigris.jpg","author":"John e Karen Hollingsworth / USFWS; edição registrada: Zwoenitzer","license":"Domínio público","licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/","caption":"Tigre-de-bengala, uma população da espécie Panthera tigris.","photographedAt":null,"reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-13":{"file":"台北動物園穿山甲 2024.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/%E5%8F%B0%E5%8C%97%E5%8B%95%E7%89%A9%E5%9C%92%E7%A9%BF%E5%B1%B1%E7%94%B2_2024.jpg/960px-%E5%8F%B0%E5%8C%97%E5%8B%95%E7%89%A9%E5%9C%92%E7%A9%BF%E5%B1%B1%E7%94%B2_2024.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/0/0a/%E5%8F%B0%E5%8C%97%E5%8B%95%E7%89%A9%E5%9C%92%E7%A9%BF%E5%B1%B1%E7%94%B2_2024.jpg","source":"https://commons.wikimedia.org/wiki/File:%E5%8F%B0%E5%8C%97%E5%8B%95%E7%89%A9%E5%9C%92%E7%A9%BF%E5%B1%B1%E7%94%B2_2024.jpg","author":"Taiwan Presidential Office (總統府)","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/","caption":"Pangolim-chinês no Zoológico de Taipei. Registro em cativeiro.","photographedAt":"2024-08-08","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-14":{"file":"Ailuropoda melanoleuca in San Diego Zoo.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Ailuropoda_melanoleuca_in_San_Diego_Zoo.jpg/960px-Ailuropoda_melanoleuca_in_San_Diego_Zoo.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/c/c8/Ailuropoda_melanoleuca_in_San_Diego_Zoo.jpg","source":"https://commons.wikimedia.org/wiki/File:Ailuropoda_melanoleuca_in_San_Diego_Zoo.jpg","author":"Jason “Textfiles” Scott","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/","caption":"Registro em cativeiro — panda-gigante no Zoológico de San Diego.","photographedAt":"2008-07-28","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-15":{"file":"Vaquita1 Olson NOAA.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vaquita1_Olson_NOAA.jpg/960px-Vaquita1_Olson_NOAA.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/7/77/Vaquita1_Olson_NOAA.jpg","source":"https://commons.wikimedia.org/wiki/File:Vaquita1_Olson_NOAA.jpg","author":"Paula Olson / NOAA","license":"Domínio público","licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/","caption":"Vaquitas na superfície do mar, em 2008. O registro não indica a população atual.","photographedAt":"2008-10-19","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-16":{"file":"Hawksbill Sea Turtle Carey de Concha (5840602412).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Hawksbill_Sea_Turtle_Carey_de_Concha_%285840602412%29.jpg/960px-Hawksbill_Sea_Turtle_Carey_de_Concha_%285840602412%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/5/59/Hawksbill_Sea_Turtle_Carey_de_Concha_%285840602412%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Hawksbill_Sea_Turtle_Carey_de_Concha_%285840602412%29.jpg","author":"Caroline S. Rogers / NOAA; acervo USFWS Southeast Region","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/","caption":"Tartaruga-de-pente em ambiente marinho. Fonte: acervo USFWS/NOAA.","photographedAt":null,"reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-17":{"file":"SBNMS North Atlantic right whale (50040735308).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/SBNMS_North_Atlantic_right_whale_%2850040735308%29.jpg/960px-SBNMS_North_Atlantic_right_whale_%2850040735308%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/6/6e/SBNMS_North_Atlantic_right_whale_%2850040735308%29.jpg","source":"https://commons.wikimedia.org/wiki/File:SBNMS_North_Atlantic_right_whale_%2850040735308%29.jpg","author":"Allison Henry / NOAA; National Marine Sanctuaries","license":"Domínio público","licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/","caption":"Baleia-franca-do-atlântico-norte acompanhada por golfinhos, em registro aéreo.","photographedAt":null,"reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-18":{"file":"Whale shark (Rhincodon typus) (15603514463).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Whale_shark_%28Rhincodon_typus%29_%2815603514463%29.jpg/960px-Whale_shark_%28Rhincodon_typus%29_%2815603514463%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/a/ae/Whale_shark_%28Rhincodon_typus%29_%2815603514463%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Whale_shark_%28Rhincodon_typus%29_%2815603514463%29.jpg","author":"Sylke Rohrlach","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0/","caption":"Tubarão-baleia em Ningaloo Reef, Austrália.","photographedAt":"2014-04-22","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-19":{"file":"Mobula birostris 179661605.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mobula_birostris_179661605.jpg/960px-Mobula_birostris_179661605.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/9/90/Mobula_birostris_179661605.jpg","source":"https://commons.wikimedia.org/wiki/File:Mobula_birostris_179661605.jpg","author":"Dan Bender","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","caption":"Raia-manta identificada como Mobula birostris na fonte fotográfica, em Bonaire.","photographedAt":"2022-01-20","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-20":{"file":"African Penguin (Spheniscus demersus) (32780193212).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/African_Penguin_%28Spheniscus_demersus%29_%2832780193212%29.jpg/960px-African_Penguin_%28Spheniscus_demersus%29_%2832780193212%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/0/02/African_Penguin_%28Spheniscus_demersus%29_%2832780193212%29.jpg","source":"https://commons.wikimedia.org/wiki/File:African_Penguin_%28Spheniscus_demersus%29_%2832780193212%29.jpg","author":"Bernard DUPONT","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0/","caption":"Pinguim-africano em Boulders Beach, África do Sul.","photographedAt":"2016-10-16","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-21":{"file":"Waved Albatross, Galápagos Islands.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Waved_Albatross%2C_Gal%C3%A1pagos_Islands.jpg/960px-Waved_Albatross%2C_Gal%C3%A1pagos_Islands.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/4/41/Waved_Albatross%2C_Gal%C3%A1pagos_Islands.jpg","source":"https://commons.wikimedia.org/wiki/File:Waved_Albatross%2C_Gal%C3%A1pagos_Islands.jpg","author":"Anne Dirkse (www.annedirkse.com)","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/","caption":"Albatroz-das-galápagos nas ilhas Galápagos.","photographedAt":"2013-07-13","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-22":{"file":"Kākāpō head.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/K%C4%81k%C4%81p%C5%8D_head.jpg/960px-K%C4%81k%C4%81p%C5%8D_head.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/a/ad/K%C4%81k%C4%81p%C5%8D_head.jpg","source":"https://commons.wikimedia.org/wiki/File:K%C4%81k%C4%81p%C5%8D_head.jpg","author":"Kimberley Collins","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/","caption":"Retrato de kākāpō jovem em Anchor Island, Nova Zelândia.","photographedAt":"2016-07-18","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-23":{"file":"Ambystoma mexicanum 1.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Ambystoma_mexicanum_1.jpg/960px-Ambystoma_mexicanum_1.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/6/6b/Ambystoma_mexicanum_1.jpg","source":"https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_1.jpg","author":"Stan Shebs","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","caption":"Registro em cativeiro — axolote no Steinhart Aquarium, São Francisco.","photographedAt":"2005-06","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-24":{"file":"Anguilla anguilla 01 by-dpc (cropped).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Anguilla_anguilla_01_by-dpc_%28cropped%29.jpg/960px-Anguilla_anguilla_01_by-dpc_%28cropped%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/e/e6/Anguilla_anguilla_01_by-dpc_%28cropped%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Anguilla_anguilla_01_by-dpc_%28cropped%29.jpg","author":"David Pérez (DPC); recorte registrado: Ellicrum","license":"CC BY 3.0","licenseUrl":"https://creativecommons.org/licenses/by/3.0/","caption":"Enguia-europeia do rio Porma, Espanha. Versão recortada publicada na fonte.","photographedAt":"2010-10-26","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-25":{"file":"Acropora palmata (Elkhorn coral).jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Acropora_palmata_%28Elkhorn_coral%29.jpg/960px-Acropora_palmata_%28Elkhorn_coral%29.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/4/40/Acropora_palmata_%28Elkhorn_coral%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Acropora_palmata_%28Elkhorn_coral%29.jpg","author":"Nick Hobgood","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","caption":"Coral-chifre-de-alce, Acropora palmata.","photographedAt":"2008-07-20","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."},"animal-26":{"file":"Bombus affinis 5539518.jpg","src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Bombus_affinis_5539518.jpg/960px-Bombus_affinis_5539518.jpg","original":"https://upload.wikimedia.org/wikipedia/commons/4/4b/Bombus_affinis_5539518.jpg","source":"https://commons.wikimedia.org/wiki/File:Bombus_affinis_5539518.jpg","author":"psweet","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/","caption":"Abelhão da espécie Bombus affinis.","photographedAt":"2013-08-09","reviewedAt":"2026-10-22","changes":"Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte."}};
  const animals = window.FAUNA_CATALOG?.animals;
  if (!Array.isArray(animals)) return;
  const byId = new Map(animals.map(a => [a.id, a]));
  window.FAUNA_PHOTOS = Object.freeze(photos);
  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function link(url, text) {
    const a = el('a', '', text); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function credit(p) {
    const n = el('figcaption', 'fauna-photo-credit');
    n.append(el('span', '', 'Foto: ' + p.author), el('span', 'fauna-photo-context', p.caption));
    const rights = el('span', 'fauna-photo-rights');
    rights.append(link(p.licenseUrl, p.license), document.createTextNode(' · '), link(p.source, 'Fonte e arquivo'));
    n.append(rights); return n;
  }
  function visual(a, eager = false) {
    const p = photos[a.id], frame = el('span', 'fauna-photo-frame');
    const img = el('img', 'fauna-real-photo');
    img.alt = a.name + ' (' + a.scientific + '). ' + p.caption;
    img.width = 960; img.height = 640; img.loading = eager ? 'eager' : 'lazy';
    img.decoding = 'async'; img.referrerPolicy = 'no-referrer'; img.dataset.animalPhoto = a.id;
    const fallback = el('span', 'fauna-photo-failure', 'Foto indisponível. Consulte a fonte abaixo.');
    fallback.hidden = true;
    let retried = false;
    img.addEventListener('error', () => {
      if (!retried && img.src !== p.original) { retried = true; img.src = p.original; return; }
      img.hidden = true; fallback.hidden = false;
    });
    img.addEventListener('load', () => { img.hidden = false; fallback.hidden = true; });
    img.src = p.src; frame.append(img, fallback); return frame;
  }
  function figure(a, eager = true) {
    const p = photos[a.id], f = el('figure', 'fauna-photo-figure');
    const open = link(p.original, ''); open.className = 'fauna-photo-open';
    open.setAttribute('aria-label', 'Abrir fotografia original de ' + a.name);
    open.append(visual(a, eager)); f.append(open, credit(p)); return f;
  }
  function cards() {
    document.querySelectorAll('#animal-grid .animal-card').forEach(card => {
      if (card.dataset.photographed) return;
      const a = byId.get(card.dataset.animal), art = card.querySelector('.card-art');
      if (!a || !photos[a.id] || !art) return;
      card.dataset.photographed = 'true'; art.classList.add('fauna-photo-art');
      art.querySelector('.symbol')?.remove();
      const button = el('button', 'fauna-photo-open'); button.type = 'button'; button.dataset.detail = a.id;
      button.setAttribute('aria-label', 'Ver fotografia e ficha de ' + a.name);
      button.append(visual(a)); art.prepend(button);
      const caption = credit(photos[a.id]);
      // The credit is adjacent to the photograph, without nesting interactive controls.
      const wrapper = el('figure', 'fauna-card-figure');
      art.before(wrapper); wrapper.append(art, caption);
    });
  }
  const grid = document.getElementById('animal-grid');
  if (grid) { new MutationObserver(cards).observe(grid, {childList:true}); cards(); }
  const content = document.getElementById('dialog-content');
  function dialogPhoto() {
    if (!content || content.querySelector('.fauna-photo-figure')) return;
    const title = content.querySelector('#dialog-title')?.textContent;
    const animal = animals.find(a => a.name === title);
    if (animal && photos[animal.id]) {
      const scientific = content.querySelector('.scientific');
      if (scientific) scientific.after(figure(animal)); else content.prepend(figure(animal));
    }
  }
  if (content) new MutationObserver(dialogPhoto).observe(content, {childList:true});
  const hero = document.querySelector('.habitat-art');
  if (hero && photos[animals[0].id]) {
    hero.classList.add('fauna-real-hero');
    hero.setAttribute('aria-label', 'Fotografia real do soldadinho-do-araripe');
    hero.replaceChildren(el('p', 'eyebrow', 'ATLAS FOTOGRÁFICO · CEARÁ'), figure(animals[0]));
  }
  const method = document.getElementById('metodo');
  if (method) {
    const note = el('p', 'notice fauna-photo-notice', 'Fotografias reais do Wikimedia Commons. Autores e licenças estão identificados em cada imagem; registros históricos e em cativeiro são sinalizados. As imagens precisam de internet e suas requisições são recebidas pela Wikimedia. Nenhum favorito é enviado nessas requisições. ');
    const all = el('a', '', 'Ver todos os créditos fotográficos'); all.href = 'photos.html';
    note.append(all); method.append(note);
  }
})();
