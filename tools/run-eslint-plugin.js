const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');

async function run() {
  const pluginPath = path.join(__dirname, '..', 'eslint-plugin-baseline', 'lib');
  const plugin = require(pluginPath);

  const eslint = new ESLint({
    overrideConfig: {
      overrides: [
        {
          files: ['**/*.css'],
          plugins: ['baseline'],
          rules: { 'baseline/use-baseline': 'warn' }
        }
      ]
    },
    resolvePluginsRelativeTo: path.join(__dirname, '..')
  });

  const filePath = path.join(__dirname, '..', 'example', 'styles.css');
  const text = fs.readFileSync(filePath, 'utf8');
  const results = await eslint.lintText(text, { filePath });
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);
  console.log(resultText || 'No problems found');
}

run().catch(err => { console.error(err); process.exitCode = 2; });
