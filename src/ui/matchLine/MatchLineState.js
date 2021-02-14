import BaseState from '../BaseState';

export default class MatchLineState extends BaseState {
  constructor(lineNumber, matchString, submatches) {
    super();
    this.lineNumber = lineNumber;
    this.matchString = matchString;
    this.submatches = submatches;
    this._isExcluded = false;
  }

  get isExcluded() {
    return this._isExcluded;
  }
  set isExcluded(excluded) {
    this._isExcluded = excluded;
    this.autoNotify();
  }
}
