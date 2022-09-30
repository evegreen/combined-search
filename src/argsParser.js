import program from 'commander';
import clipboardy from 'clipboardy';
import { getVersions } from './version.js';
import { unprefixFilePath } from './utils.js';


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
    console.log('  cs "foo" src/');
    console.log('  cs "bar" src/ scripts/');
    console.log();
    console.log('If you started webpack-dev-server (or openEditorService), you may click on search result matches, your editor will open automatically');
    console.log();
    console.log('For using specific version of ripgrep, create bin/rg file or symlink in project root directory');
  });

  program
    .version(getVersions())
    .name('cs')
    .usage('[GLOBAL OPTIONS] "ENTRIES" [PATH ...]')
    .option('-d, --delimiter [value]', 'delimiter for each search entry', '|')
    .option('-i, --ignore-case', 'case-insensitive search')
    .option('-s, --sort-different-matches', 'sort by different matches count desc')
    .option('-c, --clipboard', 'pass patterns from clipboard (experimental)')
    .option('-M, --max-filesize [value]', 'ignore files larger than NUM in size. this does not apply to directories. (rg compatible)')
    .parse(process.argv);

  const options = program.opts();
  const { delimiter, ignoreCase, maxFilesize, sortDifferentMatches, clipboard } = options;

  const argsWithoutPathExpectedLength = clipboard ? 0 : 1;
  const argsMinLength = clipboard ? 1 : 2;
  if (program.args.length === argsWithoutPathExpectedLength) {
    program.args.push('./');
    program.rawArgs.push('./');
  }

  if (program.args.length < argsMinLength) {
    console.error('Invalid command\n');
    program.help();
  }

  let patterns;
  let searchPaths;
  if (!clipboard) {
    patterns = program.args[0].split(delimiter);
    searchPaths = program.args.slice(1);
  } else {
    ////test on windows
    patterns = clipboardy.readSync().split('\n');
    searchPaths = program.args;
  }
  patterns = patterns.filter(x => x !== '');
  searchPaths = searchPaths.map(unprefixFilePath);

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
    searchPaths,
    ignoreCase,
    maxFilesize,
    sortByDiffMatchCountArg: sortDifferentMatches
  };
};
