import fs from 'fs';

export const OVERRIDE_PATH = new URL('../bin/rg', import.meta.url).pathname;

let isDetermined = false;
let cachedRgPath = null;

/** should called before getRgPath call */
export const determineRgPath = async () => {
  try {
    await fs.promises.access(OVERRIDE_PATH, fs.constants.X_OK);
    cachedRgPath = OVERRIDE_PATH;
  } catch (err) {
    cachedRgPath = await loadVscodeRipgrepPath();
  } finally {
    isDetermined = true;
  }
};

/** should called after determineRgPath call */
export const getRgPath = () => {
  if (!isDetermined) throw new Error('getRgPath called before determineRgPath fn');
  return cachedRgPath;
};


const loadVscodeRipgrepPath = async () => {
  try {
    const vscodeRipgrep = await import('vscode-ripgrep');
    return vscodeRipgrep.rgPath;
  } catch (e) {
    console.error('import of @vscode-ripgrep (vscode-ripgrep) prebuilt package was failed');
  }
}
