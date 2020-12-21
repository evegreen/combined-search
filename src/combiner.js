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
      let fileResult = combinedResult[filePath];
      for (let [ lineNumber, match ] of Object.entries(entries)) {
        const { matchString, submatches } = match;
        if (!fileResult[lineNumber]) {
          fileResult[lineNumber] = match;
          continue;
        }
        fileResult[lineNumber].submatches = fileResult[lineNumber].submatches.concat(submatches);
      }
      combinedResult[filePath].differentMatchCount++;
    });
  });
  const combinedStats = {
    patternsCount: resultsWithStats.length,
    matchedFiles: Object.keys(combinedResult).length
  };
  return { combinedResult, combinedStats };
};

exports.matchLinesCountComparator = matchLinesCountComparator;
function matchLinesCountComparator(a, b) {
  return Object.keys(b.value).length - Object.keys(a.value).length
};

exports.differentMatchCountComparator = function differentMatchCountComparator(a, b) {
  const mainDiff = b.value.differentMatchCount - a.value.differentMatchCount;
  if (mainDiff !== 0) return mainDiff;
  return matchLinesCountComparator(a, b);
};
