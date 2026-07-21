(function () {
  'use strict';

  const STORAGE_KEY = 'biblioteca_reader_v1';
  const PREFERENCES_KEY = 'biblioteca_reader_preferences_v1';
  const MAX_HIGHLIGHTS_PER_DOCUMENT = 300;
  const MAX_QUOTE_LENGTH = 2000;
  const MAX_NOTE_LENGTH = 4000;
  const MAX_SEARCH_RESULTS = 300;
  const COLOR_VALUES = {
    yellow: '#fde047',
    green: '#86efac',
    blue: '#7dd3fc',
    pink: '#f9a8d4'
  };
  const WIDTH_VALUES = {
    narrow: '680px',
    comfortable: '820px',
    wide: '1080px'
  };
  const FONT_VALUES = {
    system: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    serif: 'Georgia,"Times New Roman",serif',
    mono: 'ui-monospace,SFMono-Regular,Menlo,monospace'
  };

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, Number(value) || minimum));
  }

  function readJSON(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed === null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeFilename(value) {
    const normalized = String(value || 'documento')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90);
    return normalized || 'documento';
  }

  function makeId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
    if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      const values = new Uint32Array(4);
      globalThis.crypto.getRandomValues(values);
      return 'hl-' + Array.from(values, function (value) {
        return value.toString(16).padStart(8, '0');
      }).join('');
    }
    return 'hl-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function sanitizeHighlight(value) {
    const source = value && typeof value === 'object' ? value : {};
    const start = Math.max(0, Math.floor(Number(source.start) || 0));
    const end = Math.max(start, Math.floor(Number(source.end) || start));
    const color = Object.prototype.hasOwnProperty.call(COLOR_VALUES, source.color)
      ? source.color
      : 'yellow';
    return {
      id: String(source.id || makeId()).slice(0, 100),
      start: start,
      end: end,
      quote: String(source.quote || '').slice(0, MAX_QUOTE_LENGTH),
      prefix: String(source.prefix || '').slice(0, 100),
      suffix: String(source.suffix || '').slice(0, 100),
      color: color,
      note: String(source.note || '').slice(0, MAX_NOTE_LENGTH),
      sourceSha256: /^[0-9a-f]{64}$/.test(String(source.sourceSha256 || '').toLowerCase())
        ? String(source.sourceSha256).toLowerCase()
        : '',
      createdAt: String(source.createdAt || ''),
      updatedAt: String(source.updatedAt || '')
    };
  }

  function escapeMarkdown(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/([\\`*_[\]{}()#+\-.!|])/g, '\\$1');
  }

  function sanitizePreferences(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      width: Object.prototype.hasOwnProperty.call(WIDTH_VALUES, source.width)
        ? source.width
        : 'comfortable',
      font: Object.prototype.hasOwnProperty.call(FONT_VALUES, source.font)
        ? source.font
        : 'system',
      fontSize: clamp(source.fontSize || 18, 14, 28),
      lineHeight: clamp(source.lineHeight || 1.75, 1.35, 2.25),
      theme: ['dark', 'light', 'sepia'].includes(source.theme) ? source.theme : 'dark'
    };
  }

  function downloadText(filename, content, mimeType) {
    const blobUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 1200);
  }

  class FocusedReader {
    constructor(options) {
      this.options = options || {};
      this.overlay = document.getElementById('previewOverlay');
      this.frame = document.getElementById('previewFrame');
      this.tools = document.getElementById('readerTools');
      this.item = null;
      this.previewMetadata = null;
      this.document = null;
      this.root = null;
      this.selection = null;
      this.searchMatches = [];
      this.searchIndex = -1;
      this.focused = false;
      this.textAvailable = false;
      this.noteTimers = new Map();
      this.pendingNotes = new Map();
      this.frameLoadHandler = null;
      this.preferences = sanitizePreferences(readJSON(PREFERENCES_KEY, {}));
      this.bindControls();
      this.renderPreferences();
      this.disable('Abra um documento para iniciar a leitura focada.');
      window.addEventListener('storage', this.handleStorage.bind(this));
      window.addEventListener('pagehide', this.flushAllNotes.bind(this));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.flushAllNotes();
      });
    }

    element(id) {
      return document.getElementById(id);
    }

    bindControls() {
      const self = this;
      const toggle = this.element('readerFocusToggle');
      if (toggle) toggle.addEventListener('click', function () { self.toggleFocus(); });

      const width = this.element('readerWidth');
      if (width) width.addEventListener('change', function () {
        self.preferences.width = width.value;
        self.savePreferences();
      });
      const font = this.element('readerFont');
      if (font) font.addEventListener('change', function () {
        self.preferences.font = font.value;
        self.savePreferences();
      });
      const theme = this.element('readerTheme');
      if (theme) theme.addEventListener('change', function () {
        self.preferences.theme = theme.value;
        self.savePreferences();
      });
      const fontMinus = this.element('readerFontMinus');
      if (fontMinus) fontMinus.addEventListener('click', function () {
        self.preferences.fontSize = clamp(self.preferences.fontSize - 1, 14, 28);
        self.savePreferences();
      });
      const fontPlus = this.element('readerFontPlus');
      if (fontPlus) fontPlus.addEventListener('click', function () {
        self.preferences.fontSize = clamp(self.preferences.fontSize + 1, 14, 28);
        self.savePreferences();
      });
      const lineMinus = this.element('readerLineMinus');
      if (lineMinus) lineMinus.addEventListener('click', function () {
        self.preferences.lineHeight = clamp(self.preferences.lineHeight - .1, 1.35, 2.25);
        self.savePreferences();
      });
      const linePlus = this.element('readerLinePlus');
      if (linePlus) linePlus.addEventListener('click', function () {
        self.preferences.lineHeight = clamp(self.preferences.lineHeight + .1, 1.35, 2.25);
        self.savePreferences();
      });

      const search = this.element('readerSearch');
      if (search) {
        let timer = null;
        search.addEventListener('input', function () {
          clearTimeout(timer);
          timer = setTimeout(function () { self.runSearch(search.value); }, 240);
        });
        search.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            self.navigateSearch(event.shiftKey ? -1 : 1);
          }
        });
      }
      const previous = this.element('readerSearchPrev');
      if (previous) previous.addEventListener('click', function () { self.navigateSearch(-1); });
      const next = this.element('readerSearchNext');
      if (next) next.addEventListener('click', function () { self.navigateSearch(1); });
      const clear = this.element('readerSearchClear');
      if (clear) clear.addEventListener('click', function () { self.clearSearch(true); });

      const add = this.element('readerAddHighlight');
      if (add) add.addEventListener('click', function () { self.addHighlightFromSelection(); });

      const exportFormat = this.element('readerExportFormat');
      const exportButton = this.element('readerExport');
      if (exportButton) exportButton.addEventListener('click', function () {
        self.exportHighlights(exportFormat ? exportFormat.value : 'markdown');
      });
      const exportMarkdown = this.element('readerExportMarkdown');
      if (exportMarkdown) exportMarkdown.addEventListener('click', function () { self.exportHighlights('markdown'); });
      const exportJSON = this.element('readerExportJSON');
      if (exportJSON) exportJSON.addEventListener('click', function () { self.exportHighlights('json'); });
      const exportHTML = this.element('readerExportHTML');
      if (exportHTML) exportHTML.addEventListener('click', function () { self.exportHighlights('html'); });
    }

    beginDocument(item) {
      this.item = item || null;
      this.previewMetadata = null;
      this.document = null;
      this.root = null;
      this.selection = null;
      this.searchMatches = [];
      this.searchIndex = -1;
      this.textAvailable = false;
      this.setFocused(false);
      const search = this.element('readerSearch');
      if (search) search.value = '';
      this.updateSearchStatus('Busca indisponível');
      this.renderHighlightPanel();
      this.disable('Carregando prévia local verificada…');
    }

    prepareFrame(frame, item, token, metadata) {
      const self = this;
      if (this.frame && this.frameLoadHandler) {
        this.frame.removeEventListener('load', this.frameLoadHandler);
      }
      this.item = item || this.item;
      this.previewMetadata = metadata || {};
      this.frame = frame;
      this.frameLoadHandler = function () {
        if (typeof self.options.isTokenCurrent === 'function' && !self.options.isTokenCurrent(token)) {
          frame.removeEventListener('load', self.frameLoadHandler);
          self.frameLoadHandler = null;
          return;
        }
        let locationHref = '';
        try {
          locationHref = String(frame.contentDocument && frame.contentDocument.location && frame.contentDocument.location.href || '');
        } catch (_) {
          locationHref = '';
        }
        // Remover src/srcdoc pode disparar um load intermediário de about:blank.
        // O listener só é consumido pelo preview confiável ou pelo srcdoc real.
        if (locationHref === 'about:blank') return;
        frame.removeEventListener('load', self.frameLoadHandler);
        self.frameLoadHandler = null;
        self.attachTrustedDocument();
      };
      frame.addEventListener('load', this.frameLoadHandler);
    }

    determineTextAvailability() {
      const metadata = this.previewMetadata || {};
      const stats = metadata.stats && typeof metadata.stats === 'object' ? metadata.stats : {};
      const format = String(metadata.previewFormat || '').toLowerCase();
      if (format === 'pages') return false;
      if (format === 'pdf') {
        const ocrReady = stats.ocrReady === true || metadata.status === 'ocr-ready';
        if (ocrReady) return (Number(stats.ocrVisibleCharacters) || 0) > 0;
        if (stats.ocrRequired === true || metadata.status === 'ocr-required') return false;
        const visibleCharacters = Number(
          stats.nativeVisibleCharacters != null ? stats.nativeVisibleCharacters : stats.characters
        ) || 0;
        return visibleCharacters > 0;
      }
      if (format === 'docx' && Object.prototype.hasOwnProperty.call(stats, 'characters')) {
        return (Number(stats.characters) || 0) > 0;
      }
      const visibleText = String((this.root && this.root.textContent) || '').replace(/\s+/g, '');
      return visibleText.length >= 2;
    }

    attachTrustedDocument() {
      try {
        const doc = this.frame.contentDocument;
        const root = doc && doc.querySelector('[data-reader-content], article');
        if (!doc || !root) throw new Error('surface');
        this.document = doc;
        this.root = root;
        this.injectRuntimeStyles();
        this.root.setAttribute('data-reader-content', 'true');
        this.document.addEventListener('selectionchange', this.captureSelection.bind(this));
        this.textAvailable = this.determineTextAvailability();
        this.enable();
        this.applyPreferences();
        this.renderDocumentAnnotations();
        this.renderHighlightPanel();
        if (this.textAvailable && this.previewMetadata?.stats?.ocrReady === true) {
          this.setStatus('Texto reconhecido por OCR: pesquise e destaque, mas confira no original.', 'warn');
        } else if (this.textAvailable) {
          this.setStatus('Selecione um trecho e clique em Destacar.', 'ok');
        } else {
          this.setStatus('Sem camada textual: OCR necessário para busca e destaques.', 'warn');
        }
      } catch (_) {
        this.disable('Esta visualização permanece isolada; use abrir ou baixar o original.');
      }
    }

    disable(message) {
      if (this.tools) this.tools.setAttribute('aria-disabled', 'true');
      this.setReaderControlsDisabled(true);
      this.setStatus(message, 'warn');
    }

    enable() {
      if (this.tools) this.tools.setAttribute('aria-disabled', 'false');
      this.setReaderControlsDisabled(false);
      const add = this.element('readerAddHighlight');
      const search = this.element('readerSearch');
      if (add) add.disabled = !this.textAvailable;
      if (search) search.disabled = !this.textAvailable;
      ['readerSearchPrev', 'readerSearchNext', 'readerSearchClear'].forEach((id) => {
        const control = this.element(id);
        if (control) control.disabled = !this.textAvailable;
      });
      if (!this.textAvailable) this.updateSearchStatus('OCR necessário');
      this.updateExportControls();
    }

    setReaderControlsDisabled(disabled) {
      document.querySelectorAll('.reader-reading-control').forEach(function (element) {
        element.disabled = Boolean(disabled);
      });
    }

    injectRuntimeStyles() {
      if (!this.document || this.document.getElementById('antigravity-reader-runtime')) return;
      const style = this.document.createElement('style');
      style.id = 'antigravity-reader-runtime';
      style.textContent = [
        ':root{--reader-width:820px;--reader-font-size:18px;--reader-line-height:1.75;--reader-font:system-ui,sans-serif}',
        'body[data-reader-theme="dark"]{--reader-bg:#0b1220;--reader-card:#111c30;--reader-text:#e5edf8;--reader-muted:#9fb0c8;--reader-line:#263750}',
        'body[data-reader-theme="light"]{--reader-bg:#f7fafc;--reader-card:#ffffff;--reader-text:#172033;--reader-muted:#536175;--reader-line:#cbd5e1}',
        'body[data-reader-theme="sepia"]{--reader-bg:#f3ead5;--reader-card:#fff9eb;--reader-text:#3c3022;--reader-muted:#76634d;--reader-line:#d8c7a8}',
        'body[data-reader-focused="true"]{background:var(--reader-bg)!important;color:var(--reader-text)!important;font-family:var(--reader-font)!important;font-size:var(--reader-font-size)!important;line-height:var(--reader-line-height)!important}',
        'body[data-reader-focused="true"] main{width:min(var(--reader-width),100%)!important;max-width:none!important;padding:clamp(1rem,4vw,2.5rem)!important}',
        'body[data-reader-focused="true"] .notice,body[data-reader-focused="true"] .meta,body[data-reader-focused="true"] .download{display:none!important}',
        'body[data-reader-focused="true"] article{background:var(--reader-card)!important;color:var(--reader-text)!important;border:0!important;box-shadow:none!important;padding:clamp(1.25rem,4vw,3rem)!important}',
        'body[data-reader-focused="true"] h1,body[data-reader-focused="true"] h2,body[data-reader-focused="true"] h3,body[data-reader-focused="true"] h4{color:var(--reader-text)!important}',
        'body[data-reader-focused="true"] p,body[data-reader-focused="true"] li,body[data-reader-focused="true"] td,body[data-reader-focused="true"] pre{font-family:var(--reader-font)!important;font-size:1em!important;line-height:var(--reader-line-height)!important;color:var(--reader-text)!important}',
        'body[data-reader-focused="true"] .pdf-text-page pre{white-space:pre-wrap!important;overflow-wrap:anywhere!important}',
        'mark.reader-highlight{padding:.03em .08em;border-radius:.18em;color:#172033!important;box-decoration-break:clone;-webkit-box-decoration-break:clone}',
        'mark.reader-highlight[data-color="yellow"]{background:#fde047!important}',
        'mark.reader-highlight[data-color="green"]{background:#86efac!important}',
        'mark.reader-highlight[data-color="blue"]{background:#7dd3fc!important}',
        'mark.reader-highlight[data-color="pink"]{background:#f9a8d4!important}',
        'mark.reader-search-hit{background:#fb923c!important;color:#172033!important;outline:2px solid #f97316;scroll-margin-block:25vh}',
        'mark.reader-search-hit[data-current="true"]{outline:4px solid #38bdf8;background:#fdba74!important}'
      ].join('');
      this.document.head.appendChild(style);
    }

    renderPreferences() {
      const width = this.element('readerWidth');
      const font = this.element('readerFont');
      const theme = this.element('readerTheme');
      if (width) width.value = this.preferences.width;
      if (font) font.value = this.preferences.font;
      if (theme) theme.value = this.preferences.theme;
      const fontValue = this.element('readerFontValue');
      const lineValue = this.element('readerLineValue');
      if (fontValue) fontValue.textContent = this.preferences.fontSize + 'px';
      if (lineValue) lineValue.textContent = this.preferences.lineHeight.toFixed(2);
    }

    savePreferences() {
      this.preferences = sanitizePreferences(this.preferences);
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
      } catch (_) {
        this.setStatus('Preferências não puderam ser salvas.', 'error');
      }
      this.renderPreferences();
      this.applyPreferences();
    }

    applyPreferences() {
      if (!this.document || !this.document.body) return;
      const rootStyle = this.document.documentElement.style;
      rootStyle.setProperty('--reader-width', WIDTH_VALUES[this.preferences.width]);
      rootStyle.setProperty('--reader-font-size', this.preferences.fontSize + 'px');
      rootStyle.setProperty('--reader-line-height', String(this.preferences.lineHeight));
      rootStyle.setProperty('--reader-font', FONT_VALUES[this.preferences.font]);
      this.document.body.setAttribute('data-reader-theme', this.preferences.theme);
      this.document.body.setAttribute('data-reader-focused', this.focused ? 'true' : 'false');
    }

    toggleFocus() {
      if (!this.document) return;
      this.setFocused(!this.focused);
    }

    setFocused(value) {
      this.focused = Boolean(value);
      if (this.overlay) this.overlay.classList.toggle('reader-focused', this.focused);
      const toggle = this.element('readerFocusToggle');
      if (toggle) {
        toggle.setAttribute('aria-pressed', this.focused ? 'true' : 'false');
        toggle.textContent = this.focused ? '↩️ Sair do foco' : '🎯 Leitura focada';
      }
      this.applyPreferences();
    }

    isFocused() {
      return this.focused;
    }

    exitFocus() {
      if (!this.focused) return false;
      this.setFocused(false);
      return true;
    }

    captureSelection() {
      if (!this.document || !this.root || !this.textAvailable) return;
      const selection = this.document.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        this.selection = null;
        return;
      }
      const range = selection.getRangeAt(0);
      if (!this.root.contains(range.startContainer) || !this.root.contains(range.endContainer)) {
        this.selection = null;
        return;
      }
      const prefixRange = this.document.createRange();
      prefixRange.selectNodeContents(this.root);
      prefixRange.setEnd(range.startContainer, range.startOffset);
      const start = prefixRange.toString().length;
      const selectedText = range.toString();
      const end = start + selectedText.length;
      const allText = this.root.textContent || '';
      this.selection = {
        start: start,
        end: end,
        quote: allText.slice(start, end),
        prefix: allText.slice(Math.max(0, start - 80), start),
        suffix: allText.slice(end, end + 80)
      };
      if (selectedText.length > MAX_QUOTE_LENGTH) {
        this.setStatus('Seleção longa demais; use até 2.000 caracteres.', 'warn');
      } else {
        this.setStatus('Seleção pronta para destacar.', 'ok');
      }
    }

    readStore() {
      const raw = readJSON(STORAGE_KEY, { version: 1, documents: {} });
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { version: 1, documents: {} };
      if (!raw.documents || typeof raw.documents !== 'object' || Array.isArray(raw.documents)) raw.documents = {};
      return { version: 1, documents: raw.documents };
    }

    documentKey() {
      return String((this.item && (this.item.id || this.item.path)) || '').slice(0, 600);
    }

    getDocumentRecord(create) {
      const key = this.documentKey();
      if (!key || !this.item) return null;
      const store = this.readStore();
      let record = store.documents[key];
      const candidateSha256 = String(this.item.sourceSha256 || '').toLowerCase();
      const sourceSha256 = /^[0-9a-f]{64}$/.test(candidateSha256)
        ? candidateSha256
        : '';
      if (!sourceSha256) {
        if (create) this.setStatus('Destaques bloqueados: o documento não possui SHA-256 válido.', 'error');
        return null;
      }
      if (record && String(record.sourceSha256 || '').toLowerCase() !== sourceSha256) {
        if (!create) return null;
        const archiveKey = key + '::' + String(record.sourceSha256).slice(0, 12);
        if (!store.documents[archiveKey]) store.documents[archiveKey] = record;
        record = null;
      }
      if (!record && create) {
        record = {
          documentId: key,
          title: String(this.item.title || this.item.filename || '').slice(0, 500),
          path: String(this.item.path || '').slice(0, 1000),
          sourceSha256: sourceSha256,
          previewSha256: String((this.previewMetadata && this.previewMetadata.previewSha256) || '').slice(0, 64),
          renderer: String((this.previewMetadata && this.previewMetadata.renderer) || 'inline-safe-v1').slice(0, 100),
          highlights: [],
          updatedAt: new Date().toISOString()
        };
        store.documents[key] = record;
        if (!this.writeStore(store)) return null;
      }
      if (!record) return null;
      record.highlights = Array.isArray(record.highlights)
        ? record.highlights.map(function (highlight) {
          return sanitizeHighlight({ ...highlight, sourceSha256: sourceSha256 });
        }).filter(function (item) {
          return item.sourceSha256 === sourceSha256 && item.end > item.start && item.quote;
        })
        : [];
      return { store: store, key: key, record: record };
    }

    writeStore(store) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        return true;
      } catch (_) {
        this.setStatus('Armazenamento cheio: exporte os destaques antes de continuar.', 'error');
        return false;
      }
    }

    currentHighlights() {
      const payload = this.getDocumentRecord(false);
      return payload ? payload.record.highlights : [];
    }

    addHighlightFromSelection() {
      if (!this.textAvailable || !this.root) {
        this.setStatus('OCR necessário antes de destacar este documento.', 'warn');
        return;
      }
      this.captureSelection();
      const selection = this.selection;
      if (!selection || selection.end <= selection.start) {
        this.setStatus('Selecione primeiro um trecho dentro do documento.', 'warn');
        return;
      }
      if (selection.quote.length < 2 || selection.quote.length > MAX_QUOTE_LENGTH) {
        this.setStatus('O destaque deve ter entre 2 e 2.000 caracteres.', 'warn');
        return;
      }
      const payload = this.getDocumentRecord(true);
      if (!payload) return;
      if (payload.record.highlights.length >= MAX_HIGHLIGHTS_PER_DOCUMENT) {
        this.setStatus('Limite de 300 destaques atingido; exporte e organize antes de continuar.', 'warn');
        return;
      }
      const overlaps = payload.record.highlights.some(function (highlight) {
        return selection.start < highlight.end && selection.end > highlight.start;
      });
      if (overlaps) {
        this.setStatus('A seleção cruza um destaque existente. Escolha um trecho separado.', 'warn');
        return;
      }
      const colorSelect = this.element('readerHighlightColor');
      const now = new Date().toISOString();
      payload.record.highlights.push(sanitizeHighlight({
        id: makeId(),
        start: selection.start,
        end: selection.end,
        quote: selection.quote,
        prefix: selection.prefix,
        suffix: selection.suffix,
        color: colorSelect ? colorSelect.value : 'yellow',
        note: '',
        sourceSha256: payload.record.sourceSha256,
        createdAt: now,
        updatedAt: now
      }));
      payload.record.updatedAt = now;
      if (!this.writeStore(payload.store)) return;
      this.selection = null;
      const frameSelection = this.document.getSelection();
      if (frameSelection) frameSelection.removeAllRanges();
      this.renderDocumentAnnotations();
      this.renderHighlightPanel();
      this.setStatus('Destaque salvo localmente.', 'ok');
    }

    updateHighlightNote(id, note) {
      this.pendingNotes.set(id, String(note || '').slice(0, MAX_NOTE_LENGTH));
      if (this.noteTimers.has(id)) clearTimeout(this.noteTimers.get(id));
      const self = this;
      this.noteTimers.set(id, setTimeout(function () {
        self.flushHighlightNote(id);
      }, 500));
    }

    flushHighlightNote(id) {
      if (!this.pendingNotes.has(id)) return true;
      const payload = this.getDocumentRecord(false);
      if (!payload) return false;
      const highlight = payload.record.highlights.find(function (item) { return item.id === id; });
      if (!highlight) return false;
      const now = new Date().toISOString();
      highlight.note = this.pendingNotes.get(id);
      highlight.updatedAt = now;
      payload.record.updatedAt = now;
      if (!this.writeStore(payload.store)) return false;
      this.pendingNotes.delete(id);
      if (this.noteTimers.has(id)) clearTimeout(this.noteTimers.get(id));
      this.noteTimers.delete(id);
      this.setStatus('Nota do destaque salva.', 'ok');
      return true;
    }

    flushAllNotes() {
      let saved = true;
      Array.from(this.pendingNotes.keys()).forEach((id) => {
        if (!this.flushHighlightNote(id)) saved = false;
      });
      return saved;
    }

    removeHighlight(id) {
      const payload = this.getDocumentRecord(false);
      if (!payload) return;
      const highlight = payload.record.highlights.find(function (item) { return item.id === id; });
      if (!highlight) return;
      if (!confirm('Remover este destaque? O documento original não será alterado.')) return;
      payload.record.highlights = payload.record.highlights.filter(function (item) { return item.id !== id; });
      payload.record.updatedAt = new Date().toISOString();
      if (!this.writeStore(payload.store)) return;
      if (this.noteTimers.has(id)) clearTimeout(this.noteTimers.get(id));
      this.noteTimers.delete(id);
      this.pendingNotes.delete(id);
      this.renderDocumentAnnotations();
      this.renderHighlightPanel();
      this.setStatus('Destaque removido.', 'ok');
    }

    collectTextNodes(root) {
      if (!root || !this.document) return [];
      const nodeFilter = this.document.defaultView.NodeFilter;
      const walker = this.document.createTreeWalker(root, nodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue) return nodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent || parent.closest('script,style,noscript,textarea,input,button')) return nodeFilter.FILTER_REJECT;
          return nodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      let offset = 0;
      let node = walker.nextNode();
      while (node) {
        const length = node.nodeValue.length;
        nodes.push({ node: node, start: offset, end: offset + length });
        offset += length;
        node = walker.nextNode();
      }
      return nodes;
    }

    wrapTextRange(start, end, className, attributes) {
      if (!this.root || !this.document || end <= start) return;
      const nodes = this.collectTextNodes(this.root).filter(function (entry) {
        return entry.end > start && entry.start < end;
      }).reverse();
      const doc = this.document;
      nodes.forEach(function (entry) {
        const localStart = Math.max(0, start - entry.start);
        const localEnd = Math.min(entry.node.nodeValue.length, end - entry.start);
        if (localEnd <= localStart) return;
        const range = doc.createRange();
        range.setStart(entry.node, localStart);
        range.setEnd(entry.node, localEnd);
        const mark = doc.createElement('mark');
        mark.className = className;
        Object.entries(attributes || {}).forEach(function (pair) {
          mark.setAttribute(pair[0], String(pair[1]));
        });
        try {
          range.surroundContents(mark);
        } catch (_) {
          return;
        }
      });
    }

    unwrapRuntimeMarks() {
      if (!this.root) return;
      this.root.querySelectorAll('mark.reader-highlight,mark.reader-search-hit').forEach(function (mark) {
        const parent = mark.parentNode;
        if (!parent) return;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        mark.remove();
        parent.normalize();
      });
    }

    renderDocumentAnnotations() {
      if (!this.root || !this.document) return;
      const query = String((this.element('readerSearch') && this.element('readerSearch').value) || '').trim();
      this.unwrapRuntimeMarks();
      const highlights = this.currentHighlights().slice().sort(function (a, b) { return b.start - a.start; });
      const textLength = String(this.root.textContent || '').length;
      const self = this;
      highlights.forEach(function (highlight) {
        if (highlight.start < 0 || highlight.end > textLength || highlight.end <= highlight.start) return;
        const actual = String(self.root.textContent || '').slice(highlight.start, highlight.end);
        if (actual !== highlight.quote) return;
        self.wrapTextRange(highlight.start, highlight.end, 'reader-highlight', {
          'data-highlight-id': highlight.id,
          'data-color': highlight.color,
          title: highlight.note || 'Destaque salvo'
        });
      });
      if (query.length >= 2 && this.textAvailable) this.applySearchMarks(query);
    }

    runSearch(rawQuery) {
      const query = String(rawQuery || '').trim();
      this.searchIndex = -1;
      this.searchMatches = [];
      if (!this.root || !this.textAvailable || query.length < 2) {
        this.renderDocumentAnnotations();
        this.updateSearchStatus(query ? 'Digite ao menos 2 caracteres' : 'Busca limpa');
        return;
      }
      this.renderDocumentAnnotations();
      this.navigateSearch(1);
    }

    applySearchMarks(query) {
      const text = String(this.root.textContent || '');
      const haystack = text.toLocaleLowerCase('pt-BR');
      const needle = query.toLocaleLowerCase('pt-BR');
      const matches = [];
      let cursor = 0;
      while (matches.length < MAX_SEARCH_RESULTS) {
        const index = haystack.indexOf(needle, cursor);
        if (index < 0) break;
        matches.push({ start: index, end: index + needle.length, id: String(matches.length) });
        cursor = index + Math.max(needle.length, 1);
      }
      this.searchMatches = matches;
      const self = this;
      matches.slice().reverse().forEach(function (match) {
        self.wrapTextRange(match.start, match.end, 'reader-search-hit', { 'data-search-id': match.id });
      });
      this.updateSearchStatus(matches.length ? '0/' + matches.length : 'Nenhuma ocorrência');
    }

    navigateSearch(direction) {
      if (!this.searchMatches.length || !this.document) return;
      this.searchIndex = (this.searchIndex + direction + this.searchMatches.length) % this.searchMatches.length;
      this.document.querySelectorAll('mark.reader-search-hit').forEach(function (mark) {
        mark.removeAttribute('data-current');
      });
      const current = this.document.querySelector('mark.reader-search-hit[data-search-id="' + this.searchIndex + '"]');
      if (current) {
        current.setAttribute('data-current', 'true');
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.updateSearchStatus((this.searchIndex + 1) + '/' + this.searchMatches.length);
    }

    clearSearch(clearInput) {
      if (clearInput) {
        const input = this.element('readerSearch');
        if (input) input.value = '';
      }
      this.searchMatches = [];
      this.searchIndex = -1;
      this.renderDocumentAnnotations();
      this.updateSearchStatus('Busca limpa');
    }

    updateSearchStatus(message) {
      const status = this.element('readerSearchStatus');
      if (status) status.textContent = message;
    }

    focusHighlight(id) {
      if (!this.document) return;
      const target = Array.from(this.document.querySelectorAll('mark.reader-highlight')).find(function (mark) {
        return mark.getAttribute('data-highlight-id') === id;
      });
      if (!target) {
        this.setStatus('Destaque não localizado nesta versão da prévia.', 'warn');
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof target.animate === 'function') {
        target.animate(
          [{ outline: '4px solid #fff' }, { outline: '0 solid transparent' }],
          { duration: 900, easing: 'ease-out' }
        );
      }
    }

    renderHighlightPanel() {
      const list = this.element('readerHighlightsList');
      const count = this.element('readerHighlightCount');
      if (!list || !count) return;
      const highlights = this.currentHighlights();
      count.textContent = String(highlights.length);
      while (list.firstChild) list.removeChild(list.firstChild);
      if (!highlights.length) {
        const empty = document.createElement('p');
        empty.className = 'reader-highlights-empty';
        empty.textContent = 'Nenhum destaque neste documento.';
        list.appendChild(empty);
        this.updateExportControls();
        return;
      }
      const self = this;
      highlights.forEach(function (highlight, index) {
        const card = document.createElement('article');
        card.className = 'reader-highlight-card';
        card.style.setProperty('--highlight-color', COLOR_VALUES[highlight.color]);

        const quote = document.createElement('div');
        quote.className = 'reader-highlight-quote';
        quote.textContent = (index + 1) + '. “' + highlight.quote.replace(/\s+/g, ' ').trim() + '”';
        card.appendChild(quote);

        const label = document.createElement('label');
        label.textContent = 'Nota do destaque';
        const note = document.createElement('textarea');
        note.maxLength = MAX_NOTE_LENGTH;
        note.placeholder = 'Por que este trecho importa?';
        note.value = highlight.note;
        note.addEventListener('input', function () { self.updateHighlightNote(highlight.id, note.value); });
        label.appendChild(note);
        card.appendChild(label);

        const actions = document.createElement('div');
        actions.className = 'reader-highlight-actions';
        const go = document.createElement('button');
        go.className = 'btn btn-secondary';
        go.type = 'button';
        go.textContent = '🎯 Ir ao trecho';
        go.addEventListener('click', function () { self.focusHighlight(highlight.id); });
        const remove = document.createElement('button');
        remove.className = 'btn btn-delete';
        remove.type = 'button';
        remove.textContent = '🗑️ Remover';
        remove.addEventListener('click', function () { self.removeHighlight(highlight.id); });
        actions.appendChild(go);
        actions.appendChild(remove);
        card.appendChild(actions);
        list.appendChild(card);
      });
      this.updateExportControls();
    }

    updateExportControls() {
      const disabled = this.currentHighlights().length === 0;
      ['readerExport', 'readerExportMarkdown', 'readerExportJSON', 'readerExportHTML'].forEach(function (id) {
        const element = document.getElementById(id);
        if (element) element.disabled = disabled;
      });
    }

    exportPayload() {
      const payload = this.getDocumentRecord(false);
      if (!payload) return null;
      return {
        schema: 'antigravity-library-highlights-v1',
        exportedAt: new Date().toISOString(),
        document: {
          id: payload.record.documentId,
          title: payload.record.title,
          path: payload.record.path,
          sourceSha256: payload.record.sourceSha256,
          previewSha256: payload.record.previewSha256,
          renderer: payload.record.renderer
        },
        highlights: payload.record.highlights.map(sanitizeHighlight),
        preferences: sanitizePreferences(this.preferences)
      };
    }

    serializeHTML(payload) {
      const sections = payload.highlights.map(function (highlight, index) {
        return '<section><h2>Destaque ' + (index + 1) + '</h2><blockquote>' +
          escapeHTML(highlight.quote) + '</blockquote><p><strong>Nota:</strong> ' +
          escapeHTML(highlight.note || 'Sem nota.') + '</p></section>';
      }).join('');
      return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
        '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'">' +
        '<meta name="viewport" content="width=device-width"><title>Destaques</title><style>' +
        'body{max-width:820px;margin:auto;padding:2rem;font:17px/1.7 system-ui;color:#172033;background:#f8fafc}' +
        'section{border-top:1px solid #cbd5e1;padding:1rem 0}blockquote{border-left:5px solid #facc15;margin:1rem 0;padding:.6rem 1rem;background:#fff7cc}' +
        'code{overflow-wrap:anywhere}</style></head><body><h1>Destaques — ' +
        escapeHTML(payload.document.title) + '</h1><p><strong>Arquivo:</strong> ' +
        escapeHTML(payload.document.path) + '<br><strong>SHA-256:</strong> <code>' +
        escapeHTML(payload.document.sourceSha256) + '</code><br><strong>Exportado:</strong> ' +
        escapeHTML(payload.exportedAt) + '</p>' + sections + '</body></html>';
    }

    serializeMarkdown(payload) {
      const lines = [
        '# Destaques — ' + escapeMarkdown(payload.document.title),
        '',
        '- Documento: ' + escapeMarkdown(payload.document.path),
        '- SHA-256: ' + escapeMarkdown(payload.document.sourceSha256),
        '- Exportado em: ' + escapeMarkdown(payload.exportedAt),
        ''
      ];
      payload.highlights.forEach(function (highlight, index) {
        lines.push('## Destaque ' + (index + 1) + ' — ' + escapeMarkdown(highlight.color));
        lines.push('');
        String(highlight.quote || '').split('\n').forEach(function (line) {
          lines.push('> ' + escapeMarkdown(line));
        });
        lines.push('');
        lines.push('**Nota:** ' + escapeMarkdown(highlight.note || 'Sem nota.'));
        lines.push('');
      });
      return lines.join('\n');
    }

    exportHighlights(format) {
      if (!this.flushAllNotes()) {
        this.setStatus('Não foi possível salvar a nota pendente; libere espaço antes de exportar.', 'error');
        return;
      }
      const payload = this.exportPayload();
      if (!payload || !payload.highlights.length) {
        this.setStatus('Nenhum destaque para exportar.', 'warn');
        return;
      }
      const stem = 'destaques-' + safeFilename(payload.document.title);
      if (format === 'json') {
        downloadText(stem + '.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      } else if (format === 'html') {
        downloadText(stem + '.html', this.serializeHTML(payload), 'text/html;charset=utf-8');
      } else {
        downloadText(stem + '.md', this.serializeMarkdown(payload), 'text/markdown;charset=utf-8');
      }
      this.setStatus('Destaques exportados em ' + String(format || 'markdown').toUpperCase() + '.', 'ok');
    }

    setStatus(message, state) {
      const status = this.element('readerStatus');
      if (!status) return;
      status.textContent = message;
      status.setAttribute('data-state', state || '');
    }

    handleStorage(event) {
      if (event.key === PREFERENCES_KEY) {
        this.preferences = sanitizePreferences(readJSON(PREFERENCES_KEY, {}));
        this.renderPreferences();
        this.applyPreferences();
      }
      if (event.key === STORAGE_KEY && this.item) {
        this.renderDocumentAnnotations();
        this.renderHighlightPanel();
        this.setStatus('Destaques atualizados por outra aba.', 'ok');
      }
    }

    closeDocument() {
      if (!this.flushAllNotes()) {
        this.setStatus('Nota pendente não salva; exporte ou libere espaço antes de fechar.', 'error');
        return false;
      }
      if (this.frame && this.frameLoadHandler) {
        this.frame.removeEventListener('load', this.frameLoadHandler);
      }
      this.frameLoadHandler = null;
      this.noteTimers.forEach(function (timer) { clearTimeout(timer); });
      this.noteTimers.clear();
      this.pendingNotes.clear();
      this.setFocused(false);
      this.item = null;
      this.previewMetadata = null;
      this.document = null;
      this.root = null;
      this.selection = null;
      this.searchMatches = [];
      this.searchIndex = -1;
      this.textAvailable = false;
      this.renderHighlightPanel();
      this.disable('Abra um documento para iniciar a leitura focada.');
      return true;
    }
  }

  window.LibraryFocusedReader = {
    create: function (options) {
      return new FocusedReader(options);
    }
  };
}());
