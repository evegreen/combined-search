'use strict';

const spawn = require('child_process').spawn;
const Promise = require('bluebird');

module.exports = function rgSearch(ignoreCase, pattern, path, withoutLines = false) {
  return new Promise((resolve, reject) => {
    let rgOptions = withoutLines ? ['--count'] : ['--line-number', '--heading']
    rgOptions.push('--stats');
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
    });
  });
};
