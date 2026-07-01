import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const [, , inputPath, ...args] = process.argv;

if (!inputPath) {
  console.error('Uso: node scripts/normalize-video-evidence.mjs <pose-result.json> [--out output.json]');
  process.exit(1);
}

const outIndex = args.indexOf('--out');
const outputPath = outIndex >= 0 ? args[outIndex + 1] : '';

function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clampConfidence(value) {
  return Math.max(0, Math.min(1, asNumber(value, 0)));
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, asNumber(seconds, 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`;
}

function formatTimeRange(observation) {
  if (typeof observation.timeRange === 'string' && observation.timeRange.trim()) {
    return observation.timeRange.trim();
  }

  const start = asNumber(observation.startSeconds, asNumber(observation.timeSeconds, 0));
  const end = asNumber(observation.endSeconds, start);
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function statusFromConfidence(confidence) {
  if (confidence >= 0.86) return 'Pronta para relatorio';
  if (confidence >= 0.7) return 'Revisar';
  return 'IA sugerida';
}

function normalizeSource(source) {
  const value = String(source || '').toLowerCase();
  if (value.includes('sports2d')) return 'Sports2D';
  if (value.includes('manual')) return 'Manual';
  return 'MediaPipe';
}

function recommendedSourceFor(source) {
  const normalized = normalizeSource(source);
  if (normalized === 'Sports2D') {
    return {
      name: 'Sports2D',
      integrationMode: 'external-cli',
      license: 'BSD-3-Clause',
      status: 'pilot-with-manual-review',
      cloneDecision: 'do-not-clone-yet',
      nextAction: 'Comparar contra checagem manual antes do relatorio.',
    };
  }
  if (normalized === 'MediaPipe') {
    return {
      name: 'MediaPipe Pose',
      integrationMode: 'browser-sdk',
      license: 'Apache-2.0',
      status: 'pilot-with-manual-review',
      cloneDecision: 'do-not-clone',
      nextAction: 'Manter a sugestao como Revisar ate a checagem manual.',
    };
  }
  return undefined;
}

function normalizeRecommendedSource(value, source) {
  if (value && typeof value === 'object') {
    return {
      name: value.name || '',
      integrationMode: value.integrationMode || '',
      license: value.license || '',
      status: value.status || '',
      cloneDecision: value.cloneDecision || '',
      nextAction: value.nextAction || '',
    };
  }
  return recommendedSourceFor(source);
}

function normalizeMetricTargets(value, source) {
  if (!Array.isArray(value)) return undefined;
  const targets = value
    .filter((target) => target && typeof target === 'object')
    .map((target) => ({
      fundamental: target.fundamental || undefined,
      phase: target.phase || undefined,
      signal: target.signal || '',
      metric: target.metric || '',
      joints: Array.isArray(target.joints) ? target.joints.map(String) : [],
      sources: Array.isArray(target.sources) ? target.sources.map(String) : [],
      manualCheck: target.manualCheck || '',
      nextAction: target.nextAction || '',
      recommendedSource: normalizeRecommendedSource(target.recommendedSource, source),
    }))
    .filter((target) => target.metric || target.signal);
  return targets.length ? targets : undefined;
}

function defaultPhase(fundamental, marker = '') {
  const markerText = String(marker || '').toLowerCase();
  if (markerText.includes('finaliza') || markerText.includes('aterriss') || markerText.includes('queda') || markerText.includes('recuper')) {
    if (fundamental === 'Ataque') return 'Aterrissagem';
    if (fundamental === 'Bloqueio') return 'Queda';
    if (['Recepcao', 'Defesa'].includes(fundamental)) return 'Recuperacao';
    return 'Finalizacao';
  }
  if (markerText.includes('base') && ['Recepcao', 'Defesa'].includes(fundamental)) return 'Preparacao';
  if (markerText.includes('armacao')) return 'Preparacao';
  if (markerText.includes('alcance')) return 'Alcance';
  if (markerText.includes('contato') || markerText.includes('plataforma')) return 'Contato';
  return ['Recepcao', 'Defesa'].includes(fundamental) ? 'Preparacao' : 'Contato';
}

function normalizeEvidence(input, inputName) {
  const source = normalizeSource(input.source || input.provider);
  const clip = input.clip || {};
  const observations = Array.isArray(input.observations) ? input.observations : [];

  if (!observations.length) {
    throw new Error('O arquivo precisa conter uma lista "observations" com pelo menos uma evidencia.');
  }

  return {
    schemaVersion: 'isa.video-evidence.v1',
    generatedAt: new Date().toISOString(),
    source,
    importedFrom: inputName,
    clip: {
      id: clip.id || input.videoId || 'clip-sem-id',
      title: clip.title || input.title || basename(inputName, '.json'),
      athlete: clip.athlete || input.athlete || 'Atleta sem nome',
      fundamental: clip.fundamental || input.fundamental || 'Fundamento nao informado',
      durationSeconds: asNumber(clip.durationSeconds, 0),
    },
    evidence: observations.map((observation, index) => {
      const confidence = clampConfidence(observation.confidence);
      return {
        id: observation.id || `evid-${String(index + 1).padStart(3, '0')}`,
        fundamental: observation.fundamental || clip.fundamental || input.fundamental || 'Fundamento nao informado',
        phase: observation.phase || observation.motionPhase || defaultPhase(observation.fundamental || clip.fundamental || input.fundamental || 'Fundamento nao informado', observation.marker || observation.label),
        athlete: observation.athlete || clip.athlete || input.athlete || 'Atleta sem nome',
        timeRange: formatTimeRange(observation),
        marker: observation.marker || observation.label || 'Marcador nao informado',
        metric: observation.metric || 'Metrica nao informada',
        value: String(observation.value || observation.measurement || 'valor nao informado'),
        confidence,
        status: observation.status || statusFromConfidence(confidence),
        reportUse: observation.reportUse || 'Revisar junto da marcacao manual antes de usar no relatorio.',
        nextAction: observation.nextAction || 'Definir proxima acao com base no criterio da treinadora.',
        metricTargets: normalizeMetricTargets(observation.metricTargets, source),
        raw: observation.raw || undefined,
      };
    }),
  };
}

const resolvedInput = resolve(inputPath);
const input = JSON.parse(readFileSync(resolvedInput, 'utf8'));
const normalized = normalizeEvidence(input, resolvedInput);
const json = `${JSON.stringify(normalized, null, 2)}\n`;

if (outputPath) {
  writeFileSync(resolve(outputPath), json, 'utf8');
} else {
  process.stdout.write(json);
}
