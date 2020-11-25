'use strict';

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const open = require('open');
const parseArgs = require('./argsParser');
const { rgCommand, rgJsonCommand } = require('./rgCommand');
const { parse } = require('./rgParser');
const {
  combineResults,
  matchCountComparator,
  differentMatchCountComparator
} = require('./combiner');
const renderHtmlResult = require('./renderer');
const { sortObjectMap } = require('./utils');

const { inaccurateQuery, patterns, searchPath, ignoreCase, sortByDiffMatchCountArg } = parseArgs();
runSearch();

async function runSearch() {
  try {
    const searchFn = patterns.length === 1 ? search : searchCombined;
    const htmlResult = await searchFn();
    const resultFilename = saveToTempFile(htmlResult);
    open(resultFilename);
  } catch (err) {
    console.error(err);
  }
}

async function search() {



  debugger;
  const rgResult = await rgCommand(ignoreCase, patterns[0], searchPath);
  const { result , stats } = parse(rgResult);
  debugger;
  const { result2, stats2 } = await rgJsonCommand(ignoreCase, patterns[0], searchPath);
  debugger;



  let sortedResult = null;
  let absPathsMap = null;
  if (result) {
    sortedResult = sortObjectMap(result, matchCountComparator);
    absPathsMap = resolvePaths(sortedResult);
  }

  return renderHtmlResult({
    queryPatterns: patterns,
    query: inaccurateQuery,
    searchResult: sortedResult,
    stats,
    absPathsMap
  });
}

async function searchCombined() {



  debugger;
  const rgCommands = patterns.map(pattern => rgCommand(ignoreCase, pattern, searchPath));
  debugger;
  const rgResults = await Promise.all(rgCommands);
  const resultsWithStats = rgResults.map(parse);
  debugger;



  const { combinedResult, combinedStats } = combineResults(resultsWithStats);
  const comparator = sortByDiffMatchCountArg ? differentMatchCountComparator : matchCountComparator;
  const sortedCombinedResult = sortObjectMap(combinedResult, comparator);
  const absPathsMap = resolvePaths(sortedCombinedResult);
  return renderHtmlResult({
    queryPatterns: patterns,
    query: inaccurateQuery,
    searchResult: sortedCombinedResult,
    stats: combinedStats,
    absPathsMap
  });
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
