import renderQueryTitle from './queryTitleView';
import renderStats from './statsView';
import ResultsContainer from './ResultsContainer';
import EditorService from './EditorService';
import RootState from './RootState';

const INITIAL_STATE = `$$INITIAL_STATE$$`;

function renderUi() {
  const rootState = new RootState(INITIAL_STATE);
  const { query, stats, absPathsMap, files } = rootState;
  const editorService = new EditorService(absPathsMap);
  const root = document.querySelector('#root');
  const queryTitle = renderQueryTitle(query);
  const statsElem = renderStats(stats);
  const resultsContainer = new ResultsContainer({
    files,
    handleOpenEditor: (filePath, lineNumber) => editorService.open(filePath, lineNumber)
  });
  root.append(
    queryTitle,
    statsElem,
    resultsContainer.elem
  );
}

renderUi();

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
function toggleDisplayNone(elem) {
  elem.style.display = elem.style.display === 'none' ? '' : 'none';
}
function toggleSettings(settingsGearButton) {
  toggleDisplayNone(settingsPanel);
}
