import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const files = [
  ['.env.example', '.env'],
  ['apps/demo-web/.env.example', 'apps/demo-web/.env.local']
];

for (const [source, target] of files) {
  const sourcePath = resolve(process.cwd(), source);
  const targetPath = resolve(process.cwd(), target);

  if (!existsSync(sourcePath)) {
    console.warn(`Skipped ${target} because ${source} does not exist.`);
    continue;
  }

  if (existsSync(targetPath)) {
    console.log(`Kept existing ${target}.`);
    continue;
  }

  copyFileSync(sourcePath, targetPath);
  console.log(`Created ${target} from ${source}.`);
}
