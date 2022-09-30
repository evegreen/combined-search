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

export function escapeHtml(htmlString) {
  return htmlString
    .split('&').join('&amp;')
    .split('"').join('&quot;')
    .split(`'`).join('&#39;')
    .split('<').join('&lt;')
    .split('>').join('&gt;');
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

export function unprefixFilePath(filePath) {
  if (filePath.length < 3) return filePath;
  let path = filePath;
  while (path.startsWith('./')) {
    path = path.substring(2);
  }
  return path;
}
