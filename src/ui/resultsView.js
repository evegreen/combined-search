import { highlightString } from '../matchHighlighter';
import { excludeIcon, arrowDownIcon } from './icons';

export default function renderResults(searchResult, absPathsMap) {
  const results = document.createElement('table');
  results.className = 'MatchTable';
  if (!searchResult) return results;
  for (let [filePath, { entries }] of Object.entries(searchResult)) {
    const absPath = absPathsMap[filePath];
    const fileElem = renderFileEntry(filePath, absPath);
    results.appendChild(fileElem);
    for (let [lineNumber, { matchString, submatches }] of Object.entries(entries)) {
      const matchElem = renderMatchEntry(lineNumber, matchString, submatches, filePath, absPath);
      results.appendChild(matchElem);
    }
  }
  return results;
}

function renderFileEntry(filePath, absPath) {
  const file = document.createElement('tr');
  file.dataset.file = filePath;
  file.innerHTML = `
    <td>
      <span onClick="toggleCollapseMatchStrings(this);">${arrowDownIcon}</span>
      <span class="Highlight" onclick="openEditor('${absPath}');">
        <code>${filePath}</code>
      </span>
    </td>
    <td onclick="openEditor('${absPath}');"></td>
    <td class="ExcludeButton" onclick="toggleFileExclude(this);">${excludeIcon}</td>
  `;
  return file;
}

function renderMatchEntry(lineNumber, matchString, submatches, filePath, absPath) {
  // there is always at least one match, so escaping proceed into highlight algorhytm
  const resultString = highlightString(matchString, submatches);
  const match = document.createElement('tr');
  match.dataset.parentFile = filePath;
  match.innerHTML = `
    <td onclick="openEditor('${absPath}', ${lineNumber});">
      <code>${lineNumber}</code>
    </td>
    <td onclick="openEditor('${absPath}', ${lineNumber});">
      <code>${resultString}</code>
    </td>
    <td class="ExcludeButton" onclick="toggleMatchExclude(this);">${excludeIcon}</td>
  `;
  return match;
}
