export default class EditorService {
  constructor(absPathsMap, settingsState) {
    this._absPathsMap = absPathsMap;
    settingsState.subscribe(
      () => { this._port = settingsState.oesPort },
      ss => ss.oesPort
    );
    this._port = settingsState.oesPort;
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
