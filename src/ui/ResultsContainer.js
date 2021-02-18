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
      handleClick: () =>
        this._handleOpenEditor(file.filePath, matchLine.lineNumber),
      handleExcludeToggle: () =>
        this._handleMatchLineExcludeToggle(matchLine, file, boundMatchLines)
    });
  }

  _handleFileExcludeToggle(fileState, matchLineStates) {
    fileState.isExcluded
      ? this._handleFileInclusion(fileState, matchLineStates)
      : this._handleFileExclusion(fileState, matchLineStates);
  }

  _handleFileExclusion(fileState, matchLineStates) {
    matchLineStates.forEach(matchLine => { matchLine.isExcluded = true; });
    fileState.update({ isExcluded: true, isCollapsed: true });
  }

  _handleFileInclusion(fileState, matchLineStates) {
    fileState.isExcluded = false;
    matchLineStates.forEach(matchLine => { matchLine.isExcluded = false; });
  }

  _handleMatchLineExcludeToggle(matchLineState, fileState, boundMatchLineStates) {
    matchLineState.isExcluded
      ? this._handleMatchLineInclusion(matchLineState, fileState)
      : this._handleMatchLineExclusion(matchLineState, fileState, boundMatchLineStates);
  }

  _handleMatchLineExclusion(matchLineState, fileState, boundMatchLineStates) {
    matchLineState.isExcluded = !matchLineState.isExcluded;
    if (boundMatchLineStates.every(ml => ml.isExcluded)) {
      fileState.isExcluded = true;
    }
  }

  _handleMatchLineInclusion(matchLineState, fileState) {
    matchLineState.isExcluded = !matchLineState.isExcluded;
    fileState.isExcluded = false;
  }
}
