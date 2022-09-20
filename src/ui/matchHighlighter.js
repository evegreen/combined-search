import { escapeHtml } from '../utils.js';

const OPEN_HL_SPAN = '<span class="Highlight">';
const CLOSE_SPAN = '</span>';


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
