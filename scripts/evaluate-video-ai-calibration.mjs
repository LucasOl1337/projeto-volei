import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const inputPath = process.argv[2] || 'reference/sample-video-calibration-dataset.json';

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8').replace(/^\uFEFF/, ''));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sourceName(pair) {
  return pair?.ai?.recommendedSource?.name || pair?.ai?.source || 'Fonte sem nome';
}

function average(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  return numbers.length ? Math.round((numbers.reduce((total, value) => total + value, 0) / numbers.length) * 100) / 100 : 0;
}

function evaluateGroup(label, pairs, criteria) {
  const paired = pairs.filter((pair) => pair.paired === true);
  const aligned = paired.filter((pair) => pair.alignment === 'Alinhada');
  const rate = paired.length ? Math.round((aligned.length / paired.length) * 100) : 0;
  const averageConfidence = average(pairs.map((pair) => pair.ai?.confidence));
  const passed = paired.length >= criteria.minimumPairedChecks
    && rate >= criteria.minimumAlignmentRate
    && averageConfidence >= criteria.minimumAverageConfidence;
  const status = passed
    ? 'ready-for-controlled-pilot'
    : paired.length
      ? 'calibrating'
      : 'needs-manual-pairs';

  return {
    label,
    aiEvidence: pairs.length,
    pairedChecks: paired.length,
    alignedChecks: aligned.length,
    alignmentRate: rate,
    averageConfidence,
    status,
    nextAction: passed
      ? 'Rodar piloto controlado com revisao final antes de relatorio.'
      : 'Adicionar clips reais e checagens manuais pareadas para esta fonte.',
  };
}

try {
  const dataset = readJson(inputPath);
  assert(dataset.schemaVersion === 'isa.video-calibration-dataset.v1', 'Dataset precisa usar isa.video-calibration-dataset.v1.');
  assert(Array.isArray(dataset.pairs), 'Dataset precisa ter pairs.');

  const criteria = {
    minimumPairedChecks: 5,
    minimumAlignmentRate: 80,
    minimumAverageConfidence: 0.7,
  };
  const bySource = new Map();
  const byPhase = new Map();

  dataset.pairs.forEach((pair) => {
    const source = sourceName(pair);
    const phase = `${pair.fundamental || 'Fundamento'} - ${pair.phase || 'Fase'}`;
    bySource.set(source, [...(bySource.get(source) || []), pair]);
    byPhase.set(phase, [...(byPhase.get(phase) || []), pair]);
  });

  const sourceResults = [...bySource.entries()].map(([source, pairs]) => evaluateGroup(source, pairs, criteria));
  const phaseResults = [...byPhase.entries()].map(([phase, pairs]) => evaluateGroup(phase, pairs, criteria));
  const readySources = sourceResults.filter((item) => item.status === 'ready-for-controlled-pilot').length;

  process.stdout.write(`${JSON.stringify({
    status: readySources ? 'ready-source-found' : 'collect-more-pairs',
    schemaVersion: 'isa.video-ai-calibration-evaluation.v1',
    file: basename(resolve(inputPath)),
    criteria,
    sources: sourceResults.length,
    readySources,
    sourceResults,
    phaseResults,
    recommendation: readySources
      ? 'Existe fonte com dados suficientes para piloto controlado, ainda com revisao humana.'
      : 'Ainda nao automatizar recomendacoes. Colete mais pares IA x manual por fonte e fase.',
  }, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nao foi possivel avaliar calibracao IA x manual.');
  process.exit(1);
}
