import fs from 'fs';
import { rgPath } from 'vscode-ripgrep';

export const OVERRIDE_PATH = new URL('../bin/rg', import.meta.url).pathname;

let cachedRgPath = null;

export const getRgPath = () => {
  if (!cachedRgPath) {
    cachedRgPath = fs.existsSync(OVERRIDE_PATH) ? OVERRIDE_PATH : rgPath;
  }
  return cachedRgPath;
};
