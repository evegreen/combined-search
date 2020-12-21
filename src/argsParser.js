import fs from 'fs';
import program from 'commander';
const packageJson = JSON.parse(
  fs.readFileSync(
    new URL('../package.json', import.meta.url),
    'utf8'
  )
);

export default function parseArgs() {
  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  cs "one pattern"');
    console.log('  cs "Johny Mitchell|Pattern2"');
    console.log('  cs -d "^" "pattern1^pattern2"')
    console.log('  cs -i "pattern1|pattern2" someDirectory/');
    console.log('  cs -s "new |delete "');
    console.log();
    console.log('If you has runned webpack-dev-server (or openEditorService), you may click on search result matches, your editor will open automatically');
  });

  program
    .version(packageJson.version)
    .name('cs')
    .usage('[global options] "entries" [path]')
    .option('-d, --delimiter [value]', 'delimiter for each search entry', '|')
    .option('-i, --ignore-case', 'case-insensitive search')
    .option('-s, --sort-different-matches', 'sort by different matches count desc')
    .parse(process.argv);

  const { delimiter, ignoreCase, sortDifferentMatches } = program;
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
  // TODO: improvement: make possible use many search paths, like in ripgrep
  const searchPath = program.args[1];

  return {
    inaccurateQuery,
    patterns,
    searchPath,
    ignoreCase,
    sortByDiffMatchCountArg: sortDifferentMatches
  };
};
