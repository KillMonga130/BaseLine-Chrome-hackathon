const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Simple prefetcher: fetches features matching a query and writes to data/webstatus-cache.json
async function queryWebStatus(query) {
  const base = 'https://api.webstatus.dev/v1/features?q=';
  const url = base + encodeURIComponent(query) + '&limit=100';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function run() {
  const outPath = path.join(__dirname, '..', 'data', 'webstatus-cache.json');
  const queries = [
    '-baseline_status:limited',
    'group:css AND -baseline_status:limited'
  ];
  const results = {};
  for (const q of queries) {
    try {
      const data = await queryWebStatus(q);
      results[q] = data;
    } catch (e) {
      console.error('Query failed for', q, e.message);
    }
  }
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Wrote webstatus cache to', outPath);
}

if (require.main === module) run().catch(err => { console.error(err); process.exit(2); });
