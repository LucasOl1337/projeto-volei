import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const directPath = args[0] && !args[0].startsWith('--') ? args[0] : '';
const checkFiles = args.includes('--check-files');

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

function clipPathStatus(clip, baseDir) {
  const paths = [
    ['sourceVideo', clip.sourceVideo],
    ['sports2dAngles', clip.sports2dAngles],
    ['normalizedEvidence', clip.normalizedEvidence],
  ];
  return paths.map(([field, value]) => ({
    field,
    path: value || '',
    exists: Boolean(value) && existsSync(resolve(baseDir, value)),
  }));
}

function validateManifest(manifest) {
  assert(manifest.schemaVersion === 'isa.video-clip-manifest.v1', 'Manifesto precisa usar isa.video-clip-manifest.v1.');
  assert(manifest.candidate?.name, 'Manifesto precisa ter candidate.name.');
  assert(Array.isArray(manifest.clips) && manifest.clips.length, 'Manifesto precisa ter clips.');

  manifest.clips.forEach((clip, index) => {
    const prefix = `clips[${index}]`;
    assert(clip.id, `${prefix}.id e obrigatorio.`);
    assert(clip.athlete, `${prefix}.athlete e obrigatorio.`);
    assert(clip.fundamental, `${prefix}.fundamental e obrigatorio.`);
    assert(clip.phase, `${prefix}.phase e obrigatorio.`);
    assert(clip.sourceVideo, `${prefix}.sourceVideo e obrigatorio.`);
    assert(clip.sports2dAngles, `${prefix}.sports2dAngles e obrigatorio.`);
    assert(clip.normalizedEvidence, `${prefix}.normalizedEvidence e obrigatorio.`);
    assert(Array.isArray(clip.metricTargets) && clip.metricTargets.length, `${prefix}.metricTargets precisa ter pelo menos uma metrica tecnica.`);
    clip.metricTargets.forEach((target, targetIndex) => {
      const targetPrefix = `${prefix}.metricTargets[${targetIndex}]`;
      assert(target.metric, `${targetPrefix}.metric e obrigatorio.`);
      assert(target.signal, `${targetPrefix}.signal e obrigatorio.`);
      assert(Array.isArray(target.joints) && target.joints.length, `${targetPrefix}.joints precisa ser lista preenchida.`);
      assert(target.manualCheck, `${targetPrefix}.manualCheck e obrigatorio.`);
      assert(target.recommendedSource?.name, `${targetPrefix}.recommendedSource.name e obrigatorio.`);
      assert(target.recommendedSource?.status, `${targetPrefix}.recommendedSource.status e obrigatorio.`);
    });
    assert(clip.manualReview?.required === true, `${prefix}.manualReview.required precisa ser true.`);
  });
}

try {
  const manifest = directPath
    ? readJson(directPath)
    : JSON.parse(await (async () => {
      const { execFileSync } = await import('node:child_process');
      return execFileSync('node', [
        'scripts/build-video-clip-manifest.mjs',
        '--calibration',
        argValue('--calibration', 'reference/sample-video-calibration-dataset.json'),
        '--candidate',
        argValue('--candidate', 'Sports2D'),
      ], { encoding: 'utf8' });
    })());

  validateManifest(manifest);

  const baseDir = resolve(argValue('--base', '.'));
  const fileChecks = checkFiles
    ? manifest.clips.map((clip) => ({
      id: clip.id,
      files: clipPathStatus(clip, baseDir),
    }))
    : [];
  const missingFiles = fileChecks.flatMap((clip) => clip.files
    .filter((file) => !file.exists)
    .map((file) => ({ clipId: clip.id, field: file.field, path: file.path })));
  const requiredFieldCount = manifest.clips.length * 6;
  const plannedFieldCount = manifest.clips.reduce((total, clip) => total
    + (clip.sourceVideo ? 1 : 0)
    + (clip.sports2dAngles ? 1 : 0)
    + (clip.normalizedEvidence ? 1 : 0)
    + (clip.metricTargets?.length ? 1 : 0)
    + (clip.metricTargets?.every((target) => target.recommendedSource?.name) ? 1 : 0)
    + (clip.manualReview?.required ? 1 : 0), 0);

  process.stdout.write(`${JSON.stringify({
    status: checkFiles && missingFiles.length ? 'needs-files' : 'ok',
    schemaVersion: manifest.schemaVersion,
    candidate: manifest.candidate.name,
    clips: manifest.clips.length,
    plannedFields: `${plannedFieldCount}/${requiredFieldCount}`,
    checkFiles,
    missingFiles,
    recommendation: checkFiles && missingFiles.length
      ? 'Copie ou gere os arquivos faltantes antes de rodar o piloto completo.'
      : 'Manifesto valido para organizar a coleta e o pipeline externo.',
  }, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nao foi possivel validar o manifesto.');
  process.exit(1);
}
