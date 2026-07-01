import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const [, , inputPath] = process.argv;
const schemaVersion = 'isa.video-evidence.v1';

if (!inputPath) {
  console.error('Uso: node scripts/validate-video-evidence.mjs <video-evidence.json>');
  process.exit(1);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function requireString(value, path, errors) {
  if (!nonEmptyString(value)) errors.push(`${path} precisa ser texto preenchido.`);
}

function validateRecommendedSource(source, path, errors) {
  if (!isPlainObject(source)) {
    errors.push(`${path} precisa ser objeto.`);
    return;
  }
  requireString(source.name, `${path}.name`, errors);
  requireString(source.status, `${path}.status`, errors);
}

function validateMetricTarget(target, path, errors, options = {}) {
  if (!isPlainObject(target)) {
    errors.push(`${path} precisa ser objeto.`);
    return;
  }
  requireString(target.metric, `${path}.metric`, errors);
  requireString(target.signal, `${path}.signal`, errors);
  requireString(target.manualCheck, `${path}.manualCheck`, errors);
  if (!Array.isArray(target.joints) || !target.joints.length) {
    errors.push(`${path}.joints precisa ser uma lista preenchida.`);
  }
  if (target.recommendedSource) {
    validateRecommendedSource(target.recommendedSource, `${path}.recommendedSource`, errors);
  } else if (options.requireRecommendedSource) {
    errors.push(`${path}.recommendedSource e obrigatorio para evidencia de IA/pose.`);
  }
}

function validateEvidence(item, index, rootSource, errors, warnings) {
  const path = `evidence[${index}]`;
  if (!isPlainObject(item)) {
    errors.push(`${path} precisa ser objeto.`);
    return;
  }

  for (const field of ['id', 'fundamental', 'phase', 'athlete', 'timeRange', 'marker', 'metric', 'value', 'status', 'reportUse', 'nextAction']) {
    requireString(item[field], `${path}.${field}`, errors);
  }

  const confidence = Number(item.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    errors.push(`${path}.confidence precisa ser numero entre 0 e 1.`);
  }

  const source = String(item.source || rootSource || '').toLowerCase();
  const isAi = source.includes('mediapipe') || source.includes('sports2d') || source.includes('ia');
  const targets = Array.isArray(item.metricTargets) ? item.metricTargets : [];

  if (targets.length) {
    targets.forEach((target, targetIndex) => validateMetricTarget(target, `${path}.metricTargets[${targetIndex}]`, errors, { requireRecommendedSource: isAi }));
  } else if (isAi) {
    warnings.push(`${path} vem de IA/pose e ainda nao tem metricTargets.`);
  }

  if (isAi && item.status === 'Pronta para relatorio') {
    warnings.push(`${path} veio de IA e esta pronta para relatorio sem confirmacao manual explicita.`);
  }
}

const resolvedInput = resolve(inputPath);
let payload;

try {
  payload = JSON.parse(readFileSync(resolvedInput, 'utf8').replace(/^\uFEFF/, ''));
} catch (error) {
  console.error(`Nao consegui ler JSON valido em ${resolvedInput}: ${error.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

if (!isPlainObject(payload)) {
  errors.push('O arquivo precisa conter um objeto JSON na raiz.');
} else {
  if (payload.schemaVersion !== schemaVersion) {
    errors.push(`schemaVersion precisa ser ${schemaVersion}.`);
  }

  requireString(payload.source, 'source', errors);
  if (!isPlainObject(payload.clip)) {
    errors.push('clip precisa ser objeto.');
  } else {
    requireString(payload.clip.id, 'clip.id', errors);
    requireString(payload.clip.title, 'clip.title', errors);
    requireString(payload.clip.athlete, 'clip.athlete', errors);
    requireString(payload.clip.fundamental, 'clip.fundamental', errors);
  }

  if (!Array.isArray(payload.evidence) || !payload.evidence.length) {
    errors.push('evidence precisa ser uma lista preenchida.');
  } else {
    payload.evidence.forEach((item, index) => validateEvidence(item, index, payload.source, errors, warnings));
  }
}

if (errors.length) {
  console.error(`Evidencia de video invalida (${basename(resolvedInput)}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const evidence = payload.evidence || [];
const withMetricTargets = evidence.filter((item) => item.metricTargets?.length).length;
const withRecommendedSource = evidence.filter((item) => item.metricTargets?.some((target) => target.recommendedSource?.name)).length;
const needsReview = evidence.filter((item) => ['Revisar', 'IA sugerida'].includes(item.status)).length;

process.stdout.write(`${JSON.stringify({
  status: warnings.length ? 'ok-with-warnings' : 'ok',
  file: basename(resolvedInput),
  schemaVersion: payload.schemaVersion,
  source: payload.source,
  evidence: evidence.length,
  withMetricTargets,
  withRecommendedSource,
  needsReview,
  warnings,
}, null, 2)}\n`);
