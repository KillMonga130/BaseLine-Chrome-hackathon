const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
  const dataPath = path.join(context.extensionPath, '..', 'node_modules', 'web-features', 'data.json');
  let features = null;
  try {
    features = JSON.parse(fs.readFileSync(dataPath, 'utf8')).features;
  } catch (e) {
    // ignore — extension will be inert without data
  }

  const provider = {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /[a-zA-Z-]+/);
      if (!range) return null;
      const word = document.getText(range);
      // naive: treat hovered word as property name
      const bcd = `css.properties.${word}`;
      if (!features) return null;
      for (const k of Object.keys(features)) {
        const f = features[k];
        if (f.compat_features && f.compat_features.includes(bcd)) {
          const status = f.status && f.status.baseline ? f.status.baseline : 'limited';
          return new vscode.Hover(`Baseline status: **${status}** — ${f.name}`);
        }
      }
      return null;
    }
  };

  context.subscriptions.push(vscode.languages.registerHoverProvider('css', provider));
}

function deactivate() {}

module.exports = { activate, deactivate };
