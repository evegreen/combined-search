export default class FileState {
  constructor(filePath) {
    this.filePath = filePath;
    this._isExcluded = false;
    this._isCollapsed = false;
    this._changeHandler = null;
  }

  setChangeHandler(fn) {
    this._changeHandler = fn;
  }

  toggleExclude() {
    this._isExcluded = !this._isExcluded;
    this._changeHandler();
  }

  toggleCollapse() {
    this._isCollapsed = !this._isCollapsed;
    this._changeHandler();
  }
}
