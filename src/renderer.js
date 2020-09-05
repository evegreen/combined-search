'use strict';

// TODO: add "collapse all" results button

const fs = require('fs');
const path = require('path');
const highlightMatchString = require('./highlightString');

const templatePath = path.join(__dirname, 'resultTemplate.html');
const template = fs.readFileSync(templatePath, 'utf8');
const excludeIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
`;
const undoIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
`;
const arrowDownIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
    <path fill="none" d="M0 0h24v24H0V0z"/>
  </svg>
`;
const arrowRightIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
    <path fill="none" d="M0 0h24v24H0V0z"/>
  </svg>
`;

exports.renderHtmlResult = function renderHtmlResult({
  queryPatterns,
  query,
  searchResult,
  stats,
  absPathsMap,
  ignoreCase
}) {
  let result = template.replace('$$QUERY_PATTERNS_TITLE$$', queryPatterns);
  result = result.replace('$$EXCLUDE_ICON$$', excludeIcon);
  result = result.replace('$$UNDO_ICON$$', undoIcon);
  result = result.replace('$$ARROW_DOWN_ICON$$', arrowDownIcon);
  result = result.replace('$$ARROW_RIGHT_ICON$$', arrowRightIcon);
  const queryHtml = renderQuery(query);
  result = result.replace('$$QUERY_TITLE$$', queryHtml);
  const statsHtml = renderStats(stats);
  result = result.replace('$$STATS$$', statsHtml);
  let resultsHtml;
  resultsHtml = renderResults(searchResult, absPathsMap, queryPatterns, ignoreCase);
  result = result.replace('$$MATCHES$$', resultsHtml);

  return result;
};

function renderQuery(query) {
  return `cs <span class="Highlight">${query}</span>`;
}

function renderStats(stats) {
  if (stats.matchedFiles !== undefined) {
    const { patternsCount, matchedFiles, filesSearched } = stats;
    return `
      <span class="Highlight">${patternsCount}</span> patterns searched,
      <span class="Highlight">${matchedFiles}</span> matched files,
      <span class="Highlight">${filesSearched}</span> files searched
    `;
  }

  const { matchedLines, filesContainedMatches, filesSearched } = stats;
  return `
    <span class="Highlight">${filesContainedMatches}</span> files contained matches,
    <span class="Highlight">${matchedLines}</span> matched lines,
    <span class="Highlight">${filesSearched}</span> files searched
  `;
}

function renderResults(searchResult, absPathsMap, queryPatterns, ignoreCase) {
  if (!searchResult) return '';

  let result = '';
  for (let [filePath, matches] of Object.entries(searchResult)) {
    const absPath = absPathsMap[filePath];
    result += `
      <tr data-file="${filePath}">
        <td>
          <span onClick="toggleCollapseMatchStrings(this);">${arrowDownIcon}</span>
          <span class="Highlight" onclick="openEditor('${absPath}');">
            <code>${filePath}</code>
          </span>
        </td>
        <td onclick="openEditor('${absPath}');"></td>
        <td class="ExcludeButton" onclick="toggleFileExclude(this);">${excludeIcon}</td>
      </tr>
    `;
    for (let [lineNumber, matchString] of Object.entries(matches)) {
      // TODO: remove abstraction leak
      if (lineNumber === 'differentMatchCount') continue;
      const highlightedMatchString = highlightMatchString(
        matchString,
        queryPatterns,
        ignoreCase
      );
      result += `
        <tr data-parent-file="${filePath}">
          <td onclick="openEditor('${absPath}', ${lineNumber});">
            <code>${lineNumber}</code>
          </td>
          <td onclick="openEditor('${absPath}', ${lineNumber});">
            <code>${highlightedMatchString}</code>
          </td>
          <td class="ExcludeButton" onclick="toggleMatchExclude(this);">${excludeIcon}</td>
        </tr>
      `;
    }
  }

  return result;
}
