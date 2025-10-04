// Offline demo: simple baseline-like data and a usage example
const sample = {
  'css-grid': {
    name: 'CSS Grid Layout',
    status: 'recommended',
    baseline: { support: 'broad', notes: 'Use with autoprefixer if targeting legacy' }
  },
  'web-crypto': {
    name: 'Web Crypto API',
    status: 'recommended',
    baseline: { support: 'broad', notes: 'Available in modern browsers' }
  }
};

console.log('Baseline Tooling Starter — offline demo');
console.log('Querying sample features...\n');

for (const k of Object.keys(sample)) {
  const f = sample[k];
  console.log(`- ${f.name} (${k}): ${f.baseline.support} — ${f.baseline.notes}`);
}

console.log('\nIdeas: integrate this data into an ESLint rule, VS Code extension, or CI check.');
