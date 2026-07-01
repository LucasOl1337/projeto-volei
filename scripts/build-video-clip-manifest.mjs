import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function slug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'clip';
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const calibrationPath = argValue('--calibration', 'reference/sample-video-calibration-dataset.json');
const candidatesPath = argValue('--candidates', 'reference/video-ai-project-candidates.json');
const movementMapPath = argValue('--movement-map', 'reference/video-ai-movement-metric-map.json');
const sourceAuditPath = argValue('--sources', 'reference/video-ai-source-audit.json');
const candidateName = argValue('--candidate', 'Sports2D');
const outputPath = argValue('--out');

const calibration = readJson(calibrationPath);
const candidates = readJson(candidatesPath);
const movementMap = readJson(movementMapPath);
const sourceAudit = readJson(sourceAuditPath);

assert(calibration.schemaVersion === 'isa.video-calibration-dataset.v1', 'Dataset de calibracao precisa usar isa.video-calibration-dataset.v1.');
assert(candidates.schemaVersion === 'isa.video-ai-project-candidates.v1', 'Candidatos precisam usar isa.video-ai-project-candidates.v1.');
assert(movementMap.schemaVersion === 'isa.video-movement-metric-map.v1', 'Mapa de metricas precisa usar isa.video-movement-metric-map.v1.');
assert(sourceAudit.schemaVersion === 'isa.video-ai-source-audit.v1', 'Auditoria de fontes precisa usar isa.video-ai-source-audit.v1.');

const candidate = candidates.candidates.find((item) => item.name === candidateName);
assert(candidate, `Candidato nao encontrado: ${candidateName}.`);

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

function routeSourceFor(target) {
  const sourceByKey = new Map(sourceAudit.sources.map((source) => [sourceKey(source.name), source]));
  const availableSources = (target.sources || [])
    .map((source) => sourceByKey.get(sourceKey(source)))
    .filter(Boolean);
  const selectedCandidate = sourceByKey.get(sourceKey(candidateName));
  const selected = availableSources.some((source) => source.name === selectedCandidate?.name)
    ? selectedCandidate
    : [...availableSources].sort((a, b) => modeRank(b) - modeRank(a) || a.name.localeCompare(b.name))[0];
  if (!selected) {
    return {
      name: '',
      integrationMode: '',
      license: '',
      status: 'missing-source',
      nextAction: 'Adicionar fonte compativel na auditoria antes de rodar este marcador.',
    };
  }
  return {
    name: selected.name,
    integrationMode: selected.integrationMode,
    license: selected.license,
    status: ['browser-sdk', 'external-cli'].includes(selected.integrationMode) ? 'pilot-with-manual-review' : 'reference-only',
    cloneDecision: selected.cloneDecision,
    nextAction: selected.nextAction,
  };
}

function metricTargetsFor(clip) {
  const exact = movementMap.metrics.filter((item) => item.fundamental === clip.fundamental && item.phase === clip.phase);
  const fallback = movementMap.metrics.filter((item) => item.fundamental === clip.fundamental);
  return (exact.length ? exact : fallback).map((item) => {
    const target = {
      fundamental: item.fundamental,
      phase: item.phase,
      signal: item.signal,
      metric: item.metric,
      joints: item.joints,
      sources: item.sources,
      manualCheck: item.manualCheck,
      nextAction: item.nextAction,
    };
    return {
      ...target,
      recommendedSource: routeSourceFor(target),
    };
  });
}

const sourceClips = calibration.validationClips?.length ? calibration.validationClips : [{
  id: 'clip-saque-contato-001',
  athlete: 'Isa',
  fundamental: 'Saque',
  phase: 'Contato',
  marker: 'Contato alto no saque',
  status: 'Gravado',
  createdAt: new Date().toISOString(),
}];

const clips = sourceClips.map((clip) => {
  const clipSlug = slug(`${clip.athlete}-${clip.fundamental}-${clip.phase}-${clip.id}`);
  return {
    id: clip.id,
    athlete: clip.athlete,
    fundamental: clip.fundamental,
    phase: clip.phase,
    marker: clip.marker,
    status: clip.status,
    sourceVideo: `videos/${clipSlug}.mp4`,
    sports2dAngles: `exports/sports2d/${clipSlug}.mot`,
    normalizedEvidence: `exports/evidence/${clipSlug}.json`,
    metricTargets: metricTargetsFor(clip),
    manualReview: {
      required: true,
      expectedCalibrationOf: '',
      note: 'Preencher calibrationOf depois que a evidencia de IA existir.',
    },
  };
});

function preflightFor(clipsToCheck) {
  return [
    {
      id: 'source-video-paths',
      label: 'Caminhos de video bruto',
      current: clipsToCheck.filter((clip) => Boolean(clip.sourceVideo)).length,
      target: clipsToCheck.length,
      passed: clipsToCheck.every((clip) => Boolean(clip.sourceVideo)),
    },
    {
      id: 'sports2d-angle-paths',
      label: 'Caminhos de angulos Sports2D',
      current: clipsToCheck.filter((clip) => Boolean(clip.sports2dAngles)).length,
      target: clipsToCheck.length,
      passed: clipsToCheck.every((clip) => Boolean(clip.sports2dAngles)),
    },
    {
      id: 'normalized-evidence-paths',
      label: 'Caminhos de evidencia normalizada',
      current: clipsToCheck.filter((clip) => Boolean(clip.normalizedEvidence)).length,
      target: clipsToCheck.length,
      passed: clipsToCheck.every((clip) => Boolean(clip.normalizedEvidence)),
    },
    {
      id: 'metric-targets',
      label: 'Metricas tecnicas planejadas',
      current: clipsToCheck.filter((clip) => clip.metricTargets?.length).length,
      target: clipsToCheck.length,
      passed: clipsToCheck.every((clip) => clip.metricTargets?.length),
    },
    {
      id: 'source-routes',
      label: 'Fonte IA escolhida por metrica',
      current: clipsToCheck.filter((clip) => clip.metricTargets?.every((target) => target.recommendedSource?.name)).length,
      target: clipsToCheck.length,
      passed: clipsToCheck.every((clip) => clip.metricTargets?.every((target) => target.recommendedSource?.name)),
    },
    {
      id: 'manual-review-required',
      label: 'Revisao manual obrigatoria',
      current: clipsToCheck.filter((clip) => clip.manualReview?.required).length,
      target: clipsToCheck.length,
      passed: clipsToCheck.every((clip) => clip.manualReview?.required),
    },
  ];
}

const preflight = preflightFor(clips);

const manifest = {
  schemaVersion: 'isa.video-clip-manifest.v1',
  generatedAt: new Date().toISOString(),
  candidate: {
    name: candidate.name,
    license: candidate.license,
    priority: candidate.priority,
  },
  captureProtocol: {
    maxDurationSeconds: 12,
    camera: 'Camera parada, corpo inteiro visivel, um fundamento por clip.',
    reviewRule: 'Cada clip precisa de revisao manual antes de alimentar recomendacao automatica.',
  },
  preflight,
  status: preflight.every((item) => item.passed) ? 'Manifesto pronto para coleta' : 'Manifesto incompleto',
  clips,
  commands: [
    'npm run video:sports2d:worklist',
    'npm run video:sports2d:run',
    'npm run video:sports2d -- caminho/para/angles.mot',
    'npm run video:clips:process',
    'npm run video:evidence',
    'npm run video:calibration',
    'npm run video:pilot:evaluate',
  ],
};

const json = `${JSON.stringify(manifest, null, 2)}\n`;

if (outputPath) {
  writeFileSync(resolve(outputPath), json, 'utf8');
} else {
  process.stdout.write(json);
}
