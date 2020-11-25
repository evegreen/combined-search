'use strict';

const spawn = require('child_process').spawn;
const Promise = require('bluebird');

exports.rgJsonCommand = function rgJsonCommand(ignoreCase, pattern, path) {
  return new Promise((resolve, reject) => {
    let rgOptions = ['--json'];
    // TODO: allow configure which patterns is regex, and which not
    rgOptions.push('--fixed-strings');
    if (ignoreCase) rgOptions.push('--ignore-case');

    const rgCmd = spawn('rg', [...rgOptions, pattern, path]);
    let rgResult = {};
    rgCmd.stderr.on('data', (data) => {
      reject(new Error(data));
    });
    rgCmd.stdout.on('data', (data) => {
      console.log(); // TODO DBG
      console.log(`DBG: ${data}`); // TODO DBG
      const jsons = String(data).split('\n');
      debugger;
      //// CONTINUE HERE: combine jsons data to rgResult;
    });
    rgCmd.on('close', (code) => {
      debugger;
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
