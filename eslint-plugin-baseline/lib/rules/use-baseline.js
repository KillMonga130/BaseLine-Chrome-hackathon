/**
 * ESLint rule: warn when a CSS property-value pair is not Baseline.
 * Note: This example is simplified and intended for demo purposes only.
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'node_modules', 'web-features', 'data.json');
let features = {};
try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const parsed = JSON.parse(raw);
  features = parsed.features || parsed;
} catch (e) {
  // If web-features isn't installed, features will be empty and rule will be inert.
}

function mapPropertyToBcd(property) {
  return `css.properties.${property}`;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Warn when using non-Baseline CSS feature values' },
    schema: []
  },
  create(context) {
    return {
      Program() {
        // Simple demo: read file text and regex for property:value pairs
        const source = context.getSourceCode().getText();
        const declRe = /([a-zA-Z-]+)\s*:\s*([^;\n}]+)\s*;/g;
        let m;
        while ((m = declRe.exec(source)) !== null) {
          const prop = m[1];
          const value = m[2].trim();
          const bcdKey = mapPropertyToBcd(prop);
          const bcdValueKey = `${bcdKey}.${value}`;

          // Find feature that contains compat feature
          let found = null;
          for (const k of Object.keys(features || {})) {
            const f = features[k];
            if (f.compat_features && f.compat_features.includes(bcdValueKey)) {
              found = f; break;
            }
          }
          if (found && found.status && found.status.baseline === false) {
            context.report({ message: `${prop}: ${value} is not Baseline`, loc: { line: 1, column: 0 } });
          }
        }
      }
    };
  }
};
