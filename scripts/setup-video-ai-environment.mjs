import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const venvDir = resolve(argValue('--venv', '.venv-video-ai'));
const pythonCommand = argValue('--python', 'python');
const timeout = Number(argValue('--timeout-ms', '600000'));

function argValue(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function run(command, commandArgs = []) {
  const result = spawnSync(command, commandArgs, {
    encoding: 'utf8',
    timeout,
    windowsHide: true,
  });
  return {
    command: [command, ...commandArgs].join(' '),
    ok: !result.error && result.status === 0,
    status: result.status,
    error: result.error?.message || '',
    stdout: String(result.stdout || '').trim().slice(-2000),
    stderr: String(result.stderr || '').trim().slice(-2000),
  };
}

function venvPythonPath() {
  return process.platform === 'win32'
    ? resolve(venvDir, 'Scripts', 'python.exe')
    : resolve(venvDir, 'bin', 'python');
}

function venvSports2DPath() {
  return process.platform === 'win32'
    ? resolve(venvDir, 'Scripts', 'sports2d.exe')
    : resolve(venvDir, 'bin', 'sports2d');
}

function includesAppControlBlock(result) {
  const text = `${result.error || ''}\n${result.stderr || ''}\n${result.stdout || ''}`.toLowerCase();
  return text.includes('controle de aplicativo') || text.includes('application control') || text.includes('blocked');
}

const steps = [];
const pythonPath = venvPythonPath();
const sports2dPath = venvSports2DPath();

try {
  if (!existsSync(pythonPath)) {
    steps.push({
      step: 'create-venv',
      ...run(pythonCommand, ['-m', 'venv', venvDir]),
    });
  } else {
    steps.push({
      step: 'create-venv',
      ok: true,
      skipped: true,
      reason: 'Ambiente virtual ja existe.',
    });
  }

  if (!existsSync(pythonPath)) {
    throw new Error(`Python do ambiente local nao foi criado em ${pythonPath}.`);
  }

  steps.push({
    step: 'upgrade-pip',
    ...run(pythonPath, ['-m', 'pip', 'install', '--upgrade', 'pip']),
  });

  steps.push({
    step: 'install-sports2d',
    ...run(pythonPath, ['-m', 'pip', 'install', '--upgrade', 'sports2d']),
  });

  const sports2dCheck = run(pythonPath, ['-m', 'pip', 'show', 'sports2d']);
  steps.push({
    step: 'check-sports2d-package',
    ...sports2dCheck,
  });

  const smokeImport = run(pythonPath, ['-c', 'import Sports2D.Sports2D; print("sports2d-module-ok")']);
  steps.push({
    step: 'smoke-import-sports2d',
    ...smokeImport,
  });

  const smokeCli = existsSync(sports2dPath)
    ? run(sports2dPath, ['--help'])
    : { ok: false, error: 'sports2d CLI ausente.', stderr: '', stdout: '' };
  steps.push({
    step: 'smoke-cli-sports2d',
    ...smokeCli,
  });

  const blockedByAppControl = [smokeImport, smokeCli].some(includesAppControlBlock);
  const status = sports2dCheck.ok && blockedByAppControl
    ? 'installed-but-blocked'
    : sports2dCheck.ok && existsSync(sports2dPath) && (smokeImport.ok || smokeCli.ok)
    ? 'ready'
    : sports2dCheck.ok
      ? 'package-installed-cli-missing'
      : 'failed';

  process.stdout.write(`${JSON.stringify({
    status,
    schemaVersion: 'isa.video-ai-environment-setup.v1',
    venvDir,
    pythonPath,
    sports2dPath,
    sports2dCliExists: existsSync(sports2dPath),
    sports2dPackageVersion: sports2dCheck.stdout.match(/^Version:\s*(.+)$/m)?.[1] || '',
    blockedByAppControl,
    steps,
    nextCommand: 'npm run video:env',
  }, null, 2)}\n`);

  if (status === 'failed') process.exit(1);
} catch (error) {
  process.stdout.write(`${JSON.stringify({
    status: 'failed',
    schemaVersion: 'isa.video-ai-environment-setup.v1',
    venvDir,
    pythonPath,
    sports2dPath,
    steps,
    error: error instanceof Error ? error.message : 'Nao foi possivel preparar ambiente de video IA.',
  }, null, 2)}\n`);
  process.exit(1);
}
