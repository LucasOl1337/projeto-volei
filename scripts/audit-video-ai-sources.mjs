import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inputPath = resolve('reference/video-ai-source-audit.json');
const schemaVersion = 'isa.video-ai-source-audit.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function modeRank(source) {
  const order = {
    'external-cli': 5,
    'browser-sdk': 4,
    'reference-later': 3,
    'concept-reference': 2,
    'defer-3d': 1,
  };
  return order[source.integrationMode] || 0;
}

const audit = JSON.parse(readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));
assert(audit.schemaVersion === schemaVersion, `schemaVersion precisa ser ${schemaVersion}.`);
assert(audit.verifiedAt, 'verifiedAt e obrigatorio.');
assert(Array.isArray(audit.sources) && audit.sources.length, 'sources precisa ser uma lista preenchida.');

const sources = audit.sources.map((source) => {
  for (const field of ['name', 'url', 'license', 'observedCapability', 'volleyballFit', 'integrationMode', 'cloneDecision', 'why', 'nextAction']) {
    assert(source[field], `${source.name || 'Fonte'} precisa de ${field}.`);
  }
  return {
    name: source.name,
    license: source.license,
    integrationMode: source.integrationMode,
    cloneDecision: source.cloneDecision,
    nextAction: source.nextAction,
    url: source.url,
  };
}).sort((a, b) => modeRank(b) - modeRank(a) || a.name.localeCompare(b.name));

const cloneNow = sources.filter((source) => source.cloneDecision === 'clone-now');
const externalFirst = sources.filter((source) => ['external-cli', 'browser-sdk'].includes(source.integrationMode));
const referenceOnly = sources.filter((source) => source.cloneDecision !== 'clone-now');

process.stdout.write(`${JSON.stringify({
  status: cloneNow.length ? 'review-clone' : 'no-clone-yet',
  schemaVersion: audit.schemaVersion,
  verifiedAt: audit.verifiedAt,
  sources: sources.length,
  cloneNow: cloneNow.length,
  externalFirst: externalFirst.map((source) => source.name),
  referenceOnly: referenceOnly.length,
  decisionRule: audit.decisionRule,
  recommendedNext: externalFirst[0]?.nextAction || sources[0]?.nextAction || '',
  sourceMap: sources,
}, null, 2)}\n`);
