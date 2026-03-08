import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const check = spawnSync('forc', ['--version'], { stdio: 'ignore' });

if (check.status !== 0) {
  console.error('forc is not installed or not in PATH. Install Fuel toolchain first: https://docs.fuel.network/docs/forc/getting-started/');
  process.exit(1);
}

const predicateDir = resolve(process.cwd(), 'sway/session-policy-predicate');
const result = spawnSync('forc', ['build'], {
  cwd: predicateDir,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
