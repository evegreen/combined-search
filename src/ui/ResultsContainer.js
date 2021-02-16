import FileView from './file/FileView';
import MatchLineView from './matchLine/MatchLineView';

export default class ResultsContainer {
  constructor({ files, handleOpenEditor }) {
    this.elem = document.createElement('table');
    this.elem.className = 'MatchTable';
    this._files = files;
    this._handleOpenEditor = handleOpenEditor;
    this.render();
  }

  render() {
    if (this._files.length === 0) return;
    for (let { file, matchLines } of this._files) {
      const fileView = this.renderFile(file, matchLines);
      fileView.mountTo(this.elem);
      for (let matchLine of matchLines) {
        const matchLineView = this.renderMatchLine(matchLine, file, matchLines);
        matchLineView.mountTo(this.elem);
      }
    }
  }

  renderFile(file, matchLines) {
    return new FileView({
      fileState: file,
      handleClick: () => this._handleOpenEditor(file.filePath),
      handleExcludeToggle: () => this._handleFileExcludeToggle(file, matchLines)
    });
  }

  renderMatchLine(matchLine, file, boundMatchLines) {
    return new MatchLineView({
      matchLineState: matchLine,
      fileState: file,
      handleClick: () => this._handleOpenEditor(file.filePath, matchLine.lineNumber),
      handleExcludeToggle: () => this._handleMatchLineExcludeToggle(matchLine, file, boundMatchLines)
    });
  }

  _handleFileExcludeToggle(fileState, matchLineStates) {
    fileState.preventAutoNotification();
    matchLineStates.forEach(mls => mls.preventAutoNotification());
    fileState.isExcluded = !fileState.isExcluded;
    if (!fileState.isExcluded) {
      // include
      matchLineStates.forEach(matchLine => { matchLine.isExcluded = false; });
      fileState.notify('isExcluded');
    } else {
      // exclude
      matchLineStates.forEach(matchLine => { matchLine.isExcluded = true; });
      fileState.isCollapsed = true;
      fileState.notify();
    }
    matchLineStates.forEach(mls => mls.enableAutoNotification());
  }

  _handleMatchLineExcludeToggle(matchLineState, fileState, boundMatchLineStates) {
    matchLineState.isExcluded = !matchLineState.isExcluded;
    if (!matchLineState.isExcluded) {
      // include
      fileState.isExcluded = false;
      return;
    }
    // exclude
    if (boundMatchLineStates.every(ml => ml.isExcluded)) {
      fileState.isExcluded = true;
    }
  }
}
