const libGrid = document.getElementById('libGrid');
let libRegistry = { categories: [] };

async function loadLibrary() {
    try {
        const res = await fetch('../registry_biblioteca.json?t=' + Date.now());
        libRegistry = await res.json();
        renderLibrary();
    } catch (err) {
        libGrid.innerHTML = `<article class="card"><h3>⚠️ Erro</h3><p>Não consegui carregar a biblioteca: ${err.message}</p></article>`;
    }
}

function renderLibrary() {
    if (!libRegistry.categories || libRegistry.categories.length === 0) {
        libGrid.innerHTML = '<p>Nenhuma categoria encontrada.</p>';
        return;
    }

    libGrid.innerHTML = libRegistry.categories.map(cat => `
        <div class="category-block" style="grid-column: 1 / -1; margin-top: 2rem;">
            <h2 style="display: flex; align-items: center; gap: 10px;">
                <span>${cat.icon || '📂'}</span> ${cat.name}
            </h2>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1rem 0;">
        </div>
        ${cat.files.map(file => `
            <article class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">${file.type === 'pdf' ? '📕' : '📘'}</div>
                <h3>${file.name}</h3>
                <p class="muted">${file.path}</p>
                <div class="actions" style="margin-top: 1rem;">
                    <a class="btn primary" href="${libRegistry.basePath}${file.path}" target="_blank">Abrir Arquivo →</a>
                </div>
            </article>
        `).join('')}
    `).join('');
}

loadLibrary();
