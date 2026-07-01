import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const [, , inputPath] = process.argv;
const schemaVersion = 'isa.video-calibration-dataset.v1';

if (!inputPath) {
  console.error('Uso: node scripts/validate-video-calibration-dataset.mjs <calibration-dataset.json>');
  process.exit(1);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function arrayAt(dataset, key, errors) {
  if (!Array.isArray(dataset[key])) {
    errors.push(`${key} precisa ser uma lista.`);
    return [];
  }
  return dataset[key];
}

function requireString(value, path, errors) {
  if (!nonEmptyString(value)) {
    errors.push(`${path} precisa ser texto preenchido.`);
  }
}

function requireObject(value, path, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${path} precisa ser objeto.`);
    return {};
  }
  return value;
}

function validatePair(pair, index, errors) {
  const path = `pairs[${index}]`;
  if (!isPlainObject(pair)) {
    errors.push(`${path} precisa ser objeto.`);
    return;
  }

  requireString(pair.id, `${path}.id`, errors);
  requireString(pair.fundamental, `${path}.fundamental`, errors);
  requireString(pair.phase, `${path}.phase`, errors);
  requireString(pair.marker, `${path}.marker`, errors);
  requireString(pair.alignment, `${path}.alignment`, errors);

  const ai = requireObject(pair.ai, `${path}.ai`, errors);
  requireString(ai.source, `${path}.ai.source`, errors);
  requireString(ai.metric, `${path}.ai.metric`, errors);
  requireString(ai.value, `${path}.ai.value`, errors);

  if (pair.paired === true) {
    const manual = requireObject(pair.manual, `${path}.manual`, errors);
    requireString(manual.calibrationOf, `${path}.manual.calibrationOf`, errors);
    if (nonEmptyString(pair.id) && nonEmptyString(manual.calibrationOf) && manual.calibrationOf !== pair.id) {
      errors.push(`${path}.manual.calibrationOf precisa apontar para ${path}.id.`);
    }
  }
}

function validatePhaseReadiness(item, index, errors) {
  const path = `phaseReadiness[${index}]`;
  if (!isPlainObject(item)) {
    errors.push(`${path} precisa ser objeto.`);
    return;
  }

  requireString(item.fundamental, `${path}.fundamental`, errors);
  requireString(item.phase, `${path}.phase`, errors);
  requireString(item.status, `${path}.status`, errors);
}

function validateSourceReadiness(item, index, errors) {
  const path = `sourceReadiness[${index}]`;
  if (!isPlainObject(item)) {
    errors.push(`${path} precisa ser objeto.`);
    return;
  }

  requireString(item.source, `${path}.source`, errors);
  requireString(item.status, `${path}.status`, errors);
}

const resolvedInput = resolve(inputPath);
let dataset;

try {
  dataset = JSON.parse(readFileSync(resolvedInput, 'utf8'));
} catch (error) {
  console.error(`Nao consegui ler JSON valido em ${resolvedInput}: ${error.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

if (!isPlainObject(dataset)) {
  errors.push('O arquivo precisa conter um objeto JSON na raiz.');
} else {
  if (dataset.schemaVersion !== schemaVersion) {
    errors.push(`schemaVersion precisa ser ${schemaVersion}.`);
  }

  requireObject(dataset.summary, 'summary', errors);
  const readiness = arrayAt(dataset, 'readiness', errors);
  const phaseReadiness = arrayAt(dataset, 'phaseReadiness', errors);
  const sourceReadiness = Array.isArray(dataset.sourceReadiness) ? dataset.sourceReadiness : [];
  const validationClips = arrayAt(dataset, 'validationClips', errors);
  const pairs = arrayAt(dataset, 'pairs', errors);

  pairs.forEach((pair, index) => validatePair(pair, index, errors));
  phaseReadiness.forEach((item, index) => validatePhaseReadiness(item, index, errors));
  sourceReadiness.forEach((item, index) => validateSourceReadiness(item, index, errors));

  const pairedPairs = pairs.filter((pair) => pair?.paired === true).length;
  const phasesWithEvidence = phaseReadiness.filter((item) => (item?.aiCount || item?.checkedCount || 0) > 0).length;

  if (!pairs.length) warnings.push('Dataset valido, mas ainda sem pares IA x manual.');
  if (!pairedPairs) warnings.push('Dataset valido, mas ainda sem checagem manual pareada por calibrationOf.');
  if (!phasesWithEvidence) warnings.push('Dataset valido, mas sem prontidao por fase com evidencia.');

  if (!errors.length) {
    process.stdout.write(`${JSON.stringify({
      status: 'ok',
      file: basename(resolvedInput),
      schemaVersion: dataset.schemaVersion,
      readinessRows: readiness.length,
      phaseReadinessRows: phaseReadiness.length,
      sourceReadinessRows: sourceReadiness.length,
      validationClips: validationClips.length,
      pairs: pairs.length,
      pairedPairs,
      phasesWithEvidence,
      warnings,
    }, null, 2)}\n`);
  }
}

if (errors.length) {
  console.error(`Dataset de calibracao invalido (${basename(resolvedInput)}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
