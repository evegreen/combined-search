import { excludeIcon, arrowDownIcon } from '../icons';

export default function renderFile({ filePath, handleCollapse, handleClick, handleExclude }) {
  const file = document.createElement('tr');
  const firstColumn = document.createElement('td');
  const collapse = document.createElement('span');
  collapse.onclick = handleCollapse;
  collapse.innerHTML = arrowDownIcon;
  firstColumn.appendChild(collapse);
  const filePathElem = document.createElement('span');
  filePathElem.className = 'Highlight';
  filePathElem.onclick = handleClick;
  filePathElem.innerHTML = `<code>${filePath}</code>`;
  firstColumn.appendChild(filePathElem);
  file.appendChild(firstColumn);
  const fakeSecondColumn = document.createElement('td');
  fakeSecondColumn.onclick = handleClick;
  file.appendChild(fakeSecondColumn);
  const thirdExcludeColumn = document.createElement('td');
  thirdExcludeColumn.className = 'ExcludeButton';
  thirdExcludeColumn.onclick = handleExclude;
  thirdExcludeColumn.innerHTML = excludeIcon;
  file.appendChild(thirdExcludeColumn);
  return file;
}
