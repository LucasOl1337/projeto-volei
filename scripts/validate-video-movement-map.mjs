import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inputPath = resolve(process.argv[2] || 'reference/video-ai-movement-metric-map.json');
const schemaVersion = 'isa.video-movement-metric-map.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dataset = JSON.parse(readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));
assert(dataset.schemaVersion === schemaVersion, `schemaVersion precisa ser ${schemaVersion}.`);
assert(Array.isArray(dataset.metrics) && dataset.metrics.length, 'metrics precisa ser uma lista preenchida.');

const keys = new Set();
const metrics = dataset.metrics.map((item) => {
  for (const field of ['fundamental', 'phase', 'signal', 'metric', 'manualCheck', 'nextAction']) {
    assert(item[field], `${item.fundamental || 'Metrica'} precisa de ${field}.`);
  }
  assert(Array.isArray(item.joints) && item.joints.length, `${item.fundamental} precisa de joints.`);
  assert(Array.isArray(item.sources) && item.sources.length, `${item.fundamental} precisa de sources.`);
  const key = `${item.fundamental}::${item.phase}::${item.metric}`;
  assert(!keys.has(key), `Metrica duplicada: ${key}.`);
  keys.add(key);
  return {
    fundamental: item.fundamental,
    phase: item.phase,
    metric: item.metric,
    joints: item.joints.length,
    sources: item.sources,
  };
});

const byFundamental = metrics.reduce((acc, item) => {
  acc[item.fundamental] = (acc[item.fundamental] || 0) + 1;
  return acc;
}, {});

process.stdout.write(`${JSON.stringify({
  status: 'ok',
  schemaVersion: dataset.schemaVersion,
  metrics: metrics.length,
  byFundamental,
  firstRealTest: 'Gravar 3 clips curtos do mesmo fundamento, rodar uma fonte de pose e parear com checagem manual.',
  metricMap: metrics,
}, null, 2)}\n`);
