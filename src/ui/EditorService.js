export default class Editor {
  constructor(absPathsMap) {
    this._absPathsMap = absPathsMap;

    //// this is stub
    //// extract port storing and saving from ui/index.js to this file
    this._port = 3000;
  }

  /**
   * @param {string} filePath
   * @param {number} [lineNumber=1]
   */
  open(filePath, lineNumber = 1) {
    const absPath = this._absPathsMap[filePath];
    const encodedAbsPath = encodeURIComponent(absPath);
    const url = `http://localhost:${this._port}/__open-stack-frame-in-editor?fileName=${encodedAbsPath}&lineNumber=${lineNumber}`;
    const xhr = new XMLHttpRequest();
    try {
      xhr.open('GET', url, false);
      xhr.send(null);
    } catch (err) {
      // do nothing, because openEditorService or WDS (react-dev-utils editor opener)
      // will not respond anything
    }
  }
}
