'use strict';

const { escapeHtml } = require('./utils');

module.exports = function highlightMatchString(
  matchString,
  queryPatterns,
  ignoreCase
) {
  matchString = escapeHtml(matchString);
  queryPatterns.forEach(queryPattern => {
    const queryRegExp = new RegExp(escapeHtml(queryPattern), `g${ignoreCase ? 'i' : ''}`);
    const queryMatches = matchString.matchAll(queryRegExp);
    for (const [queryMatch] of queryMatches) {
      const queryMatchIndex = matchString.search(new RegExp(queryMatch))
      const matchStringStart = matchString.substr(0, queryMatchIndex);
      const matchStringEnd = matchString.substr(queryMatchIndex + queryMatch.length, matchString.length);
      const wrappedQuery = `<span class="Highlight">${queryMatch}</span>`
      matchString = `${matchStringStart}${wrappedQuery}${matchStringEnd}`;
    }
  });
  return matchString;
};
