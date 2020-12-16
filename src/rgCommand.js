'use strict';

const spawn = require('child_process').spawn;
const Promise = require('bluebird');

exports.rgJsonCommand = function rgJsonCommand(ignoreCase, pattern, searchPath) {
  return new Promise((resolve, reject) => {
    let rgOptions = ['--json'];
    // TODO: allow configure which patterns is regex, and which not
    rgOptions.push('--fixed-strings');
    if (ignoreCase) rgOptions.push('--ignore-case');

    const rgCmd = spawn('rg', [...rgOptions, pattern, searchPath]);
    let rgResult = {};
    let stats;
    rgCmd.stderr.on('data', (data) => {
      reject(new Error(data));
    });
    rgCmd.stdout.on('data', (data) => {
      const jsons = String(data).split('\n');
      jsons.forEach(json => {
        if (!json) return;
        const { type, data } = JSON.parse(json);
        const { path, lines, line_number: lineNumber, submatches } = data;
        if (type === 'match') {
          const filePath = path.text;
          if (!rgResult[filePath]) {
            rgResult[filePath] = {};
          }
          rgResult[filePath][lineNumber] = {
            matchString: lines.text,
            submatches
          };
        }
        if (type === 'summary') {
          stats = {
            matches: data.stats.matches,
            filesContainedMatches: data.stats.searches_with_match,
            matchedLines: data.stats.matched_lines
          };
        }
        // ignore other json types
      });
      //// need refactor
    });
    rgCmd.on('close', (code) => {
      if (code) {
        console.warn(`ripgrep was closed with code ${code}`);
      }
      resolve({ result: rgResult, stats });
    });
    rgCmd.on('error', err => {
      if (err.code === 'ENOENT') {
        console.error('Error: ripgrep package is not installed, please follow instructions from here: https://github.com/BurntSushi/ripgrep#installation');
        process.exit(1);
      }
      reject(err);
    });
  });
};

//// delete
exports.rgCommand = function rgCommand(ignoreCase, pattern, path) {
  return new Promise((resolve, reject) => {
    let rgOptions = ['--line-number', '--heading', '--stats'];
    // TODO: allow configure which patterns is regex, and which not
    rgOptions.push('--fixed-strings');
    if (ignoreCase) rgOptions.push('--ignore-case');

    const rgCmd = spawn('rg', [...rgOptions, pattern, path]);
    let rgResult = '';
    rgCmd.stderr.on('data', (data) => {
      reject(new Error(data));
    });

    rgCmd.stdout.on('data', (data) => {
      rgResult += data;
    });

    rgCmd.on('close', (code) => {
      resolve(rgResult);
    });

    rgCmd.on('error', err => {
      if (err.code === 'ENOENT') {
        console.error('Error: ripgrep package is not installed, please follow instructions from here: https://github.com/BurntSushi/ripgrep#installation');
        process.exit(1);
      }

      reject(err);
    });
  });
};
