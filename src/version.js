import fs from 'fs';
import { execSync } from 'child_process';
import { getRgPath, OVERRIDE_PATH } from './rgProvider.js';
const rgPath = getRgPath();


const packageJson = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

export function getVersions() {
  const ripgrepVersion = execSync(`${rgPath} --version`);
  return 'combined-search ' + packageJson.version + '\n' + ripgrepVersion +
    (rgPath === OVERRIDE_PATH ? '\nriprgep was overriden in: ' + OVERRIDE_PATH : '');
}
