'use strict';

exports.combineResults = function combineResults(resultsWithStats) {
  let combinedResult = {};
  resultsWithStats.forEach(({ result }) => {
    if (!result) return; // for empty search result
    Object.entries(result).forEach(([filePath, entries]) => {
      if (!combinedResult[filePath]) {
        combinedResult[filePath] = entries;
        combinedResult[filePath].differentMatchCount = 1;
        return;
      }
      combinedResult[filePath] = {
        ...combinedResult[filePath],
        ...entries
      };
      combinedResult[filePath].differentMatchCount++;
    });
  });
  const combinedStats = {
    patternsCount: resultsWithStats.length,
    matchedFiles: Object.keys(combinedResult).length,
    filesSearched: resultsWithStats[0].stats.filesSearched
  };
  return { combinedResult, combinedStats };
};

function matchCountComparator(a, b) {
  return Object.keys(b.value).length - Object.keys(a.value).length
};
exports.matchCountComparator = matchCountComparator;

exports.differentMatchCountComparator = function differentMatchCountComparator(a, b) {
  const mainDiff = b.value.differentMatchCount - a.value.differentMatchCount;
  if (mainDiff !== 0) return mainDiff;
  return matchCountComparator(a, b);
};
