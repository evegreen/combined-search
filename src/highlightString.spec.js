'use strict';

const { assert } = require('chai');
const highlightMatchString = require('./highlightString');

describe('highlightMatchString', () => {
  it('marks 2 matches with 2 switched queryPatterns', () => {
    const srcMatchString = 'hello friend';
    const queryPatterns = [ 'friend', 'hello' ];
    const actual = highlightMatchString(srcMatchString, queryPatterns);
    assert.equal(actual, '<span class="Highlight">hello</span> <span class="Highlight">friend</span>');
  });
  it('marks 6 case insensitive matches', () => {
    const srcMatchString = 'Hey heY hEy HeY hey HEY';
    const queryPatterns = [ 'hey' ];
    const ignoreCase = true;
    const actual = highlightMatchString(srcMatchString, queryPatterns, ignoreCase);
    assert.equal(
      actual,
      `<span class="Highlight">Hey</span> <span class="Highlight">heY</span> <span class="Highlight">hEy</span> <span class="Highlight">HeY</span> <span class="Highlight">hey</span> <span class="Highlight">HEY</span>`
    );
  });
  it('marks two same matches', () => {
    const srcMatchString = 'hello hello';
    const queryPatterns = [ 'hello' ];
    const actual = highlightMatchString(srcMatchString, queryPatterns);
    assert.equal(actual, '<span class="Highlight">hello</span> <span class="Highlight">hello</span>');
  });
  it('should not allow html exploiting', () => {
    const srcMatchString = 'hello';
    const queryPatterns = [ 'hello', 'span' ];
    const actual = highlightMatchString(srcMatchString, queryPatterns);
    assert.equal(actual, '<span class="Highlight">hello</span>');
  });
});
