import { clearElems } from '../../utils';
import { highlightString } from '../matchHighlighter';
import { excludeIcon, undoIcon } from '../icons';

function mapFileStateToProp(fileState) {
  return fileState.isCollapsed;
}

function mapMatchLineStateToProps(matchLineState) {
  return {
    lineNumber: matchLineState.lineNumber,
    isMatchLineExcluded: matchLineState.isExcluded
  };
}

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
    const subscribeCb = () => this.render();
    this._matchLineState.subscribe(subscribeCb, mapMatchLineStateToProps);
    this._fileState.subscribe(subscribeCb, mapFileStateToProp);
    this.render();
  }

  render() {
    const isFileCollapsed = mapFileStateToProp(this._fileState);
    const { lineNumber, isMatchLineExcluded } = mapMatchLineStateToProps(this._matchLineState);
    if (isFileCollapsed) {
      clearElems([ this._prevMatchElem ]);
      this._prevMatchElem = null;
      return;
    }
    const match = document.createElement('div');
    const matchCls = `MatchLine ${isMatchLineExcluded ? 'MatchLine_excluded' : ''}`;
    match.className = matchCls;
    match.append(
      this.renderLieNumber(lineNumber),
      this.renderMatchString(),
      this.renderExcludeButton(isMatchLineExcluded)
    );

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

  renderMatchString() {
    const stringElem = document.createElement('div');
    stringElem.className = 'MatchString';
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
