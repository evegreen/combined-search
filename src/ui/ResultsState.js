import { createState } from './createState';

// TODO: implement state serialization

function deserializeFiles(searchResults) {
  return Object.entries(searchResults).map(([filePath, { entries }]) => ({
    file: createState({ filePath, isExcluded: false, isCollapsed: false }),
    lines: deserializeLines(entries),
  }));
}

function deserializeLines(macthLineEntries) {
  return Object.entries(macthLineEntries).map(
    ([lineNumber, {matchString, submatches, isCtxt}]) =>
      createState({
        lineNumber,
        matchString,
        isCtxt,
        submatches,
        isExcluded: false,
      })
  );
}

export default class ResultsState {
  constructor(serializedState) {
    const {searchResult, isContextSearch, query, stats, absPathsMap} = JSON.parse(serializedState);
    this.files = deserializeFiles(searchResult);
    this.isContextSearch = isContextSearch;
    this.query = query;
    this.stats = stats;
    this.absPathsMap = absPathsMap;
  }
}
