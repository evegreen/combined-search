import chai from 'chai';
import { highlightString } from './matchHighlighter.js';
const { assert } = chai;

/**
 * Returns same submatches like rg --json command (only for non regex patterns)
 * @param {string} matchString - Source string for highlighting
 * @param {string[]} patterns - Search patterns
 * @param {boolean=} isCaseInsensitive - Optional case insensitive simulation flag
 */
function evalNonRegexRgSubmatches(matchString, patterns, isCaseInsensitive) {
  let submatches = [];
  const comparisonMatchString = isCaseInsensitive ? matchString.toLowerCase() : matchString;
  for (let pattern of patterns) {
    const comparisonPattern = isCaseInsensitive ? pattern.toLowerCase() : pattern;
    let patternIdx = -1;
    let patternEndIdx = void 0;
    do {
      patternIdx = comparisonMatchString.indexOf(comparisonPattern, patternEndIdx);
      if (patternIdx !== -1) {
        patternEndIdx = patternIdx + pattern.length;
        submatches.push({
          match: {
            text: matchString.substring(patternIdx, patternEndIdx)
          },
          start: patternIdx,
          end: patternEndIdx
        });
      }
    } while (patternIdx !== -1);
  }
  return submatches;
}

describe('matchHighlighter', () => {
  it('single match', () => {
    const matchString = 'hey test lol';
    const queryPatterns = [ 'test' ];
    const expectedString = 'hey <span class="Highlight">test</span> lol';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns);
    const resultString = highlightString(matchString, submatches);
    assert.equal(resultString, expectedString);
  });

  it('single match only', () => {
    const matchString = 'test';
    const queryPatterns = ['test'];
    const expectedString = '<span class="Highlight">test</span>';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns);
    const resultString = highlightString(matchString, submatches);
    assert.equal(resultString, expectedString);
  });

  it('with escaping symbols', () => {
    const matchString = '<hey> test& <lol>';
    const queryPatterns = [ 'test&' ];
    const expectedString = '&lt;hey&gt; <span class="Highlight">test&amp;</span> &lt;lol&gt;';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns);
    const resultString = highlightString(matchString, submatches);
    assert.equal(resultString, expectedString);
  });

  it('6 case insensitive matches', () => {
    const matchString = 'Hey heY hEy HeY hey HEY';
    const queryPatterns = ['hey'];
    const expectedString = '<span class="Highlight">Hey</span> <span class="Highlight">heY</span> <span class="Highlight">hEy</span> <span class="Highlight">HeY</span> <span class="Highlight">hey</span> <span class="Highlight">HEY</span>';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns, true);
    const resultString = highlightString(matchString, submatches);
    assert.equal(resultString, expectedString);
  });

  it('two matches matched two times both', () => {
    const matchString = 'hey test lol hop test lol hi';
    const queryPatterns = [ 'lol', 'test' ];
    const expectedString = 'hey <span class="Highlight">test</span> <span class="Highlight">lol</span> hop <span class="Highlight">test</span> <span class="Highlight">lol</span> hi';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns);
    const resultString = highlightString(matchString, submatches);
    assert.equal(resultString, expectedString);
  });

  it('should not allow html exploiting', () => {
    const matchString = 'hello hello span hi';
    const queryPatterns = ['hello', 'span'];
    const expectedString = '<span class="Highlight">hello</span> <span class="Highlight">hello</span> <span class="Highlight">span</span> hi';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns);
    const resultString = highlightString(matchString, submatches);
    assert.equal(resultString, expectedString);
  });
});
