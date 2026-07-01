import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8').replace(/^\uFEFF/, ''));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sourceKey(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('mediapipe')) return 'mediapipe';
  if (text.includes('sports2d')) return 'sports2d';
  if (text.includes('vert tracker')) return 'vert-tracker';
  if (text.includes('openvolley') || text.includes('ovml')) return 'openvolley-ovml';
  if (text.includes('volleyball analytics')) return 'volleyball-analytics';
  if (text.includes('volleystat')) return 'volleystat';
  if (text.includes('pose2sim')) return 'pose2sim';
  if (text.includes('jumpshot') || text.includes('basquete')) return 'jumpshot';
  return text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function modeRank(source) {
  const order = {
    'browser-sdk': 5,
    'external-cli': 4,
    'reference-later': 2,
    'concept-reference': 1,
    'defer-3d': 0,
  };
  return order[source?.integrationMode] ?? -1;
}

function isPilotMode(source) {
  return ['browser-sdk', 'external-cli'].includes(source?.integrationMode);
}

function routeForMetric(metric, sourceByKey, candidateName) {
  const sourceNames = Array.isArray(metric.sources) ? metric.sources : [];
  const availableSources = sourceNames
    .map((name) => sourceByKey.get(sourceKey(name)))
    .filter(Boolean);
  const candidate = sourceByKey.get(sourceKey(candidateName));
  const selected = availableSources.some((source) => source.name === candidate?.name)
    ? candidate
    : [...availableSources].sort((a, b) => modeRank(b) - modeRank(a) || a.name.localeCompare(b.name))[0];

  return {
    fundamental: metric.fundamental,
    phase: metric.phase,
    metric: metric.metric,
    signal: metric.signal,
    candidateCompatible: Boolean(selected && candidate && selected.name === candidate.name),
    selectedSource: selected ? {
      name: selected.name,
      integrationMode: selected.integrationMode,
      license: selected.license,
      cloneDecision: selected.cloneDecision,
      status: isPilotMode(selected) ? 'pilot-with-manual-review' : 'reference-only',
      nextAction: selected.nextAction,
    } : {
      name: '',
      integrationMode: '',
      license: '',
      cloneDecision: '',
      status: 'missing-source',
      nextAction: 'Adicionar fonte compativel na auditoria antes de rodar este marcador.',
    },
    alternatives: availableSources
      .filter((source) => source.name !== selected?.name)
      .map((source) => ({
        name: source.name,
        integrationMode: source.integrationMode,
        license: source.license,
        status: isPilotMode(source) ? 'pilot-alternative' : 'reference-only',
      })),
  };
}

const movementMapPath = argValue('--movement-map', 'reference/video-ai-movement-metric-map.json');
const sourceAuditPath = argValue('--sources', 'reference/video-ai-source-audit.json');
const candidateName = argValue('--candidate', 'Sports2D');

const movementMap = readJson(movementMapPath);
const sourceAudit = readJson(sourceAuditPath);

assert(movementMap.schemaVersion === 'isa.video-movement-metric-map.v1', 'Mapa de metricas precisa usar isa.video-movement-metric-map.v1.');
assert(sourceAudit.schemaVersion === 'isa.video-ai-source-audit.v1', 'Auditoria de fontes precisa usar isa.video-ai-source-audit.v1.');
assert(Array.isArray(movementMap.metrics) && movementMap.metrics.length, 'Mapa de metricas precisa ter metrics.');
assert(Array.isArray(sourceAudit.sources) && sourceAudit.sources.length, 'Auditoria precisa ter sources.');

const sourceByKey = new Map(sourceAudit.sources.map((source) => [sourceKey(source.name), source]));
const routes = movementMap.metrics.map((metric) => routeForMetric(metric, sourceByKey, candidateName));
const missingRoutes = routes.filter((route) => route.selectedSource.status === 'missing-source');
const referenceOnlyRoutes = routes.filter((route) => route.selectedSource.status === 'reference-only');
const pilotRoutes = routes.filter((route) => route.selectedSource.status === 'pilot-with-manual-review');

process.stdout.write(`${JSON.stringify({
  status: missingRoutes.length ? 'needs-source' : 'ok',
  schemaVersion: 'isa.video-ai-source-route.v1',
  candidate: candidateName,
  metrics: routes.length,
  pilotRoutes: pilotRoutes.length,
  referenceOnlyRoutes: referenceOnlyRoutes.length,
  missingRoutes: missingRoutes.length,
  rule: 'Preferir o candidato escolhido quando ele cobre a metrica; caso contrario, escolher a fonte com modo de integracao mais proximo do MVP.',
  routes,
}, null, 2)}\n`);

if (missingRoutes.length) process.exitCode = 1;
