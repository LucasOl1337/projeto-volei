import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const directPath = args[0] && !args[0].startsWith('--') ? args[0] : '';

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

function buildPackageFromCalibration() {
  const calibration = readJson(argValue('--calibration', 'reference/sample-video-calibration-dataset.json'));
  const candidates = readJson(argValue('--candidates', 'reference/video-ai-project-candidates.json'));
  const candidateName = argValue('--candidate', 'Sports2D');
  assert(calibration.schemaVersion === 'isa.video-calibration-dataset.v1', 'Dataset de calibracao precisa usar isa.video-calibration-dataset.v1.');
  assert(candidates.schemaVersion === 'isa.video-ai-project-candidates.v1', 'Candidatos precisam usar isa.video-ai-project-candidates.v1.');
  const candidate = candidates.candidates.find((item) => item.name === candidateName);
  assert(candidate, `Candidato nao encontrado: ${candidateName}.`);
  const phaseTargets = (calibration.phaseReadiness || []).map((phase) => {
    const clips = (calibration.validationClips || []).filter((clip) => clip.fundamental === phase.fundamental && clip.phase === phase.phase);
    const reviewedClips = clips.filter((clip) => clip.status === 'Revisado com treinadora').length;
    return {
      fundamental: phase.fundamental,
      phase: phase.phase,
      clips: clips.length,
      reviewedClips,
      pairedChecks: phase.checkedCount,
      alignmentRate: phase.rate,
    };
  });
  const recommendedFirstTest = phaseTargets[0] || {
    fundamental: 'Saque',
    phase: 'Contato',
    clips: 0,
    reviewedClips: 0,
    pairedChecks: 0,
    alignmentRate: 0,
  };
  const acceptanceCriteria = {
    minimumReviewedClips: 3,
    minimumPairedChecks: 5,
    minimumAlignmentRate: 80,
    finalHumanReview: true,
  };
  return {
    schemaVersion: 'isa.video-ai-pilot-package.v1',
    candidate,
    acceptanceCriteria,
    recommendedFirstTest,
    sourceAcceptance: buildSourceAcceptance(calibration, acceptanceCriteria),
    phaseTargets,
  };
}

function loadPilotPackage() {
  if (directPath) return readJson(directPath);
  return buildPackageFromCalibration();
}

try {
  const pilotPackage = loadPilotPackage();
  assert(pilotPackage.schemaVersion === 'isa.video-ai-pilot-package.v1', 'Pacote precisa usar isa.video-ai-pilot-package.v1.');
  assert(pilotPackage.candidate?.name, 'Pacote precisa ter candidate.name.');
  assert(pilotPackage.acceptanceCriteria, 'Pacote precisa ter acceptanceCriteria.');
  assert(pilotPackage.recommendedFirstTest, 'Pacote precisa ter recommendedFirstTest.');

  const gates = Array.isArray(pilotPackage.gates) && pilotPackage.gates.length
    ? pilotPackage.gates
    : buildGates(pilotPackage.recommendedFirstTest, pilotPackage.acceptanceCriteria);
  const passedGates = gates.filter((gate) => gate.passed).length;
  const ready = passedGates === gates.length;
  const sourceAcceptance = Array.isArray(pilotPackage.sourceAcceptance) ? pilotPackage.sourceAcceptance : [];
  const readySources = sourceAcceptance.filter((item) => /pronto/i.test(String(item.status || ''))).length;

  process.stdout.write(`${JSON.stringify({
    status: ready ? 'ready' : 'preparing',
    packageSchemaVersion: pilotPackage.schemaVersion,
    candidate: pilotPackage.candidate.name,
    recommendedFirstTest: pilotPackage.recommendedFirstTest,
    sourceAcceptance,
    readySources,
    gates,
    passedGates,
    totalGates: gates.length,
    recommendation: ready
      ? 'Pode rodar piloto controlado, mantendo revisao final da treinadora.'
      : 'Ainda nao automatizar recomendacoes. Complete os gates pendentes com clips reais e checagens manuais.',
  }, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nao foi possivel avaliar o pacote piloto.');
  process.exit(1);
}
