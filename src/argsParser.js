import program from 'commander';
import {getVersions} from './version.js';

// TODO: improvement: make possible use many search paths, like in ripgrep
// TODO: improvement: add paths exclusions

// TODO: add live mode (with auto updating) (re-search when opened or paths watching)

export default function parseArgs() {
  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  cs "one pattern"');
    console.log('  cs "Johny Mitchell|Pattern2"');
    console.log('  cs -d "^" "pattern1^pattern2"')
    console.log('  cs -i "pattern1|pattern2" someDirectory/');
    console.log('  cs -s "new |delete "');
    console.log('  cs -m 500K "pattern"')
    console.log();
    console.log('If you has runned webpack-dev-server (or openEditorService), you may click on search result matches, your editor will open automatically');
  });

  program
    .version(getVersions())
    .name('cs')
    .usage('[global options] "entries" [path]')
    .option('-d, --delimiter [value]', 'delimiter for each search entry', '|')
    .option('-i, --ignore-case', 'case-insensitive search')
    .option('-s, --sort-different-matches', 'sort by different matches count desc')
    .option('-m, --max-filesize [value]', 'ignore files larger than NUM in size. this does not apply to directories. (rg compatible)')
    .parse(process.argv);

  const options = program.opts();
  const { delimiter, ignoreCase, maxFilesize, sortDifferentMatches } = options;
  if (program.args.length === 1) {
    program.args.push('./');
  }

  if (program.args.length !== 2) {
    console.error('Invalid command\n');
    program.help();
  }

  const queryReducer = (acc, arg) => acc += `${arg}  `;
  const inaccurateQuery = program.rawArgs.slice(2).reduce(queryReducer, '');
  const patterns = program.args[0].split(delimiter);
  const searchPath = program.args[1];

  return {
    inaccurateQuery,
    patterns,
    searchPath,
    ignoreCase,
    maxFilesize,
    sortByDiffMatchCountArg: sortDifferentMatches
  };
};
