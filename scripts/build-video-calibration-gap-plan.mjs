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

function slug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'clip';
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sourceFromPair(pair) {
  return pair?.ai?.recommendedSource?.name || pair?.ai?.source || 'Sports2D';
}

function targetFor(movementMap, fundamental, phase) {
  return movementMap.metrics.find((item) => item.fundamental === fundamental && item.phase === phase)
    || movementMap.metrics.find((item) => item.fundamental === fundamental)
    || movementMap.metrics[0];
}

function dominantPhaseForSource(dataset, source) {
  const sourcePairs = (dataset.pairs || []).filter((pair) => sourceFromPair(pair) === source);
  const counts = new Map();
  sourcePairs.forEach((pair) => {
    const key = `${pair.fundamental || 'Saque'}|||${pair.phase || 'Contato'}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const [key] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
  if (key) {
    const [fundamental, phase] = key.split('|||');
    return { fundamental, phase };
  }
  const firstPhase = dataset.phaseReadiness?.[0] || {};
  return {
    fundamental: firstPhase.fundamental || 'Saque',
    phase: firstPhase.phase || 'Contato',
  };
}

const calibrationPath = argValue('--calibration', 'reference/sample-video-calibration-dataset.json');
const movementMapPath = argValue('--movement-map', 'reference/video-ai-movement-metric-map.json');
const candidateName = argValue('--candidate', 'Sports2D');
const dataset = readJson(calibrationPath);
const movementMap = readJson(movementMapPath);

assert(dataset.schemaVersion === 'isa.video-calibration-dataset.v1', 'Dataset precisa usar isa.video-calibration-dataset.v1.');
assert(movementMap.schemaVersion === 'isa.video-movement-metric-map.v1', 'Mapa de metricas precisa usar isa.video-movement-metric-map.v1.');

const criteria = {
  minimumReviewedClips: 3,
  minimumPairedChecks: 5,
  minimumAlignmentRate: 80,
  minimumAverageConfidence: 0.7,
};

const sourceRows = dataset.sourceReadiness?.length
  ? dataset.sourceReadiness
  : [{
    source: candidateName,
    aiCount: dataset.summary?.aiEvidenceCount || 0,
    checkedCount: dataset.summary?.pairedChecks || 0,
    alignedCount: 0,
    rate: 0,
    averageConfidence: 0,
    status: 'Sem fonte calculada',
  }];

const gapSources = sourceRows.map((source) => {
  const phase = dominantPhaseForSource(dataset, source.source);
  const metricTarget = targetFor(movementMap, phase.fundamental, phase.phase);
  const missingPairs = Math.max(0, criteria.minimumPairedChecks - Number(source.checkedCount || 0));
  const missingReviewedClips = Math.max(0, criteria.minimumReviewedClips - (dataset.validationClips || [])
    .filter((clip) => clip.fundamental === phase.fundamental && clip.phase === phase.phase && clip.status === 'Revisado com treinadora')
    .length);
  const startIndex = Number(source.checkedCount || 0) + 1;
  const plannedPairs = Array.from({ length: missingPairs }, (_, index) => {
    const pairNumber = startIndex + index;
    const clipSlug = slug(`isa-${phase.fundamental}-${phase.phase}-${source.source}-pair-${pairNumber}`);
    return {
      id: `gap-${clipSlug}`,
      source: source.source,
      athlete: 'Isa',
      fundamental: phase.fundamental,
      phase: phase.phase,
      marker: metricTarget?.signal || `${phase.fundamental} - ${phase.phase}`,
      metric: metricTarget?.metric || 'Metrica tecnica',
      sourceVideo: `videos/${clipSlug}.mp4`,
      expectedAngles: source.source === 'Sports2D' ? `exports/sports2d/${clipSlug}.mot` : '',
      normalizedEvidence: `exports/evidence/${clipSlug}.json`,
      manualCheck: metricTarget?.manualCheck || 'Parear com checagem manual antes do relatorio.',
      status: 'Planejado',
    };
  });

  return {
    source: source.source,
    currentPairs: Number(source.checkedCount || 0),
    missingPairs,
    missingReviewedClips,
    alignmentRate: Number(source.rate || 0),
    averageConfidence: Number(source.averageConfidence || 0),
    targetFundamental: phase.fundamental,
    targetPhase: phase.phase,
    status: missingPairs || missingReviewedClips ? 'needs-collection' : 'ready-for-evaluation',
    plannedPairs,
  };
});

const totalMissingPairs = gapSources.reduce((total, item) => total + item.missingPairs, 0);

process.stdout.write(`${JSON.stringify({
  status: totalMissingPairs ? 'needs-collection' : 'ready-for-evaluation',
  schemaVersion: 'isa.video-calibration-gap-plan.v1',
  generatedAt: new Date().toISOString(),
  candidate: candidateName,
  criteria,
  totalMissingPairs,
  gapSources,
  commands: [
    'npm run video:clips',
    'npm run video:sports2d:worklist',
    'npm run video:sports2d:run -- --execute',
    'npm run video:clips:process -- --write',
    'npm run video:calibration:evaluate',
  ],
}, null, 2)}\n`);
