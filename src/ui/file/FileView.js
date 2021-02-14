import { clearElems } from '../../utils';
import { excludeIcon, arrowDownIcon, arrowRightIcon } from '../icons';

//// optimize render calls

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
    this._state.subscribe(() => this.render());
    this.render();
  }

  render() {
    const { filePath, isExcluded, isCollapsed } = this._state;
    const file = document.createElement('tr');
    if (isExcluded) file.className = 'ExcludedMatch';
    const fakeSecondColumn = document.createElement('td');
    fakeSecondColumn.onclick = this._handleClick;
    file.append(
      this.renderCollapseFilePathColumn(filePath, isCollapsed),
      fakeSecondColumn,
      this.renderExcludeButtonColumn()
    );

    clearElems([ this._prevFileElem ]);
    this._prevFileElem = file;
    this._anchorNode.after(file);
  }

  renderCollapseFilePathColumn(filePath, isCollapsed) {
    const column = document.createElement('td');
    const collapse = document.createElement('span');
    collapse.onclick = this._handleCollapseToggle;
    const collapseIcon = isCollapsed ? arrowRightIcon : arrowDownIcon;
    collapse.innerHTML = collapseIcon;
    column.appendChild(collapse);
    const filePathElem = document.createElement('span');
    filePathElem.className = 'Highlight';
    filePathElem.onclick = this._handleClick;
    filePathElem.innerHTML = `<code>${filePath}</code>`;
    column.appendChild(filePathElem);
    return column;
  }

  renderExcludeButtonColumn() {
    const column = document.createElement('td');
    column.className = 'ExcludeButton';
    column.onclick = this._handleExcludeToggle;
    column.innerHTML = excludeIcon;
    return column;
  }
}
