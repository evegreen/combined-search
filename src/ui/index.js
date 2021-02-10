import renderQueryTitle from './queryTitleView';
import renderStats from './statsView';
import renderResultsContainer from './resultsContainer';
import EditorService from './EditorService';
import State from './State';
import {
  excludeIcon,
  undoIcon,
  arrowDownIcon,
  arrowRightIcon
} from './icons';

const INITIAL_STATE = `$$INITIAL_STATE$$`;

function renderUi() {
  const state = new State(INITIAL_STATE);
  const { query, stats, absPathsMap, files } = state;
  const root = document.querySelector('#root');
  const queryTitle = renderQueryTitle(query);
  root.appendChild(queryTitle);
  const statsElem = renderStats(stats);
  root.appendChild(statsElem);
  const editorService = new EditorService(absPathsMap);
  const resultsElem = renderResultsContainer(files, editorService);
  root.appendChild(resultsElem);
}

renderUi();



const EXCLUDE_CLASSNAME = 'ExcludedMatch';
const LOCAL_STORAGE_OPEN_EDITOR_PORT_KEY = 'openEditorServicePort';
let openEditorServicePort = Number(localStorage.getItem(LOCAL_STORAGE_OPEN_EDITOR_PORT_KEY)) || 3000;
document.querySelector('#port').value = openEditorServicePort;
const settingsPanel = document.querySelector('.SettingsPanel');
toggleDisplayNone(settingsPanel);
function handleChangeOpenEditorPort(input) {
  const newPort = Number(input.value);
  openEditorServicePort = newPort;
  localStorage.setItem(LOCAL_STORAGE_OPEN_EDITOR_PORT_KEY, newPort);
}
function toggleMatchExclude(excludeButtonElem, newExcludeState, isFinalChange) {
  const matchLineElem = excludeButtonElem.parentElement;
  let matchClassList = matchLineElem.classList;
  matchClassList.toggle(EXCLUDE_CLASSNAME, newExcludeState);
  const isExcluded = matchClassList.contains(EXCLUDE_CLASSNAME);
  excludeButtonElem.innerHTML = isExcluded ? undoIcon : excludeIcon;
  if (!newExcludeState && !isFinalChange) {
    const file = getDatasetFileAttr(matchLineElem);
    const fileMatchLine = findParentFileMatchLine(file);
    if (isExcluded) {
      if (isAllSiblingsExcluded(file)) {
        toggleMatchExclude(fileMatchLine.children[2], true, true);
      }
    } else {
      if (fileMatchLine.classList.contains(EXCLUDE_CLASSNAME)) {
        toggleMatchExclude(fileMatchLine.children[2], false, true);
      }
    }
  }

  return isExcluded;
}
function toggleFileExclude(excludeButtonElem) {
  const matchLineElem = excludeButtonElem.parentElement;
  const file = getDatasetFileAttr(matchLineElem);
  const isExcluded = toggleMatchExclude(excludeButtonElem, undefined, true);
  const isCollapsed = matchLineElem.dataset.collapsed;
  findSiblings(file).map(
    matchElem => matchElem.children[2]
  ).forEach(
    matchCloseButton => toggleMatchExclude(matchCloseButton, isExcluded, true)
  );
  if (isExcluded && !isCollapsed) {
    const collapseIcon = matchLineElem.children[0].children[0];
    toggleCollapseMatchStrings(collapseIcon);
  }
}
function isAllSiblingsExcluded(filePath) {
  return !findSiblings(filePath).some(
    matchLineElem => !matchLineElem.classList.contains(EXCLUDE_CLASSNAME)
  );
}
function findSiblings(filePath) {
  return Array.from(
    document.querySelectorAll(`.MatchTable tr[data-parent-file="${filePath}"]`)
  );
}
function findParentFileMatchLine(filePath) {
  return document.querySelector(`.MatchTable tr[data-file="${filePath}"]`);
}
function getDatasetFileAttr(lineElem) {
  return lineElem.dataset.file || lineElem.dataset.parentFile;
}
function toggleCollapseMatchStrings(collapseIcon) {
  const fileMatchLine = collapseIcon.parentElement.parentElement;
  if (fileMatchLine.dataset.collapsed) {
    collapseIcon.innerHTML = arrowDownIcon;
    delete fileMatchLine.dataset.collapsed;
  } else {
    collapseIcon.innerHTML = arrowRightIcon;
    fileMatchLine.dataset.collapsed = true;
  }

  const file = getDatasetFileAttr(fileMatchLine);
  findSiblings(file)
    .forEach(
      matchElem => toggleDisplayNone(matchElem)
    );
}
function toggleDisplayNone(elem) {
  elem.style.display = elem.style.display === 'none' ? '' : 'none';
}
function toggleSettings(settingsGearButton) {
  toggleDisplayNone(settingsPanel);
}
