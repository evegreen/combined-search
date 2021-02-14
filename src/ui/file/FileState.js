import BaseState from '../BaseState';

export default class FileState extends BaseState {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this._isExcluded = false;
    this._isCollapsed = false;
  }

  get isExcluded() {
    return this._isExcluded;
  }
  set isExcluded(excluded) {
    this._isExcluded = excluded;
    this.autoNotify();
  }

  get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
    this.autoNotify();
  }
}
