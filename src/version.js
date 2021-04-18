import fs from 'fs';
import { execSync } from 'child_process';
import { rgPath } from 'vscode-ripgrep';

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

export function getVersions() {
  const ripgrepVersion = execSync(`${rgPath} --version`);
  return `combined-search ${packageJson.version}\n${ripgrepVersion}`;
}
