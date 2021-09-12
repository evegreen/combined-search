import {clearElems, escapeHtml} from '../../utils';
import {highlightString} from '../matchHighlighter';
import {excludeIcon, undoIcon} from '../icons';

function mapFileStateToProp(fileState) {
  return fileState.isCollapsed;
}

function mapLineStateToProps(lineState) {
  return {
    lineNumber: lineState.lineNumber,
    isCtxt: lineState.isCtxt,
    isLineExcluded: lineState.isExcluded
  };
}

//// fix word wrap for long lines in context search

export default class LineView {
  constructor({lineState, fileState, isContextSearch, handleClick, handleExcludeToggle}) {
    this._anchorNode = document.createComment(LineView.prototype.constructor.name);
    // prev elem stored only for unmount
    this._prevMatchElem = null;
    this._lineState = lineState;
    this._fileState = fileState;
    const {matchString, submatches, isCtxt} = this._lineState;
    this._escapedHighlightedString = isCtxt
      ? escapeHtml(matchString, isContextSearch)
      : highlightString(matchString, submatches, isContextSearch);
    this._handleClick = handleClick;
    this._handleExcludeToggle = handleExcludeToggle;
  }

  mountTo(parentNode) {
    parentNode.appendChild(this._anchorNode);
    const subscribeCb = () => this.render();
    this._lineState.subscribe(subscribeCb, mapLineStateToProps);
    this._fileState.subscribe(subscribeCb, mapFileStateToProp);
    this.render();
  }

  render() {
    const isFileCollapsed = mapFileStateToProp(this._fileState);
    const {lineNumber, isLineExcluded, isCtxt} = mapLineStateToProps(this._lineState);
    if (isFileCollapsed) {
      clearElems([ this._prevMatchElem ]);
      this._prevMatchElem = null;
      return;
    }
    const match = document.createElement('div');
    const matchCls = `MatchLine${isLineExcluded ? ' MatchLine_excluded' : ''}`;
    match.className = matchCls;
    match.append(
      this.renderLieNumber(lineNumber),
      this.renderMatchString(isCtxt)
    );
    if (!isCtxt) match.append( this.renderExcludeButton(isLineExcluded) );

    clearElems([ this._prevMatchElem ]);
    this._prevMatchElem = match;
    this._anchorNode.after(match);
  }

  renderLieNumber(lineNumber) {
    const lineNumberElem = document.createElement('div');
    lineNumberElem.className = 'LineNumber';
    lineNumberElem.onclick = this._handleClick;
    lineNumberElem.innerHTML = `<code>${lineNumber}</code>`;
    return lineNumberElem;
  }

  renderMatchString(isCtxt) {
    const stringElem = document.createElement('div');
    stringElem.className = `MatchString${isCtxt && ' MatchString_ctxt'}`;
    stringElem.onclick = this._handleClick;
    stringElem.innerHTML = `<code>${this._escapedHighlightedString}</code>`;
    return stringElem;
  }

  renderExcludeButton(isExcluded) {
    const excludeButton = document.createElement('div');
    excludeButton.className = 'ExcludeButton';
    excludeButton.onclick = this._handleExcludeToggle;
    excludeButton.innerHTML = isExcluded ? undoIcon : excludeIcon;
    return excludeButton;
  }
}
