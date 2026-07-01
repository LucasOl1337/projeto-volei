import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const directPath = args[0] && !args[0].startsWith('--') ? args[0] : '';
const writeOutputs = args.includes('--write');
const fromGaps = args.includes('--from-gaps');

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8').replace(/^\uFEFF/, ''));
}

function buildDefaultManifest() {
  const script = fromGaps ? 'scripts/build-video-gap-manifest.mjs' : 'scripts/build-video-clip-manifest.mjs';
  return JSON.parse(execFileSync('node', [
    script,
    '--calibration',
    argValue('--calibration', 'reference/sample-video-calibration-dataset.json'),
    '--candidate',
    argValue('--candidate', 'Sports2D'),
  ], { encoding: 'utf8' }));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateManifest(manifest) {
  assert(manifest.schemaVersion === 'isa.video-clip-manifest.v1', 'Manifesto precisa usar isa.video-clip-manifest.v1.');
  assert(Array.isArray(manifest.clips) && manifest.clips.length, 'Manifesto precisa ter clips.');
}

function relativeExists(baseDir, value) {
  return Boolean(value) && existsSync(resolve(baseDir, value));
}

function convertSports2D({ baseDir, clip }) {
  const inputPath = resolve(baseDir, clip.sports2dAngles);
  const outputPath = resolve(baseDir, clip.normalizedEvidence);
  if (writeOutputs) mkdirSync(dirname(outputPath), { recursive: true });

  const output = execFileSync('node', [
    'scripts/sports2d-to-video-evidence.mjs',
    inputPath,
    '--fundamental',
    clip.fundamental,
    '--athlete',
    clip.athlete,
    '--clip-title',
    `${clip.fundamental} - ${clip.phase}`,
    '--clip-id',
    clip.id,
    ...(writeOutputs ? ['--out', outputPath] : []),
  ], { encoding: 'utf8' });

  const normalized = writeOutputs ? readJson(outputPath) : JSON.parse(output);
  return {
    evidencePath: clip.normalizedEvidence,
    evidenceCount: normalized.evidence?.length || 0,
    firstMarker: normalized.evidence?.[0]?.marker || '',
    firstMetric: normalized.evidence?.[0]?.metric || '',
    status: writeOutputs ? 'written' : 'preview',
  };
}

try {
  const manifest = directPath ? readJson(directPath) : buildDefaultManifest();
  validateManifest(manifest);

  const baseDir = resolve(argValue('--base', '.'));
  const clips = manifest.clips.map((clip) => {
    const initialFiles = {
      sourceVideo: relativeExists(baseDir, clip.sourceVideo),
      sports2dAngles: relativeExists(baseDir, clip.sports2dAngles),
      normalizedEvidence: relativeExists(baseDir, clip.normalizedEvidence),
    };
    const canConvert = initialFiles.sports2dAngles;
    const conversion = canConvert ? convertSports2D({ baseDir, clip }) : null;
    const files = {
      ...initialFiles,
      normalizedEvidence: initialFiles.normalizedEvidence || Boolean(writeOutputs && conversion),
    };
    const missing = Object.entries(files)
      .filter(([, exists]) => !exists)
      .map(([field]) => field);

    return {
      id: clip.id,
      athlete: clip.athlete,
      fundamental: clip.fundamental,
      phase: clip.phase,
      marker: clip.marker,
      metricTargets: (clip.metricTargets || []).map((target) => ({
        metric: target.metric,
        signal: target.signal,
        manualCheck: target.manualCheck,
        recommendedSource: target.recommendedSource || null,
      })),
      files,
      missing,
      conversion,
      nextAction: canConvert
        ? 'Revisar a evidencia normalizada e parear checagem manual.'
        : 'Gerar ou copiar a exportacao Sports2D no caminho esperado.',
    };
  });

  const converted = clips.filter((clip) => clip.conversion).length;
  const missingSports2D = clips.filter((clip) => !clip.files.sports2dAngles).length;
  const missingSourceVideo = clips.filter((clip) => !clip.files.sourceVideo).length;

  process.stdout.write(`${JSON.stringify({
    status: converted === clips.length && missingSourceVideo === 0
      ? 'ready-for-review'
      : converted > 0
        ? 'partial'
        : 'needs-inputs',
    schemaVersion: 'isa.video-clip-pipeline-report.v1',
    manifestVersion: manifest.schemaVersion,
    candidate: manifest.candidate?.name || 'Sports2D',
    writeOutputs,
    clips: clips.length,
    converted,
    missingSports2D,
    missingSourceVideo,
    reportUse: 'Use este relatorio para saber quais clips ja viraram evidencia revisavel e quais ainda precisam de arquivo de angulos ou video bruto.',
    clipsStatus: clips,
  }, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nao foi possivel processar o manifesto de clips.');
  process.exit(1);
}
