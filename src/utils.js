export function sortObjectMap(objectMap, comparator) {
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

export function escapeHtml(htmlString, escapeWhitespaces = false) {
  const partialEscaped = htmlString
    .split('&').join('&amp;')
    .split('"').join('&quot;')
    .split(`'`).join('&#39;')
    .split('<').join('&lt;')
    .split('>').join('&gt;');
  return escapeWhitespaces
    ? partialEscaped.split(' ').join('&nbsp;')
    : partialEscaped;
};

export function escapeForJsTemplateLiteral(str) {
  return str
    .split('\\').join('\\\\')
    .split('`').join('\\`')
    .split('${').join('\\$\\{')
    .split('}').join('\\}');
};

export function clearAllChildren(parentElem) {
  while (parentElem.firstChild) {
    parentElem.removeChild(parentElem.lastChild);
  }
}

export function clearElems(elems) {
  if (!elems || elems.length === 0) return;
  elems.forEach(elem => {
    if (!elem) return;
    elem.parentNode.removeChild(elem);
  });
}
