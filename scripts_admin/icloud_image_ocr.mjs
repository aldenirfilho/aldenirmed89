#!/usr/bin/env node
/** OCR local Tesseract.js: JSONL simples ou lote com workers persistentes.
 * Runtime npm e cache privados fora do repo. Nenhuma requisição de rede.
 * modifiedNs mantém os dígitos exatos: timestamps ns excedem Number seguro.
 * Requisitos (fora do repo): npm install --ignore-scripts --no-audit --no-fund
 *   --prefix RUNTIME tesseract.js@6 image-size@2
 * Lote: node scripts_admin/icloud_image_ocr.mjs --runtime RUNTIME --source FONTE
 *   --inventory INVENTARIO.json --output CACHE.jsonl --workers 4 --timeout 30
 * --runtime ou ICLOUD_OCR_RUNTIME obrigatório. Consulte --help.
 * Helper Swift/Python é alternativa opcional: Vision compilou, mas expirou na
 * homologação deste ambiente; use o engine WASM validado para o lote.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { isMainThread } from 'node:worker_threads';

const FILE = fileURLToPath(import.meta.url);
const REPO = path.dirname(path.dirname(FILE));
const SCHEMA = 'icloud-image-ocr-v1';
const MAX_BYTES = 64 * 1024 * 1024;
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif']);
const HELP = `OCR local, sem rede, sem modificar imagens.
Requisitos: Node.js e runtime privado fora do repositório:
  npm install --ignore-scripts --no-audit --no-fund --prefix RUNTIME tesseract.js@6 image-size@2
Lote com workers persistentes e retomada automática:
  node scripts_admin/icloud_image_ocr.mjs --runtime RUNTIME --source FONTE --inventory INVENTARIO.json --output CACHE.jsonl --workers 4 --timeout 30
JSONL {id,path} stdin -> {id,ok,lines,...} stdout:
  node scripts_admin/icloud_image_ocr.mjs --runtime RUNTIME
Alternativa de --runtime: variável ICLOUD_OCR_RUNTIME.
Opções de lote: --limit N --skip-dataless --retry-errors --resume
  --progress-every N --stop-after-failures N --fail-on-errors --psm N --top-fraction F
--psm 3 (padrão): página automática; --psm 11: texto esparso em slides.
--top-fraction 0.45 analisa só o topo para triagem; padrão 1 (imagem inteira).
Coordenadas continuam normalizadas sobre a imagem inteira. Use outro arquivo
de cache ao mudar PSM/região, pois a identidade permanece path+size+mtime ns.
O cache privado precisa ficar fora da fonte e do repo; nunca versionar OCR.
--skip-dataless usa o inventário; a fonte pode ser hidratada pelo iCloud ao ler.
Swift/Apple Vision é opcional e não foi homologado neste ambiente (timeout).
`;

// Aplica-se também ao bootstrap dos worker_threads antes de carregar Tesseract.
function blockNetwork() {
  const require = createRequire(import.meta.url);
  const denied = () => { throw new Error('network-disabled-local-ocr'); };
  globalThis.fetch = denied;
  for (const name of ['node:http', 'node:https']) {
    const module = require(name);
    module.request = denied;
    module.get = denied;
  }
  const net = require('node:net');
  net.connect = denied;
  net.createConnection = denied;
  net.Socket.prototype.connect = denied;
  require('node:tls').connect = denied;
}
blockNetwork();

export function parseMetadataJSON(text) {
  // Somente esta chave é promovida para string; nenhum arredondamento numérico.
  return JSON.parse(text.replace(/("modifiedNs"\s*:\s*)(\d+)(?=\s*[,}])/g, '$1"$2"'));
}
export function stringifyRecord(row) {
  return JSON.stringify(row).replace(/("modifiedNs":)"(\d+)"/g, '$1$2');
}
export function safeRelativePath(value) {
  if (typeof value !== 'string' || !value || /[\\\x00-\x1f]/u.test(value) ||
      value.startsWith('/') || /^[a-zA-Z]:\//u.test(value) ||
      value.split('/').some(part => ['', '.', '..'].includes(part))) {
    throw new Error('unsafe-relative-path');
  }
  return value.normalize('NFC');
}
export function fingerprint(relativePath, size, modifiedNs) {
  const material = `[${JSON.stringify(relativePath.normalize('NFC'))},${size},${modifiedNs}]`;
  return crypto.createHash('sha256').update(material, 'utf8').digest('hex');
}
function inside(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
function canonicalProspective(file) {
  if (fs.existsSync(file)) return fs.realpathSync(file);
  return path.join(canonicalProspective(path.dirname(file)), path.basename(file));
}
export function privateOutput(output, source, inventory) {
  output = path.resolve(output);
  const existing = fs.lstatSync(output, { throwIfNoEntry: false });
  if (existing && (existing.isSymbolicLink() || !existing.isFile())) {
    throw new Error('unsafe-cache-target');
  }
  const resolved = canonicalProspective(output);
  if (inside(source, resolved) || inside(fs.realpathSync(REPO), resolved) ||
      (inventory && resolved === fs.realpathSync(inventory))) throw new Error('cache-must-be-private');
  return resolved;
}
export function normalizedLines(data, width, height) {
  const result = [];
  const clamp = number => Math.min(1, Math.max(0, number));
  if (!(width > 0 && height > 0)) return result;
  for (const block of data.blocks || []) {
    for (const paragraph of block.paragraphs || []) {
      for (const line of paragraph.lines || []) {
        const text = String(line.text || '').trim().slice(0, 2000);
        const b = line.bbox;
        if (!text || !b || ![b.x0, b.y0, b.x1, b.y1, line.confidence].every(Number.isFinite)) continue;
        result.push({ text, confidence: clamp(line.confidence / 100),
          x: clamp(b.x0 / width), y: clamp(1 - b.y1 / height),
          width: clamp((b.x1 - b.x0) / width), height: clamp((b.y1 - b.y0) / height) });
        if (result.length === 1500) return result;
      }
    }
  }
  return result;
}
function checkImage(source, row) {
  let file = source;
  let info;
  for (const component of safeRelativePath(row.relativePath).split('/')) {
    file = path.join(file, component);
    info = fs.lstatSync(file, { bigint: true });
    if (info.isSymbolicLink()) throw new Error('symlink-blocked');
  }
  if (!info.isFile()) throw new Error('not-a-regular-file');
  if (String(info.size) !== String(row.size) || String(info.mtimeNs) !== String(row.modifiedNs)) {
    throw new Error('source-metadata-changed');
  }
  if (info.size > BigInt(MAX_BYTES)) throw new Error('image-above-64mb');
  return file;
}
function readRows(inventory) {
  const payload = parseMetadataJSON(fs.readFileSync(inventory, 'utf8'));
  if (!Array.isArray(payload.images)) throw new Error('invalid-inventory');
  const unique = new Map();
  for (const raw of payload.images) {
    const relativePath = safeRelativePath(raw.relativePath);
    const size = raw.size;
    const modifiedNs = String(raw.modifiedNs);
    if (!RASTER.has(path.extname(relativePath).toLowerCase()) || !Number.isSafeInteger(size) ||
        size < 1 || !/^\d+$/u.test(modifiedNs)) throw new Error('invalid-image-metadata');
    const id = fingerprint(relativePath, size, modifiedNs);
    unique.set(id, { id, relativePath, size, modifiedNs, dataless: raw.dataless === true });
  }
  return [...unique.values()];
}
function loadCache(output) {
  const rows = new Map();
  let malformed = 0;
  if (!fs.existsSync(output)) return { rows, malformed };
  for (const line of fs.readFileSync(output, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const row = parseMetadataJSON(line);
      if (row.schema !== SCHEMA || typeof row.ok !== 'boolean' ||
          row.id !== fingerprint(row.relativePath, row.size, row.modifiedNs)) throw new Error('invalid-cache');
      rows.set(row.id, row);
    } catch { malformed += 1; }
  }
  return { rows, malformed };
}
function argsFrom(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (!name.startsWith('--')) throw new Error('invalid-argument');
    if (['--retry-errors', '--skip-dataless', '--fail-on-errors', '--resume'].includes(name)) result[name.slice(2)] = true;
    else {
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error('missing-argument-value');
      result[name.slice(2)] = argv[++i];
    }
  }
  return result;
}
function runtimeRequire(runtime) {
  return createRequire(path.join(path.resolve(runtime), 'package.json'));
}
function resolveRuntime(options = {}) {
  const runtime = options.runtime || process.env.ICLOUD_OCR_RUNTIME;
  if (!runtime) throw new Error('runtime-required');
  return path.resolve(runtime);
}
async function createLocalWorker(runtime, psm = 3) {
  const require = runtimeRequire(runtime);
  const { createWorker } = require('tesseract.js');
  const langPath = path.join(REPO, '05_Midia_E_Feed/assets/vendor/tesseract/lang');
  for (const lang of ['por', 'eng']) fs.accessSync(path.join(langPath, `${lang}.traineddata.gz`));
  // Node usa o core WASM instalado localmente; o adaptador Node ignora corePath.
  const promise = createWorker('por+eng', 1, {
    workerPath: FILE, langPath, gzip: true, cacheMethod: 'none',
    logger: () => {}, errorHandler: () => {},
  });
  let timer;
  try {
    const worker = await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('worker-initialization-timeout')), 30000);
    })]);
    await worker.setParameters({ tessedit_pageseg_mode: String(psm) });
    return worker;
  } finally { clearTimeout(timer); }
}
async function perform(worker, file, require, timeout, dedup, topFraction = 1) {
  const controller = new AbortController();
  let timer;
  const operation = (async () => {
    const bytes = await fs.promises.readFile(file, { signal: controller.signal });
    if (bytes.length > MAX_BYTES) throw new Error('image-above-64mb');
    const dimensions = require('image-size').imageSize(bytes);
    if (!(dimensions.width > 0 && dimensions.height > 0) || dimensions.width * dimensions.height > 80_000_000) {
      throw new Error('invalid-or-excessive-image-dimensions');
    }
    const digest = dedup && crypto.createHash('sha256').update(bytes).digest('hex');
    if (dedup?.has(digest)) return await dedup.get(digest);
    const recognizeOptions = topFraction < 1 ? { rectangle: { left: 0, top: 0,
      width: dimensions.width, height: Math.max(1, Math.ceil(dimensions.height * topFraction)) } } : {};
    const recognized = worker.recognize(bytes, recognizeOptions, { text: true, blocks: true })
      .then(({ data }) => normalizedLines(data, dimensions.width, dimensions.height));
    if (dedup) dedup.set(digest, recognized);
    try { return await recognized; }
    catch (error) { dedup?.delete(digest); throw error; }
  })();
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('timeout')); }, timeout * 1000);
    })]);
  } finally { clearTimeout(timer); }
}
function errorCode(error) {
  // Não transportar paths, OCR, trechos de buffers ou mensagens de bibliotecas.
  const allowed = new Set(['timeout', 'symlink-blocked', 'source-metadata-changed', 'not-a-regular-file',
    'image-above-64mb', 'invalid-or-excessive-image-dimensions', 'unsafe-relative-path', 'invalid-request',
    'worker-initialization-timeout', 'network-disabled-local-ocr', 'runtime-required']);
  return allowed.has(error.message) ? error.message : 'local-ocr-failed';
}
async function helper(options) {
  const runtime = resolveRuntime(options);
  // A variável é herdada pelos worker_threads para o bootstrap offline.
  process.env.ICLOUD_OCR_RUNTIME = runtime;
  const require = runtimeRequire(runtime);
  const psm = Number(options.psm || 3);
  if (!Number.isInteger(psm) || psm < 0 || psm > 13) throw new Error('invalid-psm');
  const topFraction = Number(options['top-fraction'] || 1);
  if (!Number.isFinite(topFraction) || topFraction <= 0 || topFraction > 1) throw new Error('invalid-top-fraction');
  let worker = await createLocalWorker(runtime, psm);
  const timeout = Number(options.timeout || 30);
  for await (const line of readline.createInterface({ input: process.stdin, crlfDelay: Infinity })) {
    let request, result;
    const started = Date.now();
    try {
      request = JSON.parse(line);
      if (typeof request.id !== 'string' || !request.id || typeof request.path !== 'string' ||
          !path.isAbsolute(request.path)) throw new Error('invalid-request');
      const info = fs.lstatSync(request.path, { bigint: true });
      if (!info.isFile() || info.isSymbolicLink()) throw new Error('symlink-blocked');
      if (info.size > BigInt(MAX_BYTES)) throw new Error('image-above-64mb');
      result = { id: request.id, ok: true, lines: await perform(worker, request.path, require, timeout, undefined, topFraction) };
    } catch (error) {
      result = { id: request?.id || '', ok: false, lines: [], error: errorCode(error) };
      if (error.message === 'timeout') { await worker.terminate(); worker = await createLocalWorker(runtime, psm); }
    }
    process.stdout.write(JSON.stringify({ ...result, engine: 'tesseract-local-wasm', languages: ['por', 'eng'],
      revision: 6, durationMs: Date.now() - started }) + '\n');
  }
  await worker.terminate();
  return 0;
}
async function batch(options) {
  for (const key of ['source', 'inventory', 'output']) if (!options[key]) throw new Error(`missing-${key}`);
  const sourceInput = path.resolve(options.source);
  if (fs.lstatSync(sourceInput).isSymbolicLink() || !fs.statSync(sourceInput).isDirectory()) throw new Error('invalid-source');
  const source = fs.realpathSync(sourceInput);
  const output = privateOutput(options.output, source, options.inventory);
  const runtime = resolveRuntime(options);
  process.env.ICLOUD_OCR_RUNTIME = runtime;
  const require = runtimeRequire(runtime);
  const workers = Number(options.workers || 4);
  const timeout = Number(options.timeout || 30);
  const every = Number(options['progress-every'] || 25);
  const psm = Number(options.psm || 3);
  if (!Number.isInteger(psm) || psm < 0 || psm > 13) throw new Error('invalid-psm');
  const topFraction = Number(options['top-fraction'] || 1);
  if (!Number.isFinite(topFraction) || topFraction <= 0 || topFraction > 1) throw new Error('invalid-top-fraction');
  if (!Number.isInteger(workers) || workers < 1 || workers > 8 || !Number.isFinite(timeout) || timeout <= 0) {
    throw new Error('invalid-workers-or-timeout');
  }
  let rows = readRows(options.inventory);
  if (options['skip-dataless']) rows = rows.filter(row => !row.dataless);
  if (options.limit) {
    const limit = Number(options.limit);
    if (!Number.isInteger(limit) || limit < 1) throw new Error('invalid-limit');
    rows = rows.slice(0, limit);
  }
  const cache = loadCache(output);
  const pending = rows.filter(row => !cache.rows.has(row.id) ||
    (options['retry-errors'] && !cache.rows.get(row.id).ok));
  const started = Date.now();
  const summary = { event: 'start', engine: 'tesseract-local-wasm', total: rows.length,
    cached: rows.length - pending.length, scheduled: pending.length, workers,
    processed: 0, success: 0, failed: 0, emptyText: 0, consecutiveFailures: 0, psm, topFraction,
    malformedCacheLines: cache.malformed, textPrinted: false, originalsModified: false, networkEnabled: false };
  const report = event => process.stdout.write(JSON.stringify({ ...summary, event,
    elapsedSeconds: Math.round((Date.now() - started) / 100) / 10 }) + '\n');
  report('start');
  fs.mkdirSync(path.dirname(output), { recursive: true, mode: 0o700 });
  const descriptor = fs.openSync(output, 'a', 0o600);
  if (fs.fstatSync(descriptor).size > 0) {
    const tail = fs.openSync(output, 'r');
    const byte = Buffer.alloc(1);
    fs.readSync(tail, byte, 0, 1, fs.fstatSync(tail).size - 1);
    fs.closeSync(tail);
    if (byte[0] !== 10) fs.writeSync(descriptor, '\n');
  }
  let next = 0;
  let stop = false;
  let failureStop = false;
  let signalStop = false;
  const requestStop = () => {
    if (signalStop) return;
    signalStop = true;
    stop = true;
    report('stopping');
  };
  process.on('SIGTERM', requestStop);
  process.on('SIGINT', requestStop);
  const pool = [];
  const dedup = new Map();
  try {
    await Promise.all(Array.from({ length: Math.min(workers, pending.length) }, async () => {
      let worker = await createLocalWorker(runtime, psm);
      pool.push(worker);
      try {
        while (next < pending.length && !stop) {
          const row = pending[next++];
          const imageStarted = Date.now();
          let result = { schema: SCHEMA, id: row.id, relativePath: row.relativePath,
            size: row.size, modifiedNs: row.modifiedNs, processedAt: new Date().toISOString(),
            engine: 'tesseract-local-wasm', revision: 6, languages: ['por', 'eng'], psm, topFraction, ok: false, lines: [] };
          let mustReplace = false;
          try {
            const file = checkImage(source, row);
            result.lines = await perform(worker, file, require, timeout, dedup, topFraction);
            result.ok = true;
          } catch (error) {
            result.error = errorCode(error);
            mustReplace = error.message === 'timeout';
          }
          result.durationMs = Date.now() - imageStarted;
          fs.writeSync(descriptor, stringifyRecord(result) + '\n');
          cache.rows.set(result.id, result);
          summary.processed += 1;
          summary[result.ok ? 'success' : 'failed'] += 1;
          if (result.ok && result.lines.length === 0) summary.emptyText += 1;
          summary.consecutiveFailures = result.ok ? 0 : summary.consecutiveFailures + 1;
          if (options['stop-after-failures'] && summary.consecutiveFailures >= Number(options['stop-after-failures'])) {
            stop = true;
            failureStop = true;
          }
          if (summary.processed % Math.max(1, every) === 0 || stop) report('progress');
          if (mustReplace) {
            await worker.terminate();
            if (!stop && next < pending.length) { worker = await createLocalWorker(runtime, psm); pool.push(worker); }
          }
        }
      } finally { await worker.terminate(); }
    }));
  } finally {
    fs.closeSync(descriptor);
    await Promise.allSettled(pool.map(worker => worker.terminate()));
    process.removeListener('SIGTERM', requestStop);
    process.removeListener('SIGINT', requestStop);
  }
  summary.totalSuccess = rows.filter(row => cache.rows.get(row.id)?.ok).length;
  summary.totalFailed = rows.filter(row => cache.rows.has(row.id) && !cache.rows.get(row.id).ok).length;
  summary.remaining = rows.filter(row => !cache.rows.has(row.id)).length;
  summary.stoppedAfterFailures = failureStop;
  summary.stoppedBySignal = signalStop;
  report('done');
  return options['fail-on-errors'] && (summary.totalFailed || summary.remaining) ? 1 : 0;
}

if (!isMainThread) {
  const require = runtimeRequire(resolveRuntime());
  const entry = path.join(path.dirname(require.resolve('tesseract.js')), 'worker-script/node/index.js');
  require(entry);
} else if (process.argv[1] && fs.realpathSync(process.argv[1]) === FILE) {
  try {
    if (process.argv.includes('--help')) process.stdout.write(HELP);
    else {
      const options = argsFrom(process.argv.slice(2));
      process.exitCode = options.inventory ? await batch(options) : await helper(options);
    }
  } catch (error) {
    process.stderr.write(JSON.stringify({ event: 'error', error: errorCode(error), textPrinted: false }) + '\n');
    process.exitCode = 2;
  }
  // Cancela handles de leitura do iCloud que tenham excedido o timeout.
  process.exit(process.exitCode || 0);
}
