import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import open from 'open';
import parseArgs from './argsParser.js';
import { rgJsonCommand } from './rgCommand.js';
import {
  combineResults,
  matchLinesCountComparator,
  differentMatchCountComparator
} from './combiner.js';
import renderHtmlResult from './renderer.js';
import { sortObjectMap } from './utils.js';
import { determineRgPath } from './rgProvider.js';


main();


async function main() {
  await determineRgPath();
  const args = parseArgs();
  await runSearch(args);
}

async function runSearch(args) {
  try {
    const { patterns } = args;
    const searchFn = patterns.length === 1 ? search : searchCombined;
    const searchResults = await searchFn(args);
    const htmlResult = renderHtmlResult(searchResults);
    const resultFilename = saveToTempFile(htmlResult);
    open(resultFilename);
  } catch (err) {
    console.error(err);
  }
}

async function search(args) {
  const { unifiedQueryTitle, patterns, searchPath, ignoreCase, maxFilesize } = args;
  const { result, stats } = await rgJsonCommand(ignoreCase, maxFilesize, patterns[0], searchPath);
  let sortedResult = null;
  let absPathsMap = null;
  sortedResult = sortObjectMap(result, matchLinesCountComparator);
  absPathsMap = resolvePaths(sortedResult);
  return {
    queryPatterns: patterns,
    unifiedQueryTitle,
    searchResult: sortedResult,
    stats,
    absPathsMap
  };
}

async function searchCombined(args) {
  const { unifiedQueryTitle, patterns, searchPath, ignoreCase, maxFilesize, sortByDiffMatchCountArg } = args;
  const rgCommands = patterns.map(pattern => rgJsonCommand(ignoreCase, maxFilesize, pattern, searchPath));
  const resultsWithStats = await Promise.all(rgCommands);
  const { combinedResult, combinedStats } = combineResults(resultsWithStats);
  const comparator = sortByDiffMatchCountArg ? differentMatchCountComparator : matchLinesCountComparator;
  const sortedCombinedResult = sortObjectMap(combinedResult, comparator);
  const absPathsMap = resolvePaths(sortedCombinedResult);
  return {
    queryPatterns: patterns,
    unifiedQueryTitle,
    searchResult: sortedCombinedResult,
    stats: combinedStats,
    absPathsMap
  };
}

function saveToTempFile(htmlResult) {
  let tmpFile = tmp.fileSync({ prefix: 'search-result-', postfix: '.html' });
  fs.writeSync(tmpFile.fd, htmlResult);
  return tmpFile.name;
}

function resolvePaths(combinedResult) {
  return Object.keys(combinedResult).reduce(
    (acc, filePath) => {
      acc[filePath] = path.resolve(filePath);
      return acc;
    },
    {}
  );
}
