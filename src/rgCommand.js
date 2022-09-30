import { spawn } from 'child_process';
import Promise from 'bluebird';
import { getRgPath } from './rgProvider.js';
import { unprefixFilePath } from './utils.js';


function handleRgJsonData(data, prevUnparsedResult) {
  return prevUnparsedResult += data;
}
function parseResult(unparsedResult) {
  let rgResult = {};
  let stats = {};
  const jsons = unparsedResult.split('\n');
  jsons.forEach((json, idx) => {
    if (!json) return;
    const { type, data } = JSON.parse(json);
    const { path, lines, line_number: lineNumber, submatches } = data;
    if (type === 'match') {
      const filePath = unprefixFilePath(path.text);
      if (!rgResult[filePath]) {
        rgResult[filePath] = { entries: {} };
      }
      rgResult[filePath].entries[lineNumber] = {
        matchString: lines.text,
        submatches
      };
      return;
    }
    if (type === 'summary') {
      stats.matches = data.stats.matches;
      stats.filesContainedMatches = data.stats.searches_with_match;
      stats.matchedLines = data.stats.matched_lines;
      return;
    }
    // ignore other json types
  });
  return {rgResult, stats};
}

export function rgJsonCommand(ignoreCase, maxFilesize, pattern, searchPath) {
  const rgPath = getRgPath();
  return new Promise((resolve, reject) => {
    let rgOptions = ['--json', '--hidden'];
    // TODO: allow configure which patterns is regex, and which not
    rgOptions.push('--fixed-strings');
    if (ignoreCase) rgOptions.push('--ignore-case');
    if (maxFilesize) rgOptions.push('--max-filesize', maxFilesize);
    const rgCmd = spawn(rgPath, [...rgOptions, pattern, searchPath]);
    rgCmd.stderr.on('data', (data) => {
      reject(new Error(data));
    });
    let unparsedResult = '';
    rgCmd.stdout.on('data', (data) => {
      unparsedResult = handleRgJsonData(data, unparsedResult);
    });
    rgCmd.on('close', (code) => {
      // 0 is ok, 1 is no matches, 2 is error
      if (code !== 0 && code !== 1) {
        console.warn(`ripgrep was closed with code ${code}`);
      }
      const {rgResult, stats} = parseResult(unparsedResult);
      resolve({ result: rgResult, stats });
    });
    rgCmd.on('error', err => {
      if (err.code === 'ENOENT') {
        console.error('Error: ripgrep package is not installed, please follow instructions from here: https://github.com/BurntSushi/ripgrep#installation');
        process.exit(2);
      }
      reject(err);
    });
  });
};
