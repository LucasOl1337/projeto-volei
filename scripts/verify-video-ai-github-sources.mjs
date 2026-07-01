import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import https from 'node:https';

const inputPath = resolve('reference/video-ai-source-audit.json');
const schemaVersion = 'isa.video-ai-source-audit.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function githubGet(repo) {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${repo}`,
    headers: {
      'User-Agent': 'ProjetoIsaVideoAudit',
      Accept: 'application/vnd.github+json',
    },
    timeout: 15000,
  };

  return new Promise((resolveRequest, rejectRequest) => {
    const request = https.get(options, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          rejectRequest(new Error(`GitHub ${repo} retornou HTTP ${response.statusCode}.`));
          return;
        }
        try {
          resolveRequest(JSON.parse(body));
        } catch (error) {
          rejectRequest(error);
        }
      });
    });
    request.on('timeout', () => {
      request.destroy(new Error(`Timeout ao consultar ${repo}.`));
    });
    request.on('error', rejectRequest);
  });
}

function expectedLicense(source) {
  if (source.githubLicense) return source.githubLicense;
  if (/no license/i.test(source.license || '')) return 'NOASSERTION';
  return source.license;
}

function licenseMatches(expected, actual) {
  if (!expected) return true;
  return String(expected).toLowerCase() === String(actual).toLowerCase();
}

const audit = JSON.parse(readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));
assert(audit.schemaVersion === schemaVersion, `schemaVersion precisa ser ${schemaVersion}.`);
assert(Array.isArray(audit.sources) && audit.sources.length, 'sources precisa ser uma lista preenchida.');

const githubSources = audit.sources.filter((source) => source.githubRepo);
assert(githubSources.length, 'Pelo menos uma fonte precisa de githubRepo para verificacao.');

const checks = [];
for (const source of githubSources) {
  try {
    const repo = await githubGet(source.githubRepo);
    const actualLicense = repo.license?.spdx_id || 'NOASSERTION';
    const expected = expectedLicense(source);
    checks.push({
      name: source.name,
      repo: source.githubRepo,
      expectedLicense: expected,
      actualLicense,
      licenseMatches: licenseMatches(expected, actualLicense),
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
      archived: Boolean(repo.archived),
      private: Boolean(repo.private),
      description: repo.description || '',
    });
  } catch (error) {
    checks.push({
      name: source.name,
      repo: source.githubRepo,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const errors = checks.flatMap((check) => {
  const problems = [];
  if (check.error) problems.push(`${check.repo}: ${check.error}`);
  if (check.private) problems.push(`${check.repo}: repositorio privado.`);
  if (check.archived) problems.push(`${check.repo}: repositorio arquivado.`);
  if (check.licenseMatches === false) {
    problems.push(`${check.repo}: licenca esperada ${check.expectedLicense}, GitHub retornou ${check.actualLicense}.`);
  }
  return problems;
});

const output = {
  status: errors.length ? 'needs-review' : 'ok',
  schemaVersion: audit.schemaVersion,
  verifiedAt: new Date().toISOString().slice(0, 10),
  githubSources: githubSources.length,
  errors,
  checks,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
if (errors.length) process.exitCode = 1;
