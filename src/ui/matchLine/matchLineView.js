import { highlightString } from '../matchHighlighter';
import { excludeIcon } from '../icons';

export default function renderMatchLine({
  lineNumber,
  matchString,
  submatches,
  handleClick,
  handleExclude
}) {
  // there is always at least one match, so escaping proceed into highlight algorhytm
  const resultString = highlightString(matchString, submatches);
  const match = document.createElement('tr');
  const lineNumberElem = document.createElement('td');
  lineNumberElem.onclick = handleClick;
  lineNumberElem.innerHTML = `<code>${lineNumber}</code>`;
  match.appendChild(lineNumberElem);
  const stringElem = document.createElement('td');
  stringElem.onclick = handleClick;
  stringElem.innerHTML = `<code>${resultString}</code>`;
  match.appendChild(stringElem);
  const excludeColumn = document.createElement('td');
  excludeColumn.className = 'ExcludeButton';
  excludeColumn.onclick = handleExclude;
  excludeColumn.innerHTML = excludeIcon;
  match.appendChild(excludeColumn);
  return match;
}
