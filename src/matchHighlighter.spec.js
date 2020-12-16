'use strict';

const { assert } = require('chai');
const { highlightString } = require('./matchHighlighter');

// returns same submatches like rg --json command (only for non regex patterns)
function evalNonRegexRgSubmatches(matchString, patterns) {
  let submatches = [];
  for (let pattern of patterns) {
    let patternIdx = -1;
    let patternEndIdx = null;
    do {
      patternIdx = matchString.indexOf(pattern, patternEndIdx);
      if (patternIdx !== -1) {
        patternEndIdx = patternIdx + pattern.length;
        submatches.push({
          match: { text: pattern },
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

  it('with escaping symbols', () => {
    const matchString = '<hey> test& <lol>';
    const queryPatterns = [ 'test&' ];
    const expectedString = '&lt;hey&gt; <span class="Highlight">test&amp;</span> &lt;lol&gt;';
    const submatches = evalNonRegexRgSubmatches(matchString, queryPatterns);
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
});
