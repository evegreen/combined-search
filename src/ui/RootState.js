import createState from './createState';

// TODO: implement state serialization

function deserializeFiles(searchResults) {
  return Object.entries(searchResults).map(([filePath, { entries }]) => ({
    file: createState({ filePath, isExcluded: false, isCollapsed: false }),
    matchLines: deserializeMatchLines(entries),
  }));
}

function deserializeMatchLines(macthLineEntries) {
  return Object.entries(macthLineEntries).map(
    ([lineNumber, { matchString, submatches }]) =>
      createState({
        lineNumber,
        matchString,
        submatches,
        isExcluded: false,
      })
  );
}

export default class RootState {
  constructor(serializedState) {
    const { searchResult, query, stats, absPathsMap } = JSON.parse(serializedState);
    this.files = deserializeFiles(searchResult);
    this.query = query;
    this.stats = stats;
    this.absPathsMap = absPathsMap;
  }
}
