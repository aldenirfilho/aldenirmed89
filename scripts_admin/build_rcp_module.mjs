#!/usr/bin/env node
/** Gera apenas a página e o catálogo RCP a partir das fontes canônicas.
 * Uso: node scripts_admin/build_rcp_module.mjs [--marked-path /caminho/marked.esm.js]
 * Requer marked no ambiente de autoria; o site publicado não depende de pacotes.
 * Nunca remove a pasta do módulo nem modifica conteúdo de outros módulos.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_REL = '01_Modulos_Clinicos/RCP_Turbo_TEMI';
const moduleDir = path.join(ROOT, MODULE_REL);
const mdRel = '01_UpDown_Hub/content/intensiva/rcp-turbo-temi-360.md';
const md = fs.readFileSync(path.join(ROOT, mdRel), 'utf8');
const learning = JSON.parse(fs.readFileSync(path.join(moduleDir, 'data/learning.json'), 'utf8'));
const args = process.argv.slice(2), rendererAt = args.indexOf('--marked-path');
const rendererPath = rendererAt >= 0 ? args[rendererAt + 1] : process.env.RCP_MARKED_MODULE;
let marked;
try { ({ marked } = await import(rendererPath ? pathToFileURL(path.resolve(rendererPath)).href : 'marked')); }
catch (_) { throw new Error('Renderizador marked não encontrado. Disponibilize-o no ambiente de autoria ou informe --marked-path.'); }
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const labels = {
  'primeiros-minutos': 'Reconhecer e agir', qualidade: 'RCP de qualidade', algoritmos: 'Algoritmos por ambiente', desfibrilacao: 'Desfibrilação', farmacos: 'Doses e segurança', ambientes: 'Público, emergência e UTI', 'via-aerea': 'Via aérea e fisiologia', causas: 'Causas reversíveis', 'situacoes-especiais': 'Situações especiais', resgate: 'Resgate e off-label', 'pos-rce': 'Cuidados pós-RCE', pediatria: 'Diferenças pediátricas', treino: 'Laboratório TEMI', referencias: 'Fontes e limites'
};
const figures = [
  { id: '01-reconhecer-pcr', chapter: 'primeiros-minutos', title: 'Reconhecer e agir', cue: 'Gasping não é respiração normal: reconheça, acione ajuda, inicie RCP e use DEA.', sourceIds: ['r01'], hero: true },
  { id: '02-compressao', chapter: 'qualidade', title: 'Compressão que perfunde', cue: 'Recupere frequência, profundidade, retorno e redução das pausas.', sourceIds: ['r01'] },
  { id: '03-desfibrilacao', chapter: 'desfibrilacao', title: 'Choque sem demora', cue: 'Antes do choque, todos afastados; depois, compressões imediatamente. A pá lateral fica abaixo da axila esquerda, na linha axilar média.', sourceIds: ['r02', 'r03'] },
  { id: '04-dois-caminhos', chapter: 'algoritmos', title: 'Dois caminhos, um ciclo', cue: 'FV/TV sem pulso pede choque; AESP/assistolia pede RCP e adrenalina precoce. Em ambos, tratar a causa.', sourceIds: ['r02', 'r03'] },
  { id: '05-ventilar', chapter: 'via-aerea', title: 'Ventilar sem exagero', cue: 'Vedação e abertura da via aérea, com expansão torácica visível. Evite hiperventilação.', sourceIds: ['r01', 'r03'] },
  { id: '06-causas', chapter: 'causas', title: 'Qual é a causa?', cue: 'Transforme 5 H e 5 T em hipótese, intervenção e reavaliação.', sourceIds: ['r02', 'r05'] },
  { id: '07-tubo', chapter: 'via-aerea', title: 'Tubo não é garantia', cue: 'Deslocamento, obstrução, pneumotórax, equipamento e auto-PEEP: confirme ventilação efetiva.', sourceIds: ['r03', 'r05'] },
  { id: '08-dose-segura', chapter: 'farmacos', title: 'Dose não é concentração', cue: 'Algoritmo convencional adulto: 1 mg de adrenalina a cada 3–5 minutos. Confira concentração, volume e contexto; há exceções específicas.', sourceIds: ['r02'] },
  { id: '09-pos-rce', chapter: 'pos-rce', title: 'Voltou o pulso. E agora?', cue: 'Alvos práticos após medida confiável: SpO₂ 94–98%, PaCO₂ 35–45 mmHg e PAM ≥65 mmHg; prevenir febre e tratar a causa.', sourceIds: ['r06', 'r07'] },
  { id: '10-equipe', chapter: 'ambientes', title: 'Uma equipe, um ciclo', cue: 'Distribua funções e comunique ordens, confirmação e execução em circuito fechado.', sourceIds: ['r03'] }
];
function figureHtml(figure) {
  const n = figure.id.slice(0, 2), sourceLinks = figure.sourceIds.map(id => `<a href="#ref-${id}">${id.toUpperCase()}</a>`).join(' · ');
  return `<figure class="clinical-figure" id="figura-${n}"><a href="assets/images/${figure.id}.webp" data-expand-image aria-label="Ampliar figura ${n}: ${escape(figure.title)}"><img src="assets/images/${figure.id}.webp" width="1672" height="941" loading="lazy" decoding="async" alt="Figura ${n} — ${escape(figure.title)}. ${escape(figure.cue)} Ilustração educacional gerada por IA."></a><figcaption><b>Figura ${n} — ${escape(figure.title)}.</b> ${escape(figure.cue)} ${sourceLinks}<a class="figure-open" href="assets/images/${figure.id}.webp" target="_blank" rel="noopener">Abrir imagem ↗</a></figcaption></figure>`;
}
function render(text) {
  return marked.parse(text, { gfm: true, breaks: false }).replace(/<table>([\s\S]*?)<\/table>/g, (_, inside) => `<div class="table-wrap" role="region" aria-label="Tabela; deslize horizontalmente se necessário" tabindex="0"><table>${inside.replace(/<th>/g, '<th scope="col">')}</table></div>`).replace(/<a href="(https?:[^\"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}
const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
const starts = [...body.matchAll(/^## (.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)];
if (starts.length !== 14) throw new Error('Esperados 14 capítulos com IDs explícitos.');
if (learning.cases.length !== 20 || learning.flashcards.length !== 28) throw new Error('Esperadas 20 questões e 28 flashcards.');
let navigation = '', chapters = '';
starts.forEach((match, index) => {
  const id = match[2], title = match[1];
  if (!labels[id]) throw new Error('Capítulo desconhecido: ' + id);
  const content = body.slice(match.index + match[0].length, starts[index + 1]?.index ?? body.length);
  let html = render(content);
  if (id === 'primeiros-minutos') html += '<div data-tool="checklist"></div>';
  html += figures.filter(figure => figure.chapter === id && !figure.hero).map(figureHtml).join('\n');
  chapters += `<section class="chapter" id="${id}" data-title="${escape(labels[id])}"><p class="chapter-kicker">${String(index + 1).padStart(2, '0')} / TURBO TEMI 360°</p><h2>${escape(title)}</h2>${html}</section>\n`;
  navigation += `<a href="#${id}"><span>${String(index + 1).padStart(2, '0')}</span>${escape(labels[id])}</a>\n`;
});
const printTraining = '<section class="print-training"><h2>Laboratório TEMI — questões comentadas</h2>' + learning.cases.map((item, index) => `<article><h3>${index + 1}. ${escape(item.title)}</h3><p>${escape(item.context)}</p><p>${escape(item.question)}</p><ol type="A">${item.options.map(option => `<li>${escape(option)}</li>`).join('')}</ol><p><strong>Gabarito: ${String.fromCharCode(65 + item.correct)}</strong></p>${item.explanations.map((text, i) => `<p><strong>${String.fromCharCode(65 + i)}.</strong> ${escape(text)}</p>`).join('')}<p><strong>Regra:</strong> ${escape(item.rule)}</p></article>`).join('') + '<h2>Flashcards</h2>' + learning.flashcards.map((item, i) => `<article><p><strong>${i + 1}. ${escape(item.q)}</strong><br>${escape(item.a)}</p></article>`).join('') + '</section>';
const shell = fs.readFileSync(path.join(ROOT, 'scripts_admin/templates/rcp-shell.html'), 'utf8');
const html = shell.replace('{{NAVIGATION}}', navigation).replace('{{CHAPTERS}}', chapters).replace('{{PRINT_TRAINING}}', printTraining);
if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error('Placeholder de compilação não resolvido.');
fs.writeFileSync(path.join(moduleDir, 'index.html'), html);
fs.writeFileSync(path.join(moduleDir, 'data/learning.js'), '/* Catálogo gerado de learning.json; editar a fonte JSON. */\nwindow.RCP_LEARNING = ' + JSON.stringify(learning, null, 2) + ';\n');
const visual = { schemaVersion: '1.0.0', title: 'RCP — dez microaulas visuais', generatedAt: '2026-11-03', assistedByAI: true, originalCompositions: true, notPatientImages: true, rights: 'Ilustrações originais geradas para esta sessão; sem reprodução de algoritmos gráficos oficiais.', figures: figures.map(figure => { const bytes = fs.readFileSync(path.join(moduleDir, 'assets/images', figure.id + '.webp')); return { ...figure, href: 'assets/images/' + figure.id + '.webp', width: 1672, height: 941, bytes: bytes.length, sha256: hash(bytes) }; }) };
fs.writeFileSync(path.join(moduleDir, 'data/visual-assets.json'), JSON.stringify(visual, null, 2) + '\n');
const manifestPath = path.join(moduleDir, 'module.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.sourceIntegrity = { markdown: { path: mdRel, sha256: hash(md) }, learning: { path: MODULE_REL + '/data/learning.json', sha256: hash(fs.readFileSync(path.join(moduleDir, 'data/learning.json'))) } };
manifest.content = { chapters: starts.length, images: figures.length, questions: learning.cases.length, flashcards: learning.flashcards.length };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`RCP: ${starts.length} capítulos, ${figures.length} imagens, ${learning.cases.length} questões, ${learning.flashcards.length} flashcards. HTML ${Buffer.byteLength(html)} bytes.`);
