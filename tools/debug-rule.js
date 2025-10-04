const fs = require('fs');
const path = require('path');

const plugin = require(path.join(__dirname, '..', 'eslint-plugin-baseline', 'lib'));
const rule = plugin.rules && plugin.rules['use-baseline'];
if (!rule) { console.error('rule not found'); process.exit(1); }

const filePath = path.join(__dirname, '..', 'example', 'styles.js');
const text = fs.readFileSync(filePath, 'utf8');

const messages = [];
const context = {
  getSourceCode() { return { getText() { return text; } }; },
  report(descriptor) { messages.push(descriptor && descriptor.message ? descriptor.message : String(descriptor)); }
};

const visitor = rule.create(context);
if (visitor && typeof visitor.Program === 'function') visitor.Program();

console.log('Messages:', messages);
