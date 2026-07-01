import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const schemaVersion = 'isa.video-ai-environment-report.v1';
const timeout = 20000;
const localVenvDir = resolve('.venv-video-ai');

function run(command, args = []) {
  const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
  const result = spawnSync(executable, args, {
    encoding: 'utf8',
    timeout,
    windowsHide: true,
  });
  return {
    command: [command, ...args].join(' '),
    ok: !result.error && result.status === 0,
    status: result.status,
    error: result.error?.message || '',
    stdout: String(result.stdout || '').trim().slice(-1200),
    stderr: String(result.stderr || '').trim().slice(-1200),
  };
}

function pythonInstallPrefix(candidate) {
  if (!candidate?.command) return '';
  if (candidate.command === 'py -3') return 'py -3';
  return candidate.command;
}

function commandPath(command) {
  const result = process.platform === 'win32'
    ? run('where', [command])
    : run('sh', ['-lc', `command -v ${command}`]);
  return {
    command,
    available: result.ok,
    path: result.stdout.split(/\r?\n/).filter(Boolean)[0] || '',
    stderr: result.stderr,
  };
}

function localVenvPythonPath() {
  return process.platform === 'win32'
    ? resolve(localVenvDir, 'Scripts', 'python.exe')
    : resolve(localVenvDir, 'bin', 'python');
}

function localVenvSports2DPath() {
  return process.platform === 'win32'
    ? resolve(localVenvDir, 'Scripts', 'sports2d.exe')
    : resolve(localVenvDir, 'bin', 'sports2d');
}

function pythonCandidate(command, args = ['--version']) {
  const version = run(command, args);
  const pip = version.ok ? run(command, [...args.slice(0, -1), '-m', 'pip', '--version']) : null;
  const sports2d = version.ok ? run(command, [...args.slice(0, -1), '-m', 'pip', 'show', 'sports2d']) : null;
  return {
    command: [command, ...args.slice(0, -1)].join(' ').trim(),
    available: version.ok,
    version: version.stdout || version.stderr,
    pipAvailable: Boolean(pip?.ok),
    pipVersion: pip?.stdout || pip?.stderr || '',
    sports2dPackageInstalled: Boolean(sports2d?.ok),
    sports2dPackageVersion: sports2d?.stdout?.match(/^Version:\s*(.+)$/m)?.[1] || '',
  };
}

function directPythonCandidate(path, label) {
  if (!existsSync(path)) {
    return {
      command: label,
      available: false,
      version: '',
      pipAvailable: false,
      pipVersion: '',
      sports2dPackageInstalled: false,
      sports2dPackageVersion: '',
    };
  }
  return pythonCandidate(path, ['--version']);
}

function directCommandPath(command, path) {
  return {
    command,
    available: existsSync(path),
    path: existsSync(path) ? path : '',
    stderr: '',
  };
}

function includesAppControlBlock(result) {
  const text = `${result.error || ''}\n${result.stderr || ''}\n${result.stdout || ''}`.toLowerCase();
  return text.includes('controle de aplicativo') || text.includes('application control') || text.includes('blocked');
}

function sports2DSmoke({ localPythonPath, localSports2DPath }) {
  const checks = [];

  if (existsSync(localPythonPath)) {
    checks.push({
      id: 'python-module-import',
      ...run(localPythonPath, ['-c', 'import Sports2D.Sports2D; print("sports2d-module-ok")']),
    });
    checks.push({
      id: 'python-module-help',
      ...run(localPythonPath, ['-m', 'Sports2D.Sports2D', '--help']),
    });
  }

  if (existsSync(localSports2DPath)) {
    checks.push({
      id: 'local-cli-help',
      ...run(localSports2DPath, ['--help']),
    });
  }

  const runnable = checks.some((check) => check.ok);
  const blocked = checks.some(includesAppControlBlock);
  return {
    runnable,
    blockedByAppControl: blocked,
    checks,
  };
}

const nodeVersion = run('node', ['--version']);
const npmExecutable = process.env.npm_execpath || '';
const npmVersion = npmExecutable ? run('node', [npmExecutable, '--version']) : run('npm', ['--version']);
const localPythonPath = localVenvPythonPath();
const localSports2DPath = localVenvSports2DPath();
const sports2dCli = [
  directCommandPath('local sports2d', localSports2DPath),
  commandPath('sports2d'),
  commandPath('sports2D'),
];
const availableSports2dCli = sports2dCli.find((item) => item.available);
const pythonCandidates = [
  directPythonCandidate(localPythonPath, 'local .venv-video-ai'),
  pythonCandidate('py', ['-3', '--version']),
  pythonCandidate('python', ['--version']),
  pythonCandidate('python3', ['--version']),
];
const bestPython = pythonCandidates.find((item) => item.available);
const sports2dPackage = pythonCandidates.find((item) => item.sports2dPackageInstalled);
const sports2dSmoke = sports2DSmoke({ localPythonPath, localSports2DPath });
const mediaPipeBrowser = {
  integration: 'browser-sdk',
  package: '@mediapipe/tasks-vision',
  configuredInApp: true,
  note: 'A tela Videos carrega MediaPipe Pose Landmarker no navegador; confirme pelo botao Verificar MediaPipe.',
};

const status = sports2dPackage && sports2dSmoke.blockedByAppControl
  ? 'blocked-by-app-control'
  : availableSports2dCli && sports2dPackage && sports2dSmoke.runnable
  ? 'ready-for-real-clips'
  : bestPython
    ? 'needs-sports2d-install'
    : 'needs-python';

const installPrefix = pythonInstallPrefix(bestPython);
const installCommand = installPrefix
  ? `${installPrefix} -m pip install sports2d --upgrade`
    : 'Instalar Python 3 e depois rodar python -m pip install sports2d --upgrade';
const setupCommand = 'npm run video:env:setup';

const nextAction = status === 'ready-for-real-clips'
  ? 'Colocar 3 clips reais no manifesto e rodar npm run video:sports2d:run -- --execute.'
  : status === 'blocked-by-app-control'
    ? 'A politica de Controle de Aplicativo bloqueou componentes do Sports2D. Use um ambiente permitido, como WSL/Conda liberado, ou ajuste a politica antes de executar clips reais.'
  : status === 'needs-sports2d-install'
    ? `Preparar ambiente local com ${setupCommand} ou instalar Sports2D no Python ativo: ${installCommand}`
    : 'Instalar Python 3 antes de rodar Sports2D.';

process.stdout.write(`${JSON.stringify({
  status,
  schemaVersion,
  checkedAt: new Date().toISOString(),
  platform: process.platform,
  node: {
    available: nodeVersion.ok,
    version: nodeVersion.stdout || nodeVersion.stderr,
  },
  npm: {
    available: npmVersion.ok,
    version: npmVersion.stdout || npmVersion.stderr,
    executable: npmExecutable,
  },
  pythonCandidates,
  localEnvironment: {
    venvDir: localVenvDir,
    pythonPath: localPythonPath,
    sports2dPath: localSports2DPath,
    exists: existsSync(localPythonPath),
    setupCommand,
  },
  sports2dCli,
  sports2d: {
    cliAvailable: Boolean(availableSports2dCli),
    cliCommand: availableSports2dCli?.command || '',
    cliPath: availableSports2dCli?.path || '',
    packageInstalled: Boolean(sports2dPackage),
    packagePython: sports2dPackage?.command || '',
    packageVersion: sports2dPackage?.sports2dPackageVersion || '',
    installCommand,
    setupCommand,
    smoke: sports2dSmoke,
  },
  mediaPipeBrowser,
  nextAction,
}, null, 2)}\n`);
