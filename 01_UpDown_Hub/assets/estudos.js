const grid = document.getElementById('docsGrid');
const themeFilter = document.getElementById('themeFilter');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
let registry = { documents: [] };

const badge = (text, cls='pill') => `<span class="${cls}">${text}</span>`;

async function loadRegistry(){
  try{
    const res = await fetch('registry.json?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    registry = await res.json();
    if (!registry || !registry.documents) registry = { documents: [] };
    hydrateFilters();
    renderDocs();
  }catch(err){
    console.error("Erro no Hub:", err);
    grid.innerHTML = `
      <article class="card" style="grid-column: 1/-1; border-color: var(--red);">
        <h3>⚠️ Erro de Carregamento</h3>
        <p>Não consegui abrir o registro de estudos (registry.json).</p>
        <p><small>${err.message}</small></p>
        <button class="btn primary" onclick="location.reload()" style="margin-top:1rem">Tentar novamente</button>
      </article>`;
  }
}

function hydrateFilters(){
  if (!registry.documents) return;
  const themes = [...new Set(registry.documents.map(d => d.theme).filter(Boolean))].sort();
  const statuses = [...new Set(registry.documents.map(d => d.status).filter(Boolean))].sort();
  
  if(themeFilter) {
    themeFilter.innerHTML = '<option value="">Todos os temas</option>';
    themes.forEach(t => themeFilter.insertAdjacentHTML('beforeend', `<option value="${t}">${t}</option>`));
  }
  
  if(statusFilter) {
    statusFilter.innerHTML = '<option value="">Status (Todos)</option>';
    statuses.forEach(s => statusFilter.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));
  }
  
  const metricDocs = document.getElementById('metricDocs');
  const metricThemes = document.getElementById('metricThemes');
  if(metricDocs) metricDocs.textContent = registry.documents.length;
  if(metricThemes) metricThemes.textContent = themes.length;
}

function renderDocs(){
  if (!registry.documents) return;
  const q = (searchInput && searchInput.value || '').toLowerCase();
  const theme = themeFilter && themeFilter.value;
  const status = statusFilter && statusFilter.value;
  
  const docs = registry.documents.filter(d => {
    const hay = `${d.title} ${d.theme} ${(d.tags||[]).join(' ')} ${d.summary||''}`.toLowerCase();
    return (!q || hay.includes(q)) && (!theme || d.theme === theme) && (!status || d.status === status);
  });
  
  grid.innerHTML = docs.map(d => `
    <article class="card">
      <div style="font-size: 2.5rem; margin-bottom: 1rem;">${d.icon || '📄'}</div>
      <h3>${d.title}</h3>
      <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 1rem;">${d.summary || ''}</p>
      <div class="pillrow" style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem;">
        ${badge(d.status || 'sem status','pill status')}
        ${badge(d.theme || 'tema')}
        ${(d.tags||[]).slice(0,3).map(t => badge('#'+t)).join('')}
      </div>
      <div class="actions" style="margin-top: auto; display: flex; gap: 0.5rem;">
        <a class="btn primary" href="${d.path.endsWith('.html') ? d.path : `viewer.html?doc=${encodeURIComponent(d.path)}`}" style="flex: 1; justify-content: center;">
          ${d.path.endsWith('.html') ? 'Abrir Leitor →' : 'Ver MD'}
        </a>
        ${d.relatedUrl ? `<a class="btn ghost" href="${d.relatedUrl}" title="Ver conexões" style="padding: 0.5rem;">🔗</a>` : ''}
      </div>
    </article>
  `).join('') || `<article class="card" style="grid-column: 1/-1;"><h3>🔍 Nada encontrado</h3><p>Tente outro tema, status ou termo.</p></article>`;
}

if (searchInput) searchInput.addEventListener('input', renderDocs);
if (themeFilter) themeFilter.addEventListener('change', renderDocs);
if (statusFilter) statusFilter.addEventListener('change', renderDocs);

loadRegistry();
