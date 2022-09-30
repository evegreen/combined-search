import program from 'commander';
import clipboardy from 'clipboardy';
import { getVersions } from './version.js';
import { unprefixFilePath } from './utils.js';

// TODO: improvement: make possible use many search paths, like in ripgrep

export default function parseArgs() {
  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  cs "one pattern"');
    console.log('  cs "Johny Mitchell|Pattern2"');
    console.log('  cs -d "^" "pattern1^pattern2"')
    console.log('  cs -i "pattern1|pattern2" someDirectory/');
    console.log('  cs -s "new |delete "');
    console.log('  cs -c');
    console.log('  cs -M 500K "pattern"');
    console.log();
    console.log('If you started webpack-dev-server (or openEditorService), you may click on search result matches, your editor will open automatically');
    console.log();
    console.log('For using specific version of ripgrep, create bin/rg file or symlink in project root directory');
  });

  program
    .version(getVersions())
    .name('cs')
    .usage('[global options] "entries" [path]')
    .option('-d, --delimiter [value]', 'delimiter for each search entry', '|')
    .option('-i, --ignore-case', 'case-insensitive search')
    .option('-s, --sort-different-matches', 'sort by different matches count desc')
    .option('-c, --clipboard', 'pass patterns from clipboard (experimental)')
    .option('-M, --max-filesize [value]', 'ignore files larger than NUM in size. this does not apply to directories. (rg compatible)')
    .parse(process.argv);

  const options = program.opts();
  const { delimiter, ignoreCase, maxFilesize, sortDifferentMatches, clipboard } = options;

  const argsWithoutPathExpectedLength = clipboard ? 0 : 1;
  const argsExpectedLength = clipboard ? 1 : 2;
  if (program.args.length === argsWithoutPathExpectedLength) {
    program.args.push('./');
    program.rawArgs.push('./');
  }

  if (program.args.length !== argsExpectedLength) {
    console.error('Invalid command\n');
    program.help();
  }

  let patterns;
  let searchPath;
  if (!clipboard) {
    patterns = program.args[0].split(delimiter);
    searchPath = program.args[1];
  } else {
    ////test on windows
    patterns = clipboardy.readSync().split('\n');
    searchPath = program.args[0];
  }
  patterns = patterns.filter(x => x !== '');
  searchPath = unprefixFilePath(searchPath);

  const rawArgsReducer = (acc, rawArg, idx) => {
    let arg = rawArg;
    if (idx === 0 && rawArg.endsWith('/bin/node')) {
      arg = 'node';
    }
    if (idx === 1) {
      if (rawArg.endsWith('/bin/cs')) {
        acc = 'cs ';
        return acc;
      }
      if (rawArg.endsWith('combined-search/cli.js')) {
        arg = 'cli.js';
      }
    }
    arg = unprefixFilePath(arg);
    acc += `${arg} `;
    return acc;
  };
  let unifiedQueryTitle = program.rawArgs.reduce(rawArgsReducer, '');
  if (clipboard) {
    // TODO: use passed delimiter instead of '|' ??
    unifiedQueryTitle = unifiedQueryTitle + `(clipboard: ${patterns.join('|')})`;
  }

  return {
    unifiedQueryTitle,
    patterns,
    searchPath,
    ignoreCase,
    maxFilesize,
    sortByDiffMatchCountArg: sortDifferentMatches
  };
};
