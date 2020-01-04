'use strict';

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const open = require('open');
const parseArgs = require('./argsParser');
const rgCommand = require('./rgCommand');
const { parse, parseWithoutLines } = require('./rgParser');
const renderHtmlResult = require('./renderer');
const { sortObjectMap } = require('./utils');

const { inaccurateQuery, patterns, searchPath, ignoreCase } = parseArgs();
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
  const rgResult = await rgCommand(ignoreCase, patterns[0], searchPath);
  const { result , stats } = parse(rgResult);
  let sortedResult = null;
  let absPathsMap = null;
  if (result) {
    sortedResult = sortObjectMap(result, (a, b) => a.key.localeCompare(b.key));
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
  const rgCommands = patterns.map(pattern => rgCommand(ignoreCase, pattern, searchPath, true));
  const rgResults = await Promise.all(rgCommands);
  const resultsWithStats = rgResults.map(parseWithoutLines);
  const { combinedResult, combinedStats } = combineSearchResults(resultsWithStats);
  const sortedCombinedResult = sortObjectMap(combinedResult, (a, b) => b.value - a.value);
  const absPathsMap = resolvePaths(sortedCombinedResult);
  return renderHtmlResult({
    queryPatterns: patterns,
    query: inaccurateQuery,
    searchResult: sortedCombinedResult,
    stats: combinedStats,
    absPathsMap,
    isCombined: true
  });
}

function combineSearchResults(resultsWithStats) {
  let combinedResult = {};
  resultsWithStats.forEach(({ result }) => {
    if (!result) return; // for empty search result

    Object.keys(result).forEach(filePath => {
      if (!combinedResult[filePath]) {
        combinedResult[filePath] = 1;
        return;
      }

      combinedResult[filePath]++;
    });
  });

  const combinedStats = {
    patternsCount: resultsWithStats.length,
    matchedFiles: Object.keys(combinedResult).length,
    filesSearched: resultsWithStats[0].stats.filesSearched
  };

  return { combinedResult, combinedStats };
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
