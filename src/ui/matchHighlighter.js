import { escapeHtml } from '../utils.js';

const OPEN_HL_SPAN = '<span class="Highlight">';
const CLOSE_SPAN = '</span>';

/** @deprecated */
function OLD__highlightString(matchString, submatches) {
  submatches.sort((a, b) => a.start - b.start);
  let sourceString = matchString;
  let resultString = '';
  let offset = 0;
  for (let i = 0; i < submatches.length; i++) {
    const submatch = submatches[i];
    const previous = sourceString.substring(0, submatch.start - offset);
    const match = submatch.match.text;
    const escapedPrevious = escapeHtml(previous);
    const escapedMatch = OPEN_HL_SPAN + escapeHtml(match) + CLOSE_SPAN;
    resultString += `${escapedPrevious}${escapedMatch}`;
    sourceString = sourceString.substring(submatch.end - offset);
    offset = matchString.length - sourceString.length;
  }
  resultString += escapeHtml(sourceString);
  return resultString;
};

export function highlightString(matchString, submatches) {
  let openedTagsCount = 0;
  let prevEscapedIdx = matchString.length;
  return submatches.map(Object.entries)
    .flatMap(x => x)
    .filter(x => x[0] === 'start' || x[0] === 'end')
    .sort((locA, locB) => locB[1] - locA[1])
    .reduce((result, [locType, locIdx], locEntryIdx, locations) => {
      if (locType === 'end') {
        openedTagsCount++;
        if (openedTagsCount === 1) {
          const res = result.substring(0, locIdx) + CLOSE_SPAN + escapeHtml(result.substring(locIdx, prevEscapedIdx)) + result.substring(prevEscapedIdx);
          prevEscapedIdx = locIdx;
          return res;
        }
      }
      if (locType === 'start') {
        openedTagsCount--;
        if (openedTagsCount === 0) {
          let leftPart = result.substring(0, locIdx);
          if (locEntryIdx === locations.length - 1) leftPart = escapeHtml(leftPart);
          const res = leftPart + OPEN_HL_SPAN + escapeHtml(result.substring(locIdx, prevEscapedIdx)) + result.substring(prevEscapedIdx);
          prevEscapedIdx = locIdx;
          return res;
        }
      }
      return result;
    }, matchString)
    .split(CLOSE_SPAN + OPEN_HL_SPAN)
    .join('');
};
