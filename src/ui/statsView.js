export default function renderStats(stats) {
  const statsElem = document.createElement('div');
  statsElem.className = 'Stats';
  let innerResult;
  if (stats.matchedFiles !== undefined) {
    const { patternsCount, matchedFiles } = stats;
    innerResult = `
      <span class="Highlight">${patternsCount}</span> patterns searched,
      <span class="Highlight">${matchedFiles}</span> matched files
    `;
  } else {
    const { matchedLines, filesContainedMatches, matches } = stats;
    innerResult = `
      <span class="Highlight">${filesContainedMatches}</span> files contained matches,
      <span class="Highlight">${matchedLines}</span> matched lines,
      <span class="Highlight">${matches}</span> matches
    `;
  }
  statsElem.innerHTML = innerResult;
  return statsElem;
}
