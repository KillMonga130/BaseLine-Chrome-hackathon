/**
 * ESLint rule: warn when a CSS property-value pair is not Baseline.
 * Note: This example is simplified and intended for demo purposes only.
 */
const fs = require('fs');
const path = require('path');

// Try several locations for web-features/data.json: plugin-relative and project root
let features = {};
const candidatePaths = [
  path.join(__dirname, '..', '..', 'node_modules', 'web-features', 'data.json'),
  path.join(process.cwd(), 'node_modules', 'web-features', 'data.json'),
  path.join(__dirname, '..', '..', 'web-features', 'data.json')
];
for (const p of candidatePaths) {
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(raw);
      features = parsed.features || parsed;
      break;
    }
  } catch (e) {
    // ignore and try next
  }
}

// Load curated exceptions
let exceptions = {};
try {
  const exPath = path.join(process.cwd(), 'data', 'exceptions.json');
  if (fs.existsSync(exPath)) exceptions = JSON.parse(fs.readFileSync(exPath, 'utf8'));
} catch (e) {}

// Load webstatus cache if present
let webstatusCache = {};
try {
  const wsPath = path.join(process.cwd(), 'data', 'webstatus-cache.json');
  if (fs.existsSync(wsPath)) webstatusCache = JSON.parse(fs.readFileSync(wsPath, 'utf8'));
} catch (e) {}

// Optional compute-baseline integration (if installed)
let computeBaselineGetStatus = null;
try {
  computeBaselineGetStatus = require('compute-baseline').getStatus;
} catch (e) {
  computeBaselineGetStatus = null;
}

// Optional network lookup support using Web Platform Dashboard (webstatus.dev)
let allowNetwork = process.env.BASELINE_ALLOW_NETWORK === 'true';
let fetchFn = null;
if (allowNetwork) {
  try {
    fetchFn = require('node-fetch');
  } catch (e) {
    fetchFn = null;
  }
}

// Simple in-memory runtime cache for API results
const runtimeCache = new Map();

async function queryWebstatusApi(query) {
  if (!fetchFn) return null;
  if (runtimeCache.has(query)) return runtimeCache.get(query);
  const base = 'https://api.webstatus.dev/v1/features?q=';
  const url = base + encodeURIComponent(query);
  // basic retry
  for (let i=0;i<3;i++) {
    try {
      const res = await fetchFn(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      runtimeCache.set(query, json);
      return json;
    } catch (e) {
      if (i === 2) return null;
      await new Promise(r => setTimeout(r, 200 * (i+1)));
    }
  }
  return null;
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
        const sourceCode = context.getSourceCode();
        const source = sourceCode.getText();
        const declRe = /([a-zA-Z-]+)\s*:\s*([^;\n}]+)\s*;/g;
        let m;
        while ((m = declRe.exec(source)) !== null) {
          const prop = m[1];
          const value = m[2].trim();
          const startIndex = m.index;
          const endIndex = m.index + m[0].length;
          const loc = {
            start: sourceCode.getLocFromIndex(startIndex),
            end: sourceCode.getLocFromIndex(endIndex)
          };
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
          // Try to map the property/value to a BCD compat key and compute Baseline.
          function normalizeToken(s) {
            return (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
          }

          const baseBcd = mapPropertyToBcd(prop);

          // 1) Check curated exceptions
          const exceptionKey = `${baseBcd}.${value}`;
          if (exceptions && exceptions[exceptionKey]) {
            context.report({ message: `${prop}: ${value} is not Baseline (exception) — ${exceptions[exceptionKey].reason}`, loc });
            continue;
          }

          // 2) If compute-baseline is available, prefer it for accurate value-level lookups
          if (computeBaselineGetStatus) {
            try {
              const cb = computeBaselineGetStatus(null, `${baseBcd}.${value}`);
              if (cb && cb.baseline === false) {
                context.report({ message: `${prop}: ${value} is not Baseline (compute-baseline)`, loc });
                continue;
              }
            } catch (e) {
              // ignore and continue
            }
          }

          // Candidate keys that start with baseBcd
          const allFeatures = features || {};
          const candidates = [];
          for (const fk of Object.keys(allFeatures)) {
            const f = allFeatures[fk];
            const cf = f.compat_features || [];
            for (const key of cf) {
              if (key.startsWith(baseBcd + '.')) candidates.push({ feature: f, key });
            }
          }

          // If no direct baseBcd.* candidates, try any compat_features that include baseBcd
          if (candidates.length === 0) {
            for (const fk of Object.keys(allFeatures)) {
              const f = allFeatures[fk];
              const cf = f.compat_features || [];
              for (const key of cf) {
                if (key.indexOf(baseBcd) !== -1) candidates.push({ feature: f, key });
              }
            }
          }

          // Score candidates by how well the value appears in the key
          const valueToken = normalizeToken(value);
          let best = null;
          let bestScore = -1;
          for (const c of candidates) {
            const kval = c.key.toLowerCase();
            let score = 0;
            if (kval.endsWith('.' + valueToken)) score += 10;
            if (kval.indexOf(valueToken) !== -1) score += 5;
            // prefer shorter keys (more specific)
            score += Math.max(0, 5 - kval.split('.').length);
            if (score > bestScore) { bestScore = score; best = c; }
          }

          let reported = false;

          // 3) Use local web-features data if it's a good match
          if (best && best.feature) {
            const st = best.feature.status && (best.feature.status.baseline !== undefined ? best.feature.status.baseline : (best.feature.status && best.feature.status.baseline));
            if (st === false) {
              context.report({ message: `${prop}: ${value} is not Baseline (by BCD key ${best.key})`, loc });
              reported = true;
            }
          }

          // 4) Check webstatus cache results (if available) for a matching entry
          if (!reported && webstatusCache) {
            const keys = Object.keys(webstatusCache || {});
            for (const q of keys) {
              const data = webstatusCache[q];
              if (!data || !data.data) continue;
              for (const feat of data.data) {
                if (feat.feature_id && feat.feature_id.indexOf(prop) !== -1) {
                  if (feat.baseline && feat.baseline.status === 'limited') {
                    context.report({ message: `${prop}: ${value} is not Baseline (webstatus cache)`, loc });
                    reported = true; break;
                  }
                }
              }
              if (reported) break;
            }
          }

          // Fallback: if feature-level info exists for any feature that includes baseBcd
          if (!reported) {
            // Find any feature that includes baseBcd as a compat_features entry
            let feat = null;
            for (const fk of Object.keys(allFeatures)) {
              const f = allFeatures[fk];
              if ((f.compat_features || []).includes(baseBcd)) { feat = f; break; }
            }
            if (feat) {
              const flBaseline = feat.status && feat.status.baseline;
              if (flBaseline === false) {
                context.report({ message: `${prop} (property) is not Baseline (feature-level)`, loc });
                reported = true;
              }
            }
          }
        }
      }
    };
  }
};
