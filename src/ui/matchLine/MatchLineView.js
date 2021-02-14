import { clearElems } from '../../utils';
import { highlightString } from '../matchHighlighter';
import { excludeIcon } from '../icons';

//// optimize render calls

export default class MatchLineView {
  constructor({matchLineState, fileState, handleClick, handleExcludeToggle}) {
    this._anchorNode = document.createComment(MatchLineView.prototype.constructor.name);
    // prev elem stored only for unmount
    this._prevMatchElem = null;
    this._matchLineState = matchLineState;
    this._fileState = fileState;
    const { matchString, submatches } = this._matchLineState;
    // there is always at least one match, so escaping proceed into highlight algorhytm
    this._escapedHighlightedString = highlightString(matchString, submatches);
    this._handleClick = handleClick;
    this._handleExcludeToggle = handleExcludeToggle;
  }

  mountTo(parentNode) {
    parentNode.appendChild(this._anchorNode);
    this._matchLineState.subscribe(() => this.render());
    this._fileState.subscribe(() => this.render());
    this.render();
  }

  render() {
    const { isCollapsed } = this._fileState;
    const { lineNumber, isExcluded } = this._matchLineState;
    if (isCollapsed) {
      clearElems([ this._prevMatchElem ]);
      this._prevMatchElem = null;
      return;
    }
    const match = document.createElement('tr');
    if (isExcluded) match.className = 'ExcludedMatch';
    match.append(
      this.renderLieNumberColumn(lineNumber),
      this.renderMatchStringColumn(),
      this.renderExcludeColumn()
    );

    clearElems([ this._prevMatchElem ]);
    this._prevMatchElem = match;
    this._anchorNode.after(match);
  }

  renderLieNumberColumn(lineNumber) {
    const lineNumberElem = document.createElement('td');
    lineNumberElem.onclick = this._handleClick;
    lineNumberElem.innerHTML = `<code>${lineNumber}</code>`;
    return lineNumberElem;
  }

  renderMatchStringColumn() {
    const stringElem = document.createElement('td');
    stringElem.onclick = this._handleClick;
    stringElem.innerHTML = `<code>${this._escapedHighlightedString}</code>`;
    return stringElem;
  }

  renderExcludeColumn() {
    const excludeColumn = document.createElement('td');
    excludeColumn.className = 'ExcludeButton';
    excludeColumn.onclick = this._handleExcludeToggle;
    excludeColumn.innerHTML = excludeIcon;
    return excludeColumn;
  }
}
