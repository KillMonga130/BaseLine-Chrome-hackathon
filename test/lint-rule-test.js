const { ESLint } = require('eslint');
const path = require('path');

(async function run() {
  const eslint = new ESLint({
    overrideConfigFile: path.join(process.cwd(), '.eslintrc-baseline.cjs'),
    cwd: process.cwd()
  });

  const results = await eslint.lintFiles([path.join('example', 'styles.js')]);
  const msgs = results[0] && results[0].messages ? results[0].messages : [];
  const found = msgs.some(m => m.ruleId === 'baseline/use-baseline' && m.severity === 1);
  if (found) {
    console.log('OK: baseline/use-baseline warning found');
    process.exit(0);
  }
  console.error('FAIL: expected baseline/use-baseline warning not found');
  console.error(JSON.stringify(msgs, null, 2));
  process.exit(2);
})();
