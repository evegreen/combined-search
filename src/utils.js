'use strict';

exports.sortObjectMap = function sortObjectMap(objectMap, comparator) {
  let sortable = [];
  for (let [key, value] of Object.entries(objectMap)) {
    sortable.push({ key, value });
  }

  sortable.sort(comparator);
  return sortable.reduce((acc, cur) => {
    acc[cur.key] = cur.value;
    return acc;
  }, {});
};

exports.escapeHtml = function escapeHtml(htmlString) {
  return htmlString
    .split('&').join('&amp;')
    .split('"').join('&quot;')
    .split(`'`).join('&#39;')
    .split('<').join('&lt;')
    .split('>').join('&gt;');
};
