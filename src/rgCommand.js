import { spawn } from 'child_process';
import Promise from 'bluebird';
import { rgPath } from 'vscode-ripgrep';

let unparsedResult = '';
function handleRgJsonData(data) {
  unparsedResult += data;
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
      const filePath = path.text;
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

/*
let tempJsonPart = null;

/**
 * mutable function
 * @param {Buffer} data - Ripgrep stdout json data
 * @param {Object<string, Object>} targetRgResult - Mutable object with results
 * @param {Object<string, any>} targetStats - Mutable object with result stats
 *
function OLD_handleRgJsonData(data, targetRgResult, targetStats) {
  const jsons = String(data).split('\n');
  jsons.forEach((json, idx) => {
    if (idx === jsons.length - 1) {
      if (!json) return;
      // wait next stdout package
      tempJsonPart = json;
      return;
    }
    if (tempJsonPart) {
      // next stdout package received
      json = tempJsonPart + json;
      tempJsonPart = null;
    }
    const { type, data } = JSON.parse(json);
    const { path, lines, line_number: lineNumber, submatches } = data;
    if (type === 'match') {
      const filePath = path.text;
      if (!targetRgResult[filePath]) {
        targetRgResult[filePath] = { entries: {} };
      }
      targetRgResult[filePath].entries[lineNumber] = {
        matchString: lines.text,
        submatches
      };
      return;
    }
    if (type === 'summary') {
      targetStats.matches = data.stats.matches;
      targetStats.filesContainedMatches = data.stats.searches_with_match;
      targetStats.matchedLines = data.stats.matched_lines;
      return;
    }
    // ignore other json types
  });
}
*/

export function rgJsonCommand(ignoreCase, pattern, searchPath) {
  return new Promise((resolve, reject) => {
    let rgOptions = ['--json', '--hidden'];
    // TODO: allow configure which patterns is regex, and which not
    rgOptions.push('--fixed-strings');
    if (ignoreCase) rgOptions.push('--ignore-case');
    const rgCmd = spawn(rgPath, [...rgOptions, pattern, searchPath]);
    rgCmd.stderr.on('data', (data) => {
      reject(new Error(data));
    });
    rgCmd.stdout.on('data', (data) => {
      handleRgJsonData(data);
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
