import renderFile from './file/fileView';
import renderMatchLine from './matchLine/matchLineView';

//// REPLACE STUBS
const handleCollapse = () => { console.log('COLLAPSE STUB') };
const handleExclude = () => { console.log('EXCLUDE STUB') };

export default function renderResultsContainer(files, editorService) {
  const results = document.createElement('table');
  results.className = 'MatchTable';
  if (files.length === 0) return results;
  for (let { file, matchLines } of files) {
    const fileElem = renderFile({
      filePath: file.filePath,
      handleCollapse,
      handleClick: () => editorService.open(file.filePath),
      handleExclude
    });
    results.appendChild(fileElem);
    for (let matchLine of matchLines) {
      const { lineNumber, matchString, submatches } = matchLine;
      const matchElem = renderMatchLine({
        lineNumber,
        matchString,
        submatches,
        handleClick: () => editorService.open(file.filePath, lineNumber),
        handleExclude
      });
      results.appendChild(matchElem);
    }
  }
  return results;
}
