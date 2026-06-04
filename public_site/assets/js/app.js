async function loadJSON(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  } catch (error) {
    console.warn('Usando fallback para', path, error);
    return fallback;
  }
}

const fallbackTopics = [
  { title: '💉 Trombólise endovenosa', description: 'Critérios, contraindicações, janela e metas pressóricas.', url: 'temas/avc-agudo/index.html#trombolise', tags: ['AVC', 'Emergência'] },
  { title: '🧲 Trombectomia mecânica', description: 'Oclusão de grande vaso, angioTC, perfusão e logística.', url: 'temas/avc-agudo/index.html#trombectomia', tags: ['AVC', 'Neuroimagem'] },
  { title: '🎚️ Controle pressórico', description: 'Metas no AVC isquêmico, pós-reperfusão e hemorragia.', url: 'temas/avc-agudo/index.html#pressao', tags: ['AVC', 'PA'] }
];

async function renderHomeConnections() {
  const container = document.getElementById('avcConnections');
  if (!container) return;
  const topics = await loadJSON('data/topics.json', fallbackTopics);
  const avcTopics = topics.filter(t => (t.parent || '').includes('avc-agudo') || (t.tags || []).includes('AVC')).slice(0, 6);
  container.innerHTML = avcTopics.map(topic => `
    <a class="card topic-mini" href="${topic.url || '#'}">
      <h3>${topic.title}</h3>
      <p>${topic.description}</p>
    </a>
  `).join('');
}

renderHomeConnections();
