#!/usr/bin/env node
const fs = require('fs');

// Minimal CSS declaration extractor (not a full parser) that finds property: value; pairs.
function extractDeclarations(css) {
  const decls = [];
  // Strip comments
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Find blocks { ... }
  const blockRe = /\{([\s\S]*?)\}/g;
  let m;
  while ((m = blockRe.exec(clean)) !== null) {
    const body = m[1];
    const lines = body.split(/;\s*/);
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const prop = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (prop && value) decls.push({ property: prop, value });
    }
  }
  return decls;
}

async function loadFeatures() {
  try {
    const mod = await import('web-features');
    // web-features is ESM; the features export may be at mod.features
    return mod.features || (mod.default && mod.default.features) || mod.default;
  } catch (e) {
    console.error('Please run `npm install web-features` to enable Baseline lookups.');
    process.exit(1);
  }
}

function getStatus(features, featureId, bcdKey) {
  // Best-effort lookup: if bcdKey provided, find a feature containing it.
  if (bcdKey) {
    const all = Object.values(features);
    for (const f of all) {
      if (f.compat_features && f.compat_features.includes(bcdKey)) {
        return { baseline: f.status && f.status.baseline ? f.status.baseline : false, support: f.status && f.status.support ? f.status.support : {} };
      }
    }
    return null;
  }
  if (featureId && features[featureId]) {
    const f = features[featureId];
    return { baseline: f.status && f.status.baseline ? f.status.baseline : false, support: f.status && f.status.support ? f.status.support : {} };
  }
  return null;
}

function mapPropertyToBcd(property) {
  return `css.properties.${property}`;
}

function lintDeclarations(features, decls) {
  for (const d of decls) {
    const prop = d.property;
    const value = d.value.split('\n')[0].trim();
    const bcdKey = mapPropertyToBcd(prop);
    const bcdValueKey = `${bcdKey}.${value}`;

    const statusValue = getStatus(features, null, bcdValueKey);
    const statusProp = getStatus(features, null, bcdKey);

    if (statusValue && statusValue.baseline === false) {
      console.log(`WARN: ${prop}: ${value} is NOT Baseline (property-value). Support: ${JSON.stringify(statusValue.support)}`);
    } else if (statusValue && statusValue.baseline === 'low') {
      console.log(`INFO: ${prop}: ${value} is Baseline newly available`);
    }

    if (statusProp && statusProp.baseline === false) {
      console.log(`WARN: ${prop} (property) is NOT Baseline. Support: ${JSON.stringify(statusProp.support)}`);
    }
  }
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node tools/lint-css.js <file.css>');
    process.exit(2);
  }
  const features = await loadFeatures();
  const css = fs.readFileSync(file, 'utf8');
  const decls = extractDeclarations(css);
  lintDeclarations(features, decls);
}

if (require.main === module) {
  main();
}
