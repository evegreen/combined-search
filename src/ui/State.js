import FileState from './file/FileState';
import MatchLineState from './matchLine/MatchLineState';

// TODO: implement state serialization

function deserializeFiles(searchResults) {
  return Object.entries(searchResults).map(
    ([filePath, { entries }]) => ({
      file: new FileState(filePath),
      matchLines: deserializeMatchLines(entries)
    })
  );
}

function deserializeMatchLines(macthLineEntries) {
  return Object.entries(macthLineEntries).map(
    ([lineNumber, { matchString, submatches }]) => new MatchLineState(lineNumber, matchString, submatches)
  );
}

export default class State {
  constructor(serializedState) {
    const { searchResult, query, stats, absPathsMap } = JSON.parse(serializedState);
    this.files = deserializeFiles(searchResult);
    this.query = query;
    this.stats = stats;
    this.absPathsMap = absPathsMap;
  }
}
