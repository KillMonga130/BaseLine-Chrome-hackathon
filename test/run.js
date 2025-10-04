const { spawnSync } = require('child_process');
const path = require('path');

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8' });
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  if (res.stdout) console.log('STDOUT:\n', res.stdout);
  if (res.stderr) console.log('STDERR:\n', res.stderr);
  return res.status === 0;
}

console.log('Running smoke tests...');
const ok1 = run(process.execPath, [path.join('src','demo.js')]);
console.log('\nSmoke tests ' + (ok1 ? 'PASSED' : 'FAILED'));
process.exit(ok1 ? 0 : 1);
