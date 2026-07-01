import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const calibrationPath = resolve(argValue('--calibration', 'reference/sample-video-calibration-dataset.json'));
const candidatesPath = resolve(argValue('--candidates', 'reference/video-ai-project-candidates.json'));
const movementMapPath = resolve(argValue('--movement-map', 'reference/video-ai-movement-metric-map.json'));
const candidateName = argValue('--candidate', 'Sports2D');
const outputPath = argValue('--out');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function metricTargetsFor(movementMap, fundamental, phase) {
  const exact = movementMap.metrics.filter((item) => item.fundamental === fundamental && item.phase === phase);
  const fallback = movementMap.metrics.filter((item) => item.fundamental === fundamental);
  return (exact.length ? exact : fallback).map((item) => ({
    signal: item.signal,
    metric: item.metric,
    joints: item.joints,
    sources: item.sources,
    manualCheck: item.manualCheck,
  }));
}

function buildPhaseTargets(calibration, movementMap) {
  return (calibration.phaseReadiness || []).map((phase) => {
    const clips = (calibration.validationClips || []).filter((clip) => clip.fundamental === phase.fundamental && clip.phase === phase.phase);
    const reviewedClips = clips.filter((clip) => clip.status === 'Revisado com treinadora').length;
    const readyForPilot = reviewedClips >= 3 && phase.checkedCount >= 5 && phase.rate >= 80;
    return {
      fundamental: phase.fundamental,
      phase: phase.phase,
      metricTargets: metricTargetsFor(movementMap, phase.fundamental, phase.phase),
      clips: clips.length,
      reviewedClips,
      pairedChecks: phase.checkedCount,
      alignmentRate: phase.rate,
      status: readyForPilot ? 'Pronto para piloto' : clips.length || phase.checkedCount ? 'Preparar piloto' : 'Sem clips reais',
      nextAction: readyForPilot
        ? 'Rodar piloto controlado e manter revisao final da treinadora.'
        : 'Coletar clips reais, rodar IA e parear checagens manuais antes de automatizar.',
    };
  });
}

function buildGates(target, criteria) {
  return [
    {
      id: 'reviewed-clips',
      label: 'Clips reais revisados',
      current: target.reviewedClips || 0,
      target: criteria.minimumReviewedClips,
      passed: (target.reviewedClips || 0) >= criteria.minimumReviewedClips,
    },
    {
      id: 'paired-checks',
      label: 'Checagens manuais pareadas',
      current: target.pairedChecks || 0,
      target: criteria.minimumPairedChecks,
      passed: (target.pairedChecks || 0) >= criteria.minimumPairedChecks,
    },
    {
      id: 'alignment-rate',
      label: 'Alinhamento IA x manual',
      current: target.alignmentRate || 0,
      target: criteria.minimumAlignmentRate,
      unit: '%',
      passed: (target.alignmentRate || 0) >= criteria.minimumAlignmentRate,
    },
    {
      id: 'human-review',
      label: 'Revisao final da treinadora',
      current: criteria.finalHumanReview ? 1 : 0,
      target: 1,
      passed: Boolean(criteria.finalHumanReview),
    },
  ];
}

function buildSourceAcceptance(calibration, criteria) {
  return (calibration.sourceReadiness || []).map((item) => {
    const passed = (item.checkedCount || 0) >= criteria.minimumPairedChecks
      && (item.rate || 0) >= criteria.minimumAlignmentRate
      && (item.averageConfidence || 0) >= 0.7;
    return {
      source: item.source,
      aiCount: item.aiCount || 0,
      pairedChecks: item.checkedCount || 0,
      alignedChecks: item.alignedCount || 0,
      alignmentRate: item.rate || 0,
      averageConfidence: item.averageConfidence || 0,
      status: passed ? 'Pronto para piloto controlado' : item.checkedCount ? 'Em calibracao' : 'Sem pares manuais',
      nextAction: passed
        ? 'Rodar piloto controlado com revisao final.'
        : 'Adicionar pares IA x manual dessa fonte antes de automatizar.',
    };
  });
}

const calibration = readJson(calibrationPath);
const candidates = readJson(candidatesPath);
const movementMap = readJson(movementMapPath);
assert(calibration.schemaVersion === 'isa.video-calibration-dataset.v1', 'Dataset de calibracao precisa usar isa.video-calibration-dataset.v1.');
assert(candidates.schemaVersion === 'isa.video-ai-project-candidates.v1', 'Candidatos precisam usar isa.video-ai-project-candidates.v1.');
assert(movementMap.schemaVersion === 'isa.video-movement-metric-map.v1', 'Mapa de metricas precisa usar isa.video-movement-metric-map.v1.');

const candidate = candidates.candidates.find((item) => item.name === candidateName);
assert(candidate, `Candidato nao encontrado: ${candidateName}.`);

const phaseTargets = buildPhaseTargets(calibration, movementMap);
const recommendedFirstTest = [...phaseTargets].sort((a, b) => {
  const scoreA = (a.clips * 3) + (a.reviewedClips * 4) + (a.pairedChecks * 5);
  const scoreB = (b.clips * 3) + (b.reviewedClips * 4) + (b.pairedChecks * 5);
  return scoreB - scoreA;
})[0] || {
  fundamental: 'Saque',
  phase: 'Contato',
  clips: 0,
  reviewedClips: 0,
  pairedChecks: 0,
  alignmentRate: 0,
  status: 'Sem clips reais',
  nextAction: 'Registrar clips reais antes de rodar o piloto.',
};
const acceptanceCriteria = {
  minimumReviewedClips: 3,
  minimumPairedChecks: 5,
  minimumAlignmentRate: 80,
  finalHumanReview: true,
};
const gates = buildGates(recommendedFirstTest, acceptanceCriteria);
const sourceAcceptance = buildSourceAcceptance(calibration, acceptanceCriteria);

const pilotPackage = {
  schemaVersion: 'isa.video-ai-pilot-package.v1',
  generatedAt: new Date().toISOString(),
  candidate: {
    name: candidate.name,
    url: candidate.url,
    license: candidate.license,
    priority: candidate.priority,
  },
  objective: 'Validar se a analise externa de movimento gera evidencia tecnica confiavel para o volei.',
  acceptanceCriteria,
  gates,
  status: gates.every((gate) => gate.passed) ? 'Pronto para piloto' : 'Preparar piloto',
  recommendedFirstTest,
  sourceAcceptance,
  phaseTargets,
  validationClips: calibration.validationClips || [],
  commands: [
    'npm run video:candidates',
    'npm run video:sports2d',
    'npm run video:calibration',
    'npm run video:calibration:plan',
    'npm run video:calibration:manifest',
    'npm run video:calibration:worklist',
    'npm run video:calibration:run -- --execute',
    'npm run video:calibration:process -- --write',
  ],
  reviewRule: 'IA sugere evidencia. A treinadora valida criterio, fase do movimento e contexto antes do relatorio.',
};

const json = `${JSON.stringify(pilotPackage, null, 2)}\n`;

if (outputPath) {
  writeFileSync(resolve(outputPath), json, 'utf8');
} else {
  process.stdout.write(json);
}
