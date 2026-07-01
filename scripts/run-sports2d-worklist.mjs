import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const directPath = args[0] && !args[0].startsWith('--') ? args[0] : '';
const execute = args.includes('--execute');
const force = args.includes('--force');
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

function buildDefaultWorklist() {
  const buildArgs = [
    'scripts/build-sports2d-worklist.mjs',
    '--calibration',
    argValue('--calibration', 'reference/sample-video-calibration-dataset.json'),
    '--candidate',
    argValue('--candidate', 'Sports2D'),
  ];
  if (fromGaps) buildArgs.push('--from-gaps');
  return JSON.parse(execFileSync('node', buildArgs, { encoding: 'utf8' }));
}

function buildWorklistFromManifest(path) {
  return JSON.parse(execFileSync('node', [
    'scripts/build-sports2d-worklist.mjs',
    path,
  ], { encoding: 'utf8' }));
}

function loadWorklist() {
  if (!directPath) return buildDefaultWorklist();
  const payload = readJson(directPath);
  if (payload.schemaVersion === 'isa.sports2d-worklist.v1') return payload;
  if (payload.schemaVersion === 'isa.video-clip-manifest.v1') return buildWorklistFromManifest(directPath);
  throw new Error('Entrada precisa usar isa.sports2d-worklist.v1 ou isa.video-clip-manifest.v1.');
}

function commandExists(command) {
  const localCommand = process.platform === 'win32'
    ? resolve('.venv-video-ai', 'Scripts', `${command}.exe`)
    : resolve('.venv-video-ai', 'bin', command);
  if (existsSync(localCommand)) {
    const smoke = spawnSync(localCommand, ['--help'], {
      encoding: 'utf8',
      timeout: 20000,
      windowsHide: true,
    });
    if (smoke.status !== 0 || smoke.error) {
      const text = `${smoke.error?.message || ''}\n${smoke.stderr || ''}\n${smoke.stdout || ''}`.toLowerCase();
      const localPython = process.platform === 'win32'
        ? resolve('.venv-video-ai', 'Scripts', 'python.exe')
        : resolve('.venv-video-ai', 'bin', 'python');
      const moduleSmoke = existsSync(localPython)
        ? spawnSync(localPython, ['-c', 'import Sports2D.Sports2D'], {
          encoding: 'utf8',
          timeout: 20000,
          windowsHide: true,
        })
        : null;
      const moduleText = moduleSmoke
        ? `${moduleSmoke.error?.message || ''}\n${moduleSmoke.stderr || ''}\n${moduleSmoke.stdout || ''}`.toLowerCase()
        : '';
      const blocked = text.includes('controle de aplicativo')
        || text.includes('application control')
        || text.includes('blocked')
        || moduleText.includes('controle de aplicativo')
        || moduleText.includes('application control')
        || moduleText.includes('blocked');
      return {
        available: false,
        status: smoke.status,
        error: smoke.error?.message || '',
        stderr: (smoke.stderr || moduleSmoke?.stderr || '').slice(-600),
        path: localCommand,
        blockedByAppControl: blocked,
        hint: blocked
          ? 'A politica de Controle de Aplicativo bloqueou o Sports2D local. Use WSL/Conda liberado ou ajuste a politica antes de executar clips reais.'
          : 'Sports2D local existe, mas falhou no smoke test. Rode npm run video:env para diagnosticar.',
      };
    }
    return {
      available: true,
      status: 0,
      error: '',
      stderr: '',
      path: localCommand,
      hint: '',
    };
  }

  const result = process.platform === 'win32'
    ? spawnSync('where', [command], { encoding: 'utf8', timeout: 20000 })
    : spawnSync('sh', ['-lc', `command -v ${command}`], { encoding: 'utf8', timeout: 20000 });

  return {
    available: !result.error && result.status === 0,
    status: result.status,
    error: result.error?.message || '',
    stderr: result.stderr?.slice(-600) || '',
    path: result.stdout?.split(/\r?\n/).filter(Boolean)[0] || '',
    hint: result.error || result.status !== 0
      ? 'Rode npm run video:env:setup para criar o ambiente local ou ative o Python onde Sports2D esta instalado.'
      : '',
  };
}

function runCommand(item, baseDir, executablePath = '') {
  const command = executablePath || item.command?.argv?.[0];
  const commandArgs = item.command?.argv?.slice(1) || [];
  if (!command) return { status: 'skipped', reason: 'Comando ausente na worklist.' };

  const result = spawnSync(command, commandArgs, {
    cwd: baseDir,
    encoding: 'utf8',
    timeout: Number(argValue('--timeout-ms', '120000')),
    windowsHide: true,
  });

  if (result.error) {
    return {
      status: 'failed',
      reason: result.error.message,
      stdout: result.stdout?.slice(-1200) || '',
      stderr: result.stderr?.slice(-1200) || '',
    };
  }

  return {
    status: result.status === 0 ? 'ran' : 'failed',
    exitCode: result.status,
    stdout: result.stdout?.slice(-1200) || '',
    stderr: result.stderr?.slice(-1200) || '',
  };
}

try {
  const worklist = loadWorklist();
  if (worklist.schemaVersion !== 'isa.sports2d-worklist.v1') {
    throw new Error('Worklist precisa usar isa.sports2d-worklist.v1.');
  }

  const baseDir = resolve(argValue('--base', '.'));
  const sports2d = commandExists('sports2d');
  const limit = Number(argValue('--limit', '0'));
  const selectedItems = limit > 0 ? worklist.workItems.slice(0, limit) : worklist.workItems;

  const items = selectedItems.map((item) => {
    const sourceVideoPath = resolve(baseDir, item.sourceVideo);
    const expectedAnglesPath = resolve(baseDir, item.expectedAngles);
    const sourceVideoExists = existsSync(sourceVideoPath);
    const expectedAnglesExists = existsSync(expectedAnglesPath);
    const shouldRun = execute && sports2d.available && sourceVideoExists && (force || !expectedAnglesExists);
    const run = shouldRun ? runCommand(item, baseDir, sports2d.path) : null;
    const finalAnglesExists = existsSync(expectedAnglesPath);

    const itemStatus = !sourceVideoExists
      ? 'needs-video'
      : finalAnglesExists && !force
        ? 'has-angles'
        : sports2d.blockedByAppControl
          ? 'blocked-by-app-control'
        : !sports2d.available
          ? 'needs-sports2d'
          : execute && run?.status === 'ran' && !finalAnglesExists
            ? 'ran-needs-angles'
            : execute
              ? run?.status || 'not-run'
              : 'ready-to-run';

    return {
      id: item.id,
      athlete: item.athlete,
      fundamental: item.fundamental,
      phase: item.phase,
      metricTargets: item.metricTargets || [],
      sourceVideo: item.sourceVideo,
      expectedAngles: item.expectedAngles,
      sourceVideoExists,
      expectedAnglesExists: finalAnglesExists,
      plannedCommand: item.command?.shell || '',
      run,
      status: itemStatus,
      nextAction: !sourceVideoExists
        ? 'Colocar o video bruto no caminho sourceVideo do manifesto.'
        : finalAnglesExists && !force
        ? `Rodar ${nextProcessCommand} para normalizar a evidencia.`
          : sports2d.blockedByAppControl
            ? sports2d.hint
          : !sports2d.available
            ? sports2d.hint
            : itemStatus === 'ran-needs-angles'
              ? 'O comando rodou, mas o arquivo expectedAngles ainda nao existe. Copie o .mot/.csv gerado para esse caminho.'
              : execute
              ? 'Conferir se o arquivo expectedAngles foi criado antes de processar evidencias.'
              : 'Rodar novamente com -- --execute para executar Sports2D neste clip.',
    };
  });

  const missingVideos = items.filter((item) => !item.sourceVideoExists).length;
  const readyToRun = items.filter((item) => item.status === 'ready-to-run').length;
  const hasAngles = items.filter((item) => item.status === 'has-angles').length;
  const ran = items.filter((item) => item.run?.status === 'ran').length;
  const ranNeedsAngles = items.filter((item) => item.status === 'ran-needs-angles').length;
  const failed = items.filter((item) => item.run?.status === 'failed').length;
  const blockedByAppControl = items.filter((item) => item.status === 'blocked-by-app-control').length;

  const status = missingVideos
    ? 'needs-videos'
    : hasAngles === items.length
      ? 'has-angles'
    : blockedByAppControl
      ? 'blocked-by-app-control'
    : !sports2d.available
      ? 'needs-sports2d'
      : failed
      ? 'failed'
      : ranNeedsAngles
        ? 'ran-needs-angles'
      : execute && ran
        ? 'ran'
        : readyToRun
          ? 'ready-to-run'
          : 'checked';

  process.stdout.write(`${JSON.stringify({
    status,
    schemaVersion: 'isa.sports2d-run-report.v1',
    worklistVersion: worklist.schemaVersion,
    execute,
    force,
    baseDir,
    sports2d,
    clips: items.length,
    missingVideos,
    readyToRun,
    hasAngles,
    ran,
    ranNeedsAngles,
    failed,
    blockedByAppControl,
    items,
    nextCommand: nextProcessCommand,
  }, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nao foi possivel rodar a worklist Sports2D.');
  process.exit(1);
}
