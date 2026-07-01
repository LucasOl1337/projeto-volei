import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const directPath = args[0] && !args[0].startsWith('--') ? args[0] : '';
const outputPath = argValue('--out');
const fromGaps = args.includes('--from-gaps');
const nextProcessCommand = fromGaps
  ? 'npm run video:calibration:process -- --write'
  : 'npm run video:clips:process -- --write';

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8').replace(/^\uFEFF/, ''));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

function quoteShell(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
}

function quotePowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function anglePlanFor(fundamental, phase = '') {
  const key = `${fundamental} ${phase}`.toLowerCase();
  if (key.includes('recepcao') || key.includes('defesa') || key.includes('aterrissagem') || key.includes('base')) {
    return {
      focus: 'base baixa, quadril e joelho',
      jointAngles: ['right knee', 'left knee', 'right hip', 'left hip'],
      segmentAngles: ['right thigh', 'left thigh', 'trunk'],
      reviewQuestion: 'A base baixa aparece no frame certo do fundamento?',
    };
  }

  if (key.includes('bloqueio')) {
    return {
      focus: 'alcance alto e extensao dos bracos',
      jointAngles: ['right shoulder', 'left shoulder', 'right elbow', 'left elbow'],
      segmentAngles: ['right arm', 'left arm', 'right forearm', 'left forearm'],
      reviewQuestion: 'O alcance alto coincide com o momento do bloqueio?',
    };
  }

  return {
    focus: 'braco alto, ombro e cotovelo no contato',
    jointAngles: ['right shoulder', 'left shoulder', 'right elbow', 'left elbow'],
    segmentAngles: ['right arm', 'left arm', 'right forearm', 'left forearm'],
    reviewQuestion: 'O braco alto coincide com o contato do saque ou ataque?',
  };
}

function sports2dCommandFor(clip, anglePlan) {
  const resultDir = dirname(clip.sports2dAngles).replace(/\\/g, '/');
  const argv = [
    'sports2d',
    '--video_input',
    clip.sourceVideo,
    '--result_dir',
    resultDir,
    '--show_realtime_results',
    'false',
    '--save_vid',
    'false',
    '--save_img',
    'false',
    '--calculate_angles',
    'true',
    '--save_angles',
    'true',
    '--joint_angles',
    ...anglePlan.jointAngles,
    '--segment_angles',
    ...anglePlan.segmentAngles,
  ];

  return {
    argv,
    shell: argv.map(quoteShell).join(' '),
  };
}

function postRunCopyCommand(clip) {
  const resultDir = dirname(clip.sports2dAngles).replace(/\\/g, '/');
  return `$file = Get-ChildItem -Path ${quotePowerShell(resultDir)} -Include *.mot,*.csv -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1; if ($file) { Copy-Item -LiteralPath $file.FullName -Destination ${quotePowerShell(clip.sports2dAngles)} -Force }`;
}

try {
  const manifest = directPath ? readJson(directPath) : buildDefaultManifest();
  assert(manifest.schemaVersion === 'isa.video-clip-manifest.v1', 'Manifesto precisa usar isa.video-clip-manifest.v1.');
  assert(Array.isArray(manifest.clips) && manifest.clips.length, 'Manifesto precisa ter clips.');

  const clips = manifest.clips.map((clip) => {
    const anglePlan = anglePlanFor(clip.fundamental, clip.phase);
    const command = sports2dCommandFor(clip, anglePlan);
    return {
      id: clip.id,
      athlete: clip.athlete,
      fundamental: clip.fundamental,
      phase: clip.phase,
      marker: clip.marker,
      metricTargets: clip.metricTargets || [],
      sourceVideo: clip.sourceVideo,
      expectedAngles: clip.sports2dAngles,
      normalizedEvidence: clip.normalizedEvidence,
      anglePlan,
      command,
      postRun: {
        windowsPowerShell: postRunCopyCommand(clip),
        note: 'Use apenas se o Sports2D salvar o .mot/.csv com nome automatico dentro da pasta de resultado.',
      },
      nextCommand: nextProcessCommand,
    };
  });

  const worklist = {
    schemaVersion: 'isa.sports2d-worklist.v1',
    generatedAt: new Date().toISOString(),
    sourceProject: {
      name: 'Sports2D',
      url: 'https://github.com/davidpagnon/Sports2D',
      package: 'sports2d',
    },
    manifestVersion: manifest.schemaVersion,
    candidate: manifest.candidate?.name || 'Sports2D',
    installHint: 'pip install sports2d -U',
    objective: 'Rodar Sports2D nos clips reais de volei e gerar arquivos de angulos para evidencia revisavel.',
    clips: clips.length,
    workItems: clips,
    nextSteps: [
      'Instalar Sports2D localmente em um ambiente Python.',
      'Rodar o comando de cada clip com camera parada e corpo inteiro visivel.',
      'Garantir que o .mot/.csv final esteja no caminho expectedAngles.',
      `Rodar ${nextProcessCommand}.`,
      'Criar checagem manual pareada antes de enviar a evidencia ao relatorio.',
    ],
  };

  const output = `${JSON.stringify(worklist, null, 2)}\n`;
  if (outputPath) writeFileSync(resolve(outputPath), output, 'utf8');
  else process.stdout.write(output);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nao foi possivel montar a worklist Sports2D.');
  process.exit(1);
}
