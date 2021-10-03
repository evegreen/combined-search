import {batchUpdate} from './createState';
import FileView from './file/FileView';
import LineView from './line/LineView';

export default class ResultsContainer {
  constructor({files, isContextSearch, handleOpenEditor}) {
    this.elem = document.createElement('div');
    this.elem.className = 'MatchTable';
    this._files = files;
    this._isContextSearch = isContextSearch;
    this._handleOpenEditor = handleOpenEditor;
    this.render();
  }

  render() {
    if (this._files.length === 0) return;
    for (let {file, lines} of this._files) {
      const fileView = this.renderFile(file, lines);
      fileView.mountTo(this.elem);
      let lastLineNumber;
      for (let line of lines) {
        const currentLineNumber = Number(line.lineNumber);
        if (
          line.isCtxt &&
          lastLineNumber &&
          (lastLineNumber + 1 !== currentLineNumber)
        ) {
          const ctxtSeparator = this.renderContextSeparator();
          this.elem.append(ctxtSeparator);
        }
        lastLineNumber = currentLineNumber;
        const lineView = this.renderLine(line, file, lines);
        lineView.mountTo(this.elem);
      }
    }
  }

  renderFile(file, lines) {
    return new FileView({
      fileState: file,
      handleClick: () => this._handleOpenEditor(file.filePath),
      handleExcludeToggle: () => this._handleFileExcludeToggle(file, lines)
    });
  }

  renderLine(line, file, boundLines) {
    return new LineView({
      lineState: line,
      fileState: file,
      isContextSearch: this._isContextSearch,
      handleClick: () =>
        this._handleOpenEditor(file.filePath, line.lineNumber),
      handleExcludeToggle: () =>
        this._handleLineExcludeToggle(line, file, boundLines)
    });
  }

  renderContextSeparator() {
    const separator = document.createElement('div');
    separator.className = 'ContextSeparator';
    return separator;
  }

  _handleFileExcludeToggle(fileState, lineStates) {
    batchUpdate(() => {
      fileState.isExcluded
        ? this._handleFileInclusion(fileState, lineStates)
        : this._handleFileExclusion(fileState, lineStates);
    });
  }

  _handleFileExclusion(fileState, lineStates) {
    fileState.update({isExcluded: true, isCollapsed: true});
    lineStates
      .filter(line => !line.isCtxt)
      .forEach(matchLine => {
        matchLine.isExcluded = true;
      });
  }

  _handleFileInclusion(fileState, lineStates) {
    fileState.isExcluded = false;
    lineStates
      .filter(line => !line.isCtxt)
      .forEach(matchLine => {
        matchLine.isExcluded = false;
      });
  }

  _handleLineExcludeToggle(lineState, fileState, boundLineStates) {
    batchUpdate(() => {
      lineState.isExcluded
        ? this._handleLineInclusion(lineState, fileState)
        : this._handleLineExclusion(lineState, fileState, boundLineStates);
    });
  }

  _handleLineExclusion(lineState, fileState, boundLineStates) {
    lineState.isExcluded = !lineState.isExcluded;
    if (
      boundLineStates
        .filter(line => !line.isCtxt)
        .every(matchLine => matchLine.isExcluded)
    ) {
      fileState.isExcluded = true;
    }
  }

  _handleLineInclusion(lineState, fileState) {
    lineState.isExcluded = !lineState.isExcluded;
    fileState.isExcluded = false;
  }
}
