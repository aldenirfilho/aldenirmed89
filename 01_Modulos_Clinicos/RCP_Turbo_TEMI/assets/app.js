'use strict';
/* RCP Turbo TEMI: interações educacionais locais. Nenhum dado clínico é enviado. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const KEY = 'antigravity:rcp:v1:';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Sem persistência: manter interação atual. */ } };
  const node = (tag, text, className) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (className) n.className = className; return n; };
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const chapters = $$('.chapter');
  const navLinks = $$('#chapter-nav a');
  const learning = window.RCP_LEARNING || { cases: [], flashcards: [] };
  let continuous = read(KEY + 'continuous', false) === true;
  let current = chapters[0];

  function updateTheme() {
    const light = document.documentElement.dataset.theme === 'light';
    $('#theme-toggle').textContent = light ? '◐ Escura' : '☀️ Clara';
    $('#theme-toggle').setAttribute('aria-pressed', String(light));
    $('#theme-toggle').setAttribute('aria-label', light ? 'Ativar visualização escura' : 'Ativar visualização clara');
  }
  $('#theme-toggle').addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    const prefs = read('antigravity:a11y:v1', {});
    write('antigravity:a11y:v1', { ...prefs, theme: light ? 'light' : 'dark', clarity: light, contrast: false });
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    document.documentElement.classList.remove('a11y-contrast'); updateTheme();
  });
  window.addEventListener('storage', event => { if (event.key === 'antigravity:a11y:v1') location.reload(); });
  function scaleFont(delta) {
    let scale = Number(read(KEY + 'font', 100));
    if (!Number.isFinite(scale)) scale = 100;
    scale = Math.max(90, Math.min(130, scale + delta));
    document.documentElement.style.fontSize = scale + '%'; write(KEY + 'font', scale);
  }
  $('#font-down').addEventListener('click', () => scaleFont(-10));
  $('#font-up').addEventListener('click', () => scaleFont(10));
  $('#print-module').addEventListener('click', () => window.print());
  updateTheme();

  function resolveTarget(hash) {
    try { return document.getElementById(decodeURIComponent((hash || '').replace(/^#/, ''))); } catch (_) { return null; }
  }
  function selectChapter(hash, scroll = false) {
    const target = resolveTarget(hash);
    const chapter = target?.classList.contains('chapter') ? target : target?.closest('.chapter');
    current = chapter || current || chapters[0];
    if (!current) return;
    const index = chapters.indexOf(current);
    document.body.classList.toggle('continuous', continuous);
    chapters.forEach(item => { item.hidden = !continuous && item !== current; });
    navLinks.forEach(link => { if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    $('#chapter-position').textContent = `CAPÍTULO ${String(index + 1).padStart(2, '0')} / ${chapters.length}`;
    $('#chapter-current-name').textContent = current.dataset.title;
    $('#module-intro').hidden = !continuous && index > 0;
    const previous = $('#previous-chapter'), next = $('#next-chapter');
    previous.href = '#' + chapters[Math.max(0, index - 1)].id;
    next.href = '#' + chapters[Math.min(chapters.length - 1, index + 1)].id;
    previous.hidden = index === 0; next.hidden = index === chapters.length - 1;
    $('#reading-mode').setAttribute('aria-pressed', String(continuous));
    $('#reading-mode').textContent = continuous ? '◎ Um capítulo por vez' : '↕ Leitura contínua';
    if (scroll) requestAnimationFrame(() => (target || current).scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !resolveTarget(link.hash)) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    selectChapter(link.hash, true);
    $('.sidebar').classList.remove('menu-open');
    $('#chapter-toggle').setAttribute('aria-expanded', 'false');
    $('#search-results').hidden = true;
    $('#search-input').setAttribute('aria-expanded', 'false');
  });
  window.addEventListener('hashchange', () => selectChapter(location.hash, true));
  window.addEventListener('popstate', () => selectChapter(location.hash, true));
  $('#reading-mode').addEventListener('click', () => { continuous = !continuous; write(KEY + 'continuous', continuous); selectChapter('#' + current.id, false); });
  $('#chapter-toggle').addEventListener('click', () => { const open = $('.sidebar').classList.toggle('menu-open'); $('#chapter-toggle').setAttribute('aria-expanded', String(open)); });
  selectChapter(location.hash, !!location.hash);

  const searchIndex = chapters.map(chapter => ({ id: chapter.id, title: chapter.dataset.title, text: chapter.textContent.replace(/\s+/g, ' '), normalized: normalize(chapter.textContent.replace(/\s+/g, ' ')) }));
  function search() {
    const term = normalize($('#search-input').value.trim());
    const box = $('#search-results'), list = $('ul', box); list.replaceChildren();
    box.hidden = term.length < 2; $('#search-input').setAttribute('aria-expanded', String(!box.hidden));
    if (box.hidden) return;
    const matches = searchIndex.filter(item => item.normalized.includes(term)).slice(0, 8);
    $('.search-count', box).textContent = matches.length ? `${matches.length} capítulos encontrados` : 'Nenhum capítulo encontrado. Tente outro termo.';
    matches.forEach(item => {
      const li = node('li'), link = node('a', item.title); link.href = '#' + item.id;
      const at = item.normalized.indexOf(term), start = Math.max(0, at - 35);
      const excerpt = node('small', (start ? '…' : '') + item.text.slice(start, start + 145) + '…'); li.append(link, excerpt); list.append(li);
    });
  }
  $('#search-input').addEventListener('input', search);
  $('#module-search').addEventListener('submit', event => { event.preventDefault(); $('#search-results a')?.click(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { event.preventDefault(); $('#search-input').focus(); }
    if (event.key === 'Escape') { $('#search-results').hidden = true; $('#search-input').setAttribute('aria-expanded', 'false'); }
  });

  const dialog = $('#image-dialog');
  $$('[data-expand-image]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || !dialog.showModal) return;
    event.preventDefault(); const image = $('img', link);
    $('#image-full').src = link.href; $('#image-full').alt = image.alt;
    $('#image-caption').textContent = image.alt; dialog.showModal();
  }));
  $('#image-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const b = dialog.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close(); } });

  function mount(name, markup) {
    const root = $(`[data-tool="${name}"]`);
    if (!root) return null;
    root.className = 'tool'; root.id = 'tool-' + name; root.innerHTML = markup; return root;
  }
  function sourceLinks(ids, root) {
    const p = node('p', null, 'tool-note'); p.append(document.createTextNode('Fontes: '));
    ids.forEach((id, i) => { if (i) p.append(' · '); const a = node('a', id.toUpperCase()); a.href = '#ref-' + id.toLowerCase(); p.append(a); }); root.append(p);
  }
  const algorithm = mount('algorithm', `<p class="tool-label">ALGORITMO INTERATIVO · ADULTO</p><h3>Escolha o ambiente. Percorra a decisão.</h3><p class="tool-intro">Demonstração de sequência, sem contagem de tempo real. Em uma PCR, não aguarde a ferramenta para agir.</p><div class="tool-controls"><label>Ambiente<select id="algorithm-environment"><option value="publico">Local público / DEA</option><option value="emergencia" selected>Emergência</option><option value="enfermaria">Enfermaria</option><option value="uti">UTI</option></select></label><label data-advanced-control>Ramo<select id="algorithm-rhythm"><option value="fv">FV / TV sem pulso</option><option value="aesp">AESP / assistolia</option></select></label><label data-advanced-control>Diretriz de referência<select id="algorithm-guideline"><option value="aha">AHA 2025</option><option value="erc">ERC 2025</option></select></label></div><div id="algorithm-result" class="tool-result" aria-live="polite"></div><div class="tool-actions"><button type="button" class="button secondary" id="algorithm-back">← Etapa anterior</button><button type="button" class="button primary" id="algorithm-next">Próxima etapa →</button><button type="button" class="button secondary" id="algorithm-rosc">Houve RCE</button></div><p class="tool-note">Trocar ambiente, ramo ou diretriz reinicia apenas a demonstração. Na PCR real, nunca zere doses, choques ou horários ao mudar de ramo.</p>`);
  if (algorithm) {
    let step = 0, rosc = false;
    const environments = { publico: 'Siga o DEA e o regulador do SAMU.', emergencia: 'Organize funções e trate a causa em paralelo.', enfermaria: 'Código local; desfibrilador ao leito; compressões já.', uti: 'Confira tubo, circuito, auto-PEEP, pneumotórax e causa.' };
    const publicSteps = [
      ['Reconhecer e acionar ajuda', ['Segurança; verifique resposta e respiração normal.', 'Gasping não exclui PCR. Acione 192 no viva-voz e peça DEA.', 'Leigo não procura pulso. Profissional: pulso e respiração em até 10 segundos.']],
      ['Iniciar RCP', ['100–120 compressões/min, profundidade 5–6 cm e retorno completo.', 'Treinado e disposto a ventilar: 30:2. Sem treinamento: compressões, seguindo o regulador.', 'Não espere o DEA para começar.']],
      ['Aplicar o DEA', ['Conecte pás ao tórax exposto e seco; siga as instruções.', 'Ninguém toca no paciente durante análise e choque.', 'Se indicar choque, aplique e retome RCP imediatamente; se não indicar, retome RCP.']],
      ['Continuar o atendimento', ['Siga as análises do DEA; alterne o compressor aproximadamente a cada 2 minutos.', 'Não procure pulso imediatamente após o choque.', 'Mantenha assistência até a equipe assumir ou sinais claros de circulação exigirem reavaliação.']]
    ];
    function stepsFor() {
      if ($('#algorithm-environment').value === 'publico') return publicSteps;
      if ($('#algorithm-rhythm').value === 'aesp') return [
        ['AESP / assistolia: não chocar', ['RCP imediata por ciclos de 2 minutos.', 'Adrenalina 1 mg IV/IO assim que possível; repetir a cada 3–5 minutos.', 'Confirme conexões e ritmo; investigue e trate causas reversíveis.']],
        ['Reavaliar o ritmo', ['Pausa mínima após o ciclo. Pulso somente com ritmo organizado/sinais de circulação, por até 10 segundos.', 'Se FV/TV sem pulso, mude para o ramo chocável.', 'Se AESP/assistolia, retome RCP e mantenha os intervalos reais das doses.']],
        ['Tratar a causa predominante', ['Reavalie hipóxia, hipovolemia, eletrólitos, tamponamento, pneumotórax, toxinas e trombose.', 'POCUS por operador treinado, sem prolongar pausas.', 'Adrenalina não substitui a correção de uma causa obstrutiva ou metabólica.']],
        ['Integrar a resposta', ['Confira perfusão, qualidade, ventilação e acesso.', 'ETCO₂ baixo ou ausência de movimento ao ultrassom, isoladamente, não determinam término.', 'A decisão de continuar/interromper é contextual, multimodal e vinculada aos objetivos de cuidado.']]
      ];
      const aha = $('#algorithm-guideline').value === 'aha';
      return [
        ['Primeiro choque', ['Confirme FV/TV sem pulso; desfibrile sem sincronização.', 'Bifásico: energia do fabricante; se desconhecida, máxima disponível.', 'Retome RCP por 2 minutos. Acesso IV primeiro; IO se falhar ou atrasar.', 'Busque e trate causas reversíveis desde o início.']],
        ['Segundo choque', ['Persistindo FV/TV sem pulso: choque e RCP imediata por 2 minutos.', aha ? 'AHA: adrenalina 1 mg IV/IO neste ciclo; repetir a cada 3–5 minutos.' : 'ERC: priorize choque/RCP; adrenalina entra após o terceiro choque.', 'Ventilação efetiva e capnografia; não atrasar compressões para intubar.']],
        ['Terceiro choque', ['Novo choque e RCP imediata por 2 minutos.', 'Amiodarona 300 mg IV/IO OU lidocaína conforme esquema da diretriz.', aha ? 'AHA: lidocaína 1–1,5 mg/kg. Mantenha adrenalina pelos horários já registrados.' : 'ERC: adrenalina 1 mg IV/IO agora; alternativa à amiodarona: lidocaína 100 mg.', 'Não associe antiarrítmicos automaticamente.']],
        ['Ciclo seguinte', ['Reavalie ritmo; choque somente enquanto for chocável; retome RCP imediatamente.', 'Adrenalina segue o relógio: intervalo de 3–5 minutos, não todo ciclo automaticamente.', 'Revise pás, contato, energia, perfusão e causa.']],
        ['Persistência após cinco choques', ['Continue RCP e correção causal; avalie resgate de acordo com equipe e recursos.', aha ? 'Se indicada na persistência: segunda amiodarona 150 mg OU lidocaína 0,5–0,75 mg/kg.' : 'ERC: segunda amiodarona 150 mg após o quinto choque; alternativa lidocaína 50 mg.', 'Não repetir indefinidamente o bolus inicial. Mudança de vetor e ECPR exigem seleção e protocolo.']]
      ];
    }
    function drawAlgorithm() {
      const isPublic = $('#algorithm-environment').value === 'publico';
      $$('[data-advanced-control]', algorithm).forEach(label => { label.hidden = isPublic; });
      const steps = stepsFor(); step = Math.min(step, steps.length - 1);
      const stage = rosc ? ['Retorno da circulação espontânea', ['Confirme pulso e perfusão; ritmo elétrico organizado não basta.', 'Oxigênio 100% até medida confiável; depois titular. Faixa prática SpO₂ 94–98%.', 'PaCO₂ 35–45 mmHg, PAM ≥65 mmHg, ECG e tratamento da causa.', 'Se não obedece comandos: controle deliberado de temperatura e prevenção de febre.']] : steps[step];
      const result = $('#algorithm-result'); result.replaceChildren();
      result.append(node('p', rosc ? 'PÓS-RCE · ADULTO' : `ETAPA ${step + 1}/${steps.length} · ${environments[$('#algorithm-environment').value]}`, 'step-position'), node('h4', stage[0]));
      const list = node('ol'); stage[1].forEach(text => list.append(node('li', text))); result.append(list);
      $('#algorithm-back').disabled = !rosc && step === 0; $('#algorithm-next').disabled = rosc || step === steps.length - 1; $('#algorithm-rosc').disabled = rosc;
    }
    ['algorithm-environment', 'algorithm-rhythm', 'algorithm-guideline'].forEach(id => $('#' + id).addEventListener('change', () => { step = 0; rosc = false; drawAlgorithm(); }));
    $('#algorithm-back').addEventListener('click', () => { if (rosc) rosc = false; else step = Math.max(0, step - 1); drawAlgorithm(); });
    $('#algorithm-next').addEventListener('click', () => { step++; drawAlgorithm(); });
    $('#algorithm-rosc').addEventListener('click', () => { rosc = true; drawAlgorithm(); });
    drawAlgorithm(); sourceLinks(['r01', 'r02', 'r03', 'r06'], algorithm);
  }

  const dose = mount('dose', `<p class="tool-label">CONVERSÃO DE UNIDADES · ADULTO</p><h3>Dose não é concentração.</h3><p class="tool-intro">Exercício de conversão para a dose convencional de adrenalina na PCR do adulto: <strong>1 mg</strong>. Não é calculadora pediátrica nem de infusão pós-RCE.</p><div class="tool-controls"><label>Concentração que consta no rótulo<select id="epi-concentration"><option value="">Selecione a apresentação</option><option value="1">1 mg/mL</option><option value="0.1">0,1 mg/mL</option></select></label></div><div id="dose-result" class="tool-result" aria-live="polite"><p>Confira a apresentação antes de converter.</p></div><p class="tool-note">Volume = dose ÷ concentração. A dose convencional se repete a cada 3–5 minutos; situações como LAST e PCR guiada por fisiologia exigem protocolo diferente.</p>`);
  if (dose) {
    $('#epi-concentration').addEventListener('change', () => {
      const value = Number($('#epi-concentration').value), result = $('#dose-result'); result.replaceChildren();
      if (![1, .1].includes(value)) { result.append(node('p', 'Selecione uma apresentação válida.')); return; }
      result.append(node('p', `${1 / value} mL contêm 1 mg`, 'dose-value'), node('p', `1 mg ÷ ${value.toLocaleString('pt-BR')} mg/mL = ${(1 / value).toLocaleString('pt-BR')} mL.`, 'tool-note'));
      result.append(node('p', 'Conferir rótulo, via, dose, preparo e registro com a equipe. Não administrar 1 mg em bolus a um paciente que tem circulação apenas por usar este conversor.', 'tool-note'));
    }); sourceLinks(['r02'], dose);
  }

  const causeData = [
    ['Hipóxia', 'Dessaturação prévia, secreção, falha ventilatória ou via aérea difícil.', 'Corrija oxigenação e ventilação. Confira vedação, tubo/capnografia, obstrução e circuito.'],
    ['Hipovolemia', 'Hemorragia, perdas, choque prévio; contexto e exame orientam.', 'Controle a perda; reposição dirigida, incluindo sangue quando indicado. Evite volume indiscriminado.'],
    ['H⁺ / acidose', 'Acidose pode ser consequência da própria PCR; correlacione a hipótese causal.', 'RCP e ventilação efetivas, tratamento etiológico. Bicarbonato não é rotina por pH baixo isolado.'],
    ['Hipo/hipercalemia', 'Insuficiência renal, diálise perdida, perdas ou alterações eletrocardiográficas prévias.', 'Aplique protocolo específico com concentração e diretriz nomeadas. Cálcio não remove potássio; insulina exige glicemia.'],
    ['Hipotermia', 'Exposição e temperatura central baixa; sinais vitais podem ser difíceis de detectar.', 'Reaqueça e aplique modificações de choques/fármacos do protocolo. Considere centro com suporte extracorpóreo.'],
    ['Pneumotórax hipertensivo', 'Ventilação sob pressão, trauma ou colapso associado a dificuldade ventilatória.', 'Se a hipótese for sustentada, descompressão por profissional habilitado; não esperar exame que atrase correção.'],
    ['Tamponamento', 'Contexto compatível e POCUS focado, sem alongar pausas.', 'Acione correção definitiva conforme etiologia e recursos. Derrame isolado não equivale a tamponamento causal.'],
    ['Toxinas', 'Exposição, medicações, procedimentos, padrão elétrico e história.', 'Antídoto/tratamento dirigido e toxicologia. LAST, BB/BCC e opioides têm particularidades.'],
    ['Trombose pulmonar', 'Risco/contexto de TEP, início súbito; VD dilatado e ETCO₂ baixo são inespecíficos.', 'Considere reperfusão quando TEP for confirmado ou fortemente suspeito. Não trombolise toda PCR.'],
    ['Trombose coronária', 'Quadro isquêmico e ritmo inicial podem apoiar a hipótese.', 'Organize reperfusão e tratamento da causa; após RCE, ECG e critérios de coronariografia urgente.']
  ];
  const causes = mount('causes', `<p class="tool-label">5 H / 5 T · RACIOCÍNIO CAUSAL</p><h3>Qual causa tratável ainda falta corrigir?</h3><p class="tool-intro">Escolha uma hipótese. Investigue e trate em paralelo às compressões; uma pista isolada não estabelece o diagnóstico.</p><div id="cause-options" class="cause-grid"></div><div id="cause-result" class="tool-result" aria-live="polite"></div>`);
  if (causes) {
    function drawCause(index) {
      const item = causeData[index], result = $('#cause-result'); result.replaceChildren();
      result.append(node('span', 'HIPÓTESE · NÃO DIAGNÓSTICO AUTOMÁTICO', 'status-tag'), node('h4', item[0]), node('p', 'Pistas: ' + item[1]), node('p', 'Ação: ' + item[2]));
      $$('#cause-options button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    }
    causeData.forEach((item, index) => { const button = node('button', item[0], 'button secondary'); button.type = 'button'; button.addEventListener('click', () => drawCause(index)); $('#cause-options').append(button); });
    drawCause(0); sourceLinks(['r02', 'r04', 'r05'], causes);
  }

  const quiz = mount('quiz', `<p class="tool-label">20 QUESTÕES · RECUPERAÇÃO ATIVA</p><h3>Decida antes de revelar.</h3><p class="tool-intro">Casos fictícios; hospital, leito e data não informados. Cada escolha revela o comentário de todas as alternativas. As respostas ficam somente neste navegador.</p><div class="tool-controls"><label>Escolher questão<select id="quiz-select"></select></label></div><div id="quiz-question"></div><div id="quiz-options" class="answer-options"></div><div id="quiz-feedback" aria-live="polite"></div><div class="tool-actions"><button type="button" class="button secondary" id="quiz-prev">← Anterior</button><button type="button" class="button primary" id="quiz-next">Próxima →</button></div><div class="quiz-progress" aria-live="polite"><span id="quiz-progress"></span><span id="quiz-score"></span></div>`);
  if (quiz && learning.cases.length) {
    const cases = learning.cases;
    let saved = read(KEY + 'answers', {}), index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < cases.length ? saved.index : 0;
    let answers = Array.isArray(saved.answers) && saved.answers.length === cases.length ? saved.answers.map(a => Number.isInteger(a) && a >= 0 && a <= 3 ? a : null) : Array(cases.length).fill(null);
    cases.forEach((item, i) => { const option = node('option', `${String(i + 1).padStart(2, '0')} · ${item.title}`); option.value = i; $('#quiz-select').append(option); });
    function saveQuiz() { write(KEY + 'answers', { index, answers }); }
    function drawQuiz() {
      const item = cases[index], question = $('#quiz-question'), options = $('#quiz-options'), feedback = $('#quiz-feedback');
      question.replaceChildren(node('p', item.context, 'question-context'), node('p', item.question, 'question-text')); options.replaceChildren(); feedback.replaceChildren();
      item.options.forEach((text, i) => {
        const label = node('label', null, 'answer-option'), input = document.createElement('input'); input.type = 'radio'; input.name = 'quiz-answer'; input.value = i; input.checked = answers[index] === i;
        input.addEventListener('change', () => { answers[index] = i; saveQuiz(); drawQuiz(); }); label.append(input, node('span', `${String.fromCharCode(65 + i)} · ${text}`)); options.append(label);
      });
      if (answers[index] !== null) {
        feedback.append(node('p', `Gabarito ${String.fromCharCode(65 + item.correct)} · ${answers[index] === item.correct ? 'Decisão correta.' : 'Reveja o raciocínio.'}`, 'answer-summary'));
        item.explanations.forEach((text, i) => { const p = node('p', null, 'answer-explanation' + (i === item.correct ? ' correct' : '')); p.append(node('strong', String.fromCharCode(65 + i) + ' · '), document.createTextNode(text)); feedback.append(p); });
        feedback.append(node('p', 'Regra de ouro: ' + item.rule, 'quiz-rule'), node('p', 'Flashcard: ' + item.flashcard, 'tool-note')); sourceLinks(item.sourceIds || [], feedback);
      }
      $('#quiz-select').value = index; $('#quiz-prev').disabled = index === 0; $('#quiz-next').disabled = index === cases.length - 1;
      $('#quiz-progress').textContent = `Questão ${index + 1}/${cases.length} · ${answers.filter(a => a !== null).length} respondidas`;
      $('#quiz-score').textContent = `${answers.reduce((sum, a, i) => sum + (a === cases[i].correct ? 1 : 0), 0)} acertos atuais · sem dívida de estudo`;
    }
    $('#quiz-select').addEventListener('change', () => { index = Number($('#quiz-select').value); saveQuiz(); drawQuiz(); });
    $('#quiz-prev').addEventListener('click', () => { index = Math.max(0, index - 1); saveQuiz(); drawQuiz(); });
    $('#quiz-next').addEventListener('click', () => { index = Math.min(cases.length - 1, index + 1); saveQuiz(); drawQuiz(); });
    drawQuiz();
  }

  const flashcards = mount('flashcards', `<p class="tool-label">28 FLASHCARDS · UMA IDEIA POR CARTÃO</p><h3>Reconstrua a resposta.</h3><p class="tool-intro">Tente lembrar antes de revelar. A marcação é uma autoavaliação de estudo, sem pontuação clínica.</p><div id="flashcard" class="flashcard" aria-live="polite"></div><div class="tool-actions"><button class="button secondary" id="flash-prev" type="button">← Anterior</button><button class="button primary" id="flash-reveal" type="button" aria-expanded="false">Revelar resposta</button><button class="button secondary" id="flash-next" type="button">Próximo →</button><button class="button secondary" id="flash-mark" type="button">Lembrei desta ideia</button></div><p class="tool-note" id="flash-progress"></p>`);
  if (flashcards && learning.flashcards.length) {
    const cards = learning.flashcards, saved = read(KEY + 'flashcards', {});
    let index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < cards.length ? saved.index : 0, revealed = false;
    const remembered = new Set(Array.isArray(saved.remembered) ? saved.remembered.filter(id => cards.some(c => c.id === id)) : []);
    function drawFlash() {
      const item = cards[index], box = $('#flashcard'); box.replaceChildren(node('p', `CARTÃO ${index + 1}/${cards.length}`, 'flash-label'), node('p', item.q, 'flash-question'));
      if (revealed) { box.append(node('p', item.a, 'flash-answer')); sourceLinks(item.sourceIds || [], box); }
      $('#flash-prev').disabled = index === 0; $('#flash-next').disabled = index === cards.length - 1;
      $('#flash-reveal').setAttribute('aria-expanded', String(revealed)); $('#flash-reveal').textContent = revealed ? 'Ocultar resposta' : 'Revelar resposta';
      $('#flash-mark').disabled = !revealed; $('#flash-mark').textContent = remembered.has(item.id) ? 'Marcar para revisar' : 'Lembrei desta ideia';
      $('#flash-progress').textContent = `${remembered.size}/${cards.length} ideias marcadas como lembradas neste navegador.`;
    }
    function saveFlash() { write(KEY + 'flashcards', { index, remembered: [...remembered] }); }
    $('#flash-prev').addEventListener('click', () => { index = Math.max(0, index - 1); revealed = false; drawFlash(); saveFlash(); });
    $('#flash-next').addEventListener('click', () => { index = Math.min(cards.length - 1, index + 1); revealed = false; drawFlash(); saveFlash(); });
    $('#flash-reveal').addEventListener('click', () => { revealed = !revealed; drawFlash(); });
    $('#flash-mark').addEventListener('click', () => { const id = cards[index].id; if (remembered.has(id)) remembered.delete(id); else remembered.add(id); drawFlash(); saveFlash(); });
    drawFlash();
  }

  const review = mount('review', `<p class="tool-label">REVISÃO ESPAÇADA · SEM COBRANÇA</p><h3>Uma próxima peça, na data que fizer sentido.</h3><p class="tool-intro">Datas sugeridas a partir do dia escolhido. Este quadro não cria lembretes, compromissos ou automações.</p><div class="tool-controls"><label>Data inicial<input id="review-date" type="date"></label></div><ul id="review-dates" class="review-dates" aria-live="polite"></ul>`);
  if (review) {
    const today = new Date(); $('#review-date').value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    function drawReview() {
      const value = $('#review-date').value, list = $('#review-dates'); list.replaceChildren();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) { list.append(node('li', 'Escolha uma data válida.')); return; }
      const [year, month, day] = value.split('-').map(Number), base = new Date(year, month - 1, day, 12);
      [0, 1, 7, 14, 30].forEach(offset => { const d = new Date(base); d.setDate(d.getDate() + offset); const li = node('li'); li.append(node('b', 'D' + offset), document.createTextNode(d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }))); list.append(li); });
    }
    $('#review-date').addEventListener('change', drawReview); drawReview();
  }

  const checklist = mount('checklist', `<p class="tool-label">CHECKLIST DE TREINAMENTO · ADULTO</p><h3>Organize a sequência.</h3><p class="tool-intro">Marcação para simulação e estudo. Não é registro assistencial nem prontuário; não acompanha uma PCR real.</p><div class="checklist" id="checklist-items"></div><p id="checklist-progress" class="tool-note" aria-live="polite"></p>`);
  if (checklist) {
    const items = ['Segurança e reconhecimento; pulso/respiração em até 10 s pelo profissional.', 'Ajuda e desfibrilador acionados.', 'Compressões com frequência, profundidade e retorno adequados.', 'Ritmo classificado e choque aplicado quando indicado.', 'Ventilação efetiva e sem excesso.', 'Doses, concentrações e horários conferidos.', 'Causa reversível investigada e tratada.', 'Troca de compressor e próxima avaliação organizadas.'];
    const saved = read(KEY + 'checklist', []), checked = new Set(Array.isArray(saved) ? saved.filter(i => Number.isInteger(i) && i >= 0 && i < items.length) : []);
    const update = () => { $('#checklist-progress').textContent = `${checked.size}/${items.length} itens marcados para este treino.`; };
    items.forEach((text, index) => { const label = node('label'), input = document.createElement('input'); input.type = 'checkbox'; input.checked = checked.has(index); input.addEventListener('change', () => { if (input.checked) checked.add(index); else checked.delete(index); write(KEY + 'checklist', [...checked]); update(); }); label.append(input, node('span', text)); $('#checklist-items').append(label); }); update();
  }
})();
