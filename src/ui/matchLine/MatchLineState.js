export default class MatchLineState {
  constructor(lineNumber, matchString, submatches) {
    this.lineNumber = lineNumber;
    this.matchString = matchString;
    this.submatches = submatches;
    this._isExcluded = false;
    this._changeHandler = null;
  }

  setChangeHandler(fn) {
    this._changeHandler = fn;
  }

  toggleExclude() {
    this._isExcluded = !this._isExcluded;
    this._changeHandler();
  }
}
