import { escapeHtml } from '../utils.js';

const OPEN_HL_SPAN = '<span class="Highlight">';
const CLOSE_SPAN = '</span>';

export function highlightString(matchString, submatches) {
  submatches.sort((a, b) => a.start - b.start);
  let sourceString = matchString;
  let resultString = '';
  matchString.substring(sourceString, submatches[0].start);
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
