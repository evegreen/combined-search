'use strict';

exports.parse = function parse(rgResult) {
  if (!rgResult) throw new Error('rgResult is empty');

  const lines = rgResult.split('\n');
  const statsResult = lines.splice(lines.length - 5, 5);
  const stats = parseStats(statsResult);
  if (stats.matchedLines === 0) return { stats };

  let result = {};
  let tmpFilePath = null;
  let tmpMatchStringsMap = {};
  for (let line of lines) {
    if (!tmpFilePath) {
      tmpFilePath = line;
      continue;
    }

    if (line === '') {
      result[tmpFilePath] = tmpMatchStringsMap;
      tmpFilePath = null;
      tmpMatchStringsMap = {};
      continue;
    }

    const firstColonIdx = line.indexOf(':');
    const lineNumber = line.substring(0, firstColonIdx);
    const matchString = line.substring(firstColonIdx + 1);

    tmpMatchStringsMap[lineNumber] = matchString;
  }

  return { stats, result };
}

function parseStats(statsResult) {
  let matchedLines;
  let filesContainedMatches;
  let filesSearched;
  statsResult.forEach(line => {
    if (line.endsWith('matched lines')) matchedLines = parseStatString(line);
    if (line.endsWith('files contained matches')) filesContainedMatches = parseStatString(line);
    if (line.endsWith('files searched')) filesSearched = parseStatString(line);
  });

  return { matchedLines, filesContainedMatches, filesSearched };
}

function parseStatString(str) {
  return Number(str.split(' ')[0]);
}
