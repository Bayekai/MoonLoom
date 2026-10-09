const { spawn } = require('node:child_process');
const path = require('node:path');

const child = spawn(process.execPath, [
  path.join(__dirname, '../node_modules/expo/bin/cli'), 'start', '--dev-client', ...process.argv.slice(2),
], { stdio: 'inherit', env: { ...process.env, APP_VARIANT: 'development' } });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
