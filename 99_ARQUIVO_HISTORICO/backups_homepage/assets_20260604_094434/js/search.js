// Motor simples de busca local para evolução futura.
// Próxima etapa: criar uma página /busca/index.html que leia data/topics.json e data/connections.json.
function normalizeSearch(text) {
  return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterItems(query, items) {
  const q = normalizeSearch(query);
  return items.filter(item => normalizeSearch(`${item.title} ${item.description} ${(item.tags || []).join(' ')}`).includes(q));
}
