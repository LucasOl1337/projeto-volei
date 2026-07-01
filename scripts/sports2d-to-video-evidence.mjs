import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const [, , inputPath, ...args] = process.argv;

if (!inputPath) {
  console.error('Uso: node scripts/sports2d-to-video-evidence.mjs <angles.mot|angles.csv> [--fundamental Saque] [--athlete Isa] [--out output.json]');
  process.exit(1);
}

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const outputPath = argValue('--out');
const fundamental = argValue('--fundamental', 'Saque');
const athlete = argValue('--athlete', 'Atleta exemplo');
const clipTitle = argValue('--clip-title', basename(inputPath));
const clipId = argValue('--clip-id', basename(inputPath).replace(/\.[^.]+$/, ''));
const movementMapPath = argValue('--movement-map', 'reference/video-ai-movement-metric-map.json');

function asNumber(value, fallback = 0) {
  const numeric = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundConfidence(value) {
  return Math.round(clamp(value, 0, 1) * 100) / 100;
}

function normalizeKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function splitLine(line) {
  if (line.includes('\t')) return line.split('\t');
  if (line.includes(';')) return line.split(';');
  if (line.includes(',')) return line.split(',');
  return line.trim().split(/\s+/);
}

function findHeaderLine(lines) {
  const endHeaderIndex = lines.findIndex((line) => line.trim().toLowerCase() === 'endheader');
  if (endHeaderIndex >= 0) return endHeaderIndex + 1;
  return lines.findIndex((line) => splitLine(line).some((part) => normalizeKey(part) === 'time'));
}

function parseTable(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const headerIndex = findHeaderLine(lines);
  if (headerIndex < 0 || !lines[headerIndex]) {
    throw new Error('Nao encontrei uma linha de cabecalho com coluna time.');
  }

  const headers = splitLine(lines[headerIndex]).map((header) => header.trim());
  const rows = lines.slice(headerIndex + 1).map((line) => {
    const parts = splitLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = parts[index];
      return row;
    }, {});
  }).filter((row) => Number.isFinite(asNumber(row.time, NaN)));

  if (!rows.length) throw new Error('O arquivo nao trouxe linhas numericas depois do cabecalho.');
  return { headers, rows };
}

function columnValue(row, aliases) {
  const entries = Object.entries(row);
  const found = entries.find(([key]) => aliases.includes(normalizeKey(key)));
  return found ? asNumber(found[1], NaN) : NaN;
}

function bestArmSample(rows) {
  const aliases = {
    arm: ['rightarm', 'rarm', 'armr', 'rightupperarm', 'upperarmr', 'shoulderarmright'],
    elbow: ['rightelbow', 'relbow', 'elbowr', 'rightelbowangle'],
    forearm: ['rightforearm', 'rforearm', 'forearmr'],
  };
  return rows
    .map((row) => {
      const arm = columnValue(row, aliases.arm);
      const elbow = columnValue(row, aliases.elbow);
      const forearm = columnValue(row, aliases.forearm);
      const score = (Number.isFinite(arm) ? arm : 0) + (Number.isFinite(elbow) ? elbow / 4 : 0);
      return { row, time: asNumber(row.time), arm, elbow, forearm, score };
    })
    .sort((a, b) => b.score - a.score)[0];
}

function bestLowerBodySample(rows) {
  const aliases = {
    knee: ['rightknee', 'rknee', 'kneer', 'rightkneeangle', 'leftknee', 'lknee', 'kneel', 'leftkneeangle'],
    hip: ['righthip', 'rhip', 'hipr', 'lefthip', 'lhip', 'hipl'],
  };
  return rows
    .map((row) => {
      const knee = columnValue(row, aliases.knee);
      const hip = columnValue(row, aliases.hip);
      const score = (180 - (Number.isFinite(knee) ? knee : 180)) + (Number.isFinite(hip) ? Math.abs(hip) / 12 : 0);
      return { row, time: asNumber(row.time), knee, hip, score };
    })
    .sort((a, b) => b.score - a.score)[0];
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, asNumber(seconds, 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`;
}

function timeRange(time) {
  return `${formatTime(Math.max(0, time - 0.3))} - ${formatTime(time + 0.3)}`;
}

function phaseForObservation(marker) {
  const markerText = String(marker || '').toLowerCase();
  if (markerText.includes('base')) return 'Preparacao';
  if (markerText.includes('alcance')) return 'Alcance';
  if (markerText.includes('armacao')) return 'Preparacao';
  if (markerText.includes('contato')) return 'Contato';
  return ['Recepcao', 'Defesa'].includes(fundamental) ? 'Preparacao' : 'Contato';
}

function metricTargetsFor(phase) {
  try {
    const movementMap = JSON.parse(readFileSync(resolve(movementMapPath), 'utf8').replace(/^\uFEFF/, ''));
    if (movementMap.schemaVersion !== 'isa.video-movement-metric-map.v1') return [];
    const exact = movementMap.metrics.filter((item) => item.fundamental === fundamental && item.phase === phase);
    const fallback = movementMap.metrics.filter((item) => item.fundamental === fundamental);
    return (exact.length ? exact : fallback).map((item) => ({
      fundamental: item.fundamental,
      phase: item.phase,
      signal: item.signal,
      metric: item.metric,
      joints: item.joints,
      sources: item.sources,
      manualCheck: item.manualCheck,
      nextAction: item.nextAction,
      recommendedSource: {
        name: 'Sports2D',
        integrationMode: 'external-cli',
        license: 'BSD-3-Clause',
        status: 'pilot-with-manual-review',
        cloneDecision: 'do-not-clone-yet',
        nextAction: 'Comparar contra checagem manual antes do relatorio.',
      },
    }));
  } catch {
    return [];
  }
}

function evidenceForFundamental(rows) {
  const lowerFundamentals = ['Recepcao', 'Defesa'];
  if (lowerFundamentals.includes(fundamental)) {
    const sample = bestLowerBodySample(rows);
    if (!sample || !Number.isFinite(sample.knee)) {
      throw new Error('Nao encontrei coluna de joelho para recepcao/defesa.');
    }
    const lowBase = sample.knee < 155 ? 'sim' : 'revisar';
    return {
      id: `sports2d-${fundamental.toLowerCase()}-base`,
      marker: fundamental === 'Recepcao' ? 'Base de recepcao' : 'Base defensiva',
      metric: 'Flexao de joelho Sports2D',
      value: `${lowBase}, joelho ${Math.round(sample.knee)} graus`,
      confidence: roundConfidence(sample.knee < 155 ? 0.78 : 0.58),
      startSeconds: Math.max(0, sample.time - 0.3),
      endSeconds: sample.time + 0.3,
      reportUse: 'Conferir no frame se a base baixa aconteceu no momento correto do fundamento.',
      nextAction: 'Filmar novo clip com camera parada e comparar o angulo do joelho no mesmo marcador.',
      raw: sample.row,
    };
  }

  const sample = bestArmSample(rows);
  if (!sample || (!Number.isFinite(sample.arm) && !Number.isFinite(sample.elbow))) {
    throw new Error('Nao encontrei colunas de braco/cotovelo para saque, ataque ou bloqueio.');
  }

  const armText = Number.isFinite(sample.arm) ? `braco ${Math.round(sample.arm)} graus` : 'braco sem coluna';
  const elbowText = Number.isFinite(sample.elbow) ? `cotovelo ${Math.round(sample.elbow)} graus` : 'cotovelo sem coluna';
  const highArm = Number.isFinite(sample.arm) ? sample.arm >= 65 : true;
  const extendedElbow = Number.isFinite(sample.elbow) ? sample.elbow >= 135 : true;

  return {
    id: `sports2d-${fundamental.toLowerCase()}-braco`,
    marker: fundamental === 'Bloqueio' ? 'Alcance do bloqueio' : fundamental === 'Ataque' ? 'Armacao do ataque' : 'Ponto de contato',
    metric: 'Braco alto e cotovelo estendido Sports2D',
    value: `${highArm && extendedElbow ? 'sim' : 'revisar'}, ${armText}; ${elbowText}`,
    confidence: roundConfidence((highArm ? 0.36 : 0.2) + (extendedElbow ? 0.36 : 0.2) + 0.08),
    startSeconds: Math.max(0, sample.time - 0.3),
    endSeconds: sample.time + 0.3,
    reportUse: 'Conferir no frame se o braco alto corresponde ao contato, ataque ou alcance do fundamento.',
    nextAction: 'Repetir o clip mantendo camera lateral e comparar o mesmo angulo no proximo treino.',
    raw: sample.row,
  };
}

const resolvedInput = resolve(inputPath);
const { rows } = parseTable(readFileSync(resolvedInput, 'utf8'));
const observation = evidenceForFundamental(rows);
const durationSeconds = Math.max(...rows.map((row) => asNumber(row.time, 0)));

const normalized = {
  schemaVersion: 'isa.video-evidence.v1',
  generatedAt: new Date().toISOString(),
  source: 'Sports2D',
  importedFrom: resolvedInput,
  clip: {
    id: clipId,
    title: clipTitle,
    athlete,
    fundamental,
    durationSeconds,
  },
  evidence: [{
    id: observation.id,
    fundamental,
    phase: phaseForObservation(observation.marker),
    athlete,
    timeRange: timeRange((observation.startSeconds + observation.endSeconds) / 2),
    marker: observation.marker,
    metric: metricTargetsFor(phaseForObservation(observation.marker))[0]?.metric || observation.metric,
    value: observation.value,
    confidence: observation.confidence,
    status: 'Revisar',
    reportUse: metricTargetsFor(phaseForObservation(observation.marker))[0]?.manualCheck || observation.reportUse,
    nextAction: metricTargetsFor(phaseForObservation(observation.marker))[0]?.nextAction || observation.nextAction,
    metricTargets: metricTargetsFor(phaseForObservation(observation.marker)),
    raw: observation.raw,
  }],
};

const output = `${JSON.stringify(normalized, null, 2)}\n`;
if (outputPath) writeFileSync(resolve(outputPath), output, 'utf8');
else process.stdout.write(output);
