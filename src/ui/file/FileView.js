import { clearElems } from '../../utils';
import { excludeIcon, undoIcon, arrowDownIcon, arrowRightIcon } from '../icons';

function mapFileStateToProps(fileState) {
  return {
    filePath: fileState.filePath,
    isFileExcluded: fileState.isExcluded,
    isFileCollapsed: fileState.isCollapsed
  };
}

export default class FileView {
  constructor({ fileState, handleClick, handleExcludeToggle }) {
    this._anchorNode = document.createComment(FileView.prototype.constructor.name);
    // prev elem stored only for unmount
    this._prevFileElem = null;
    this._state = fileState;
    this._handleClick = handleClick;
    this._handleExcludeToggle = handleExcludeToggle;
    this._handleCollapseToggle = () => {
      fileState.isCollapsed = !fileState.isCollapsed;
    };
  }

  mountTo(parentNode) {
    parentNode.appendChild(this._anchorNode);
    this._state.subscribe(() => this.render(), mapFileStateToProps);
    this.render();
  }

  render() {
    const { filePath, isFileExcluded, isFileCollapsed } = mapFileStateToProps(this._state);
    const file = document.createElement('div');
    const fileCls = `FileLine${isFileExcluded ? ' FileLine_excluded' : ''}`;
    file.className = fileCls;
    file.append(
      this.renderCollapseButton(isFileCollapsed),
      this.renderFilePath(filePath),
      this.renderExcludeButton(isFileExcluded)
    );

    clearElems([ this._prevFileElem ]);
    this._prevFileElem = file;
    this._anchorNode.after(file);
  }

  renderCollapseButton(isCollapsed) {
    const collapse = document.createElement('div');
    collapse.className = 'CollapseButton';
    collapse.onclick = this._handleCollapseToggle;
    const collapseIcon = isCollapsed ? arrowRightIcon : arrowDownIcon;
    collapse.innerHTML = collapseIcon;
    return collapse;
  }

  renderFilePath(filePath) {
    const filePathElem = document.createElement('span');
    filePathElem.className = 'Highlight';
    filePathElem.onclick = this._handleClick;
    filePathElem.innerHTML = `<code>${filePath}</code>`;
    return filePathElem;
  }

  renderExcludeButton(isExcluded) {
    const excludeButton = document.createElement('div');
    excludeButton.className = 'ExcludeButton';
    excludeButton.onclick = this._handleExcludeToggle;
    excludeButton.innerHTML = isExcluded ? undoIcon : excludeIcon;
    return excludeButton;
  }
}
