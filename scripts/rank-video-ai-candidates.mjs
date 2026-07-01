import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inputPath = resolve('reference/video-ai-project-candidates.json');
const schemaVersion = 'isa.video-ai-project-candidates.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function scoreTotal(candidate) {
  const score = candidate.score || {};
  return ['license', 'volleyballFit', 'integration', 'mvpValue']
    .reduce((total, key) => total + Number(score[key] || 0), 0);
}

const dataset = JSON.parse(readFileSync(inputPath, 'utf8'));
assert(dataset.schemaVersion === schemaVersion, `schemaVersion precisa ser ${schemaVersion}.`);
assert(Array.isArray(dataset.candidates) && dataset.candidates.length, 'candidates precisa ser uma lista preenchida.');

const ranked = dataset.candidates.map((candidate) => {
  assert(candidate.name, 'Cada candidato precisa de name.');
  assert(candidate.url, `${candidate.name} precisa de url.`);
  assert(candidate.license, `${candidate.name} precisa de license.`);
  assert(candidate.priority, `${candidate.name} precisa de priority.`);
  assert(candidate.nextTest, `${candidate.name} precisa de nextTest.`);
  const total = scoreTotal(candidate);
  assert(total > 0, `${candidate.name} precisa de score util.`);
  return {
    name: candidate.name,
    priority: candidate.priority,
    license: candidate.license,
    total,
    nextTest: candidate.nextTest,
  };
}).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

process.stdout.write(`${JSON.stringify({
  status: 'ok',
  schemaVersion: dataset.schemaVersion,
  candidates: ranked.length,
  recommendedPilot: ranked[0],
  ranking: ranked,
}, null, 2)}\n`);
