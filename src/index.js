#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Minimal demo: show how baseline (web-features) could be used.
// This demo won't call the network; it expects the 'web-features' package
// to be installed. If it's missing, we print a helpful message.

function loadWebFeatures() {
  try {
    const wf = require('web-features');
    return wf;
  } catch (e) {
    return null;
  }
}

function main() {
  console.log('Baseline Tooling Starter CLI');
  const wf = loadWebFeatures();
  if (!wf) {
    console.log('\nThe `web-features` package was not found.');
    console.log('Install dependencies with: npm install');
    console.log('Or run `npm run demo` to see the offline demo.');
    process.exit(0);
  }

  // Example usage if package provides `getFeature`.
  if (typeof wf.getFeature === 'function') {
    const feat = wf.getFeature('CSS.grid') || wf.getFeature('css-grid');
    console.log('\nSample feature entry from web-features:');
    console.log(feat);
  } else {
    console.log('\nLoaded web-features package, but API differs.');
    console.log('Inspect its exports:');
    console.log(Object.keys(wf).slice(0, 40));
  }
}

if (require.main === module) main();
