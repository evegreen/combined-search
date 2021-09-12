import renderQueryTitle from './queryTitleView';
import renderStats from './statsView';
import ResultsContainer from './ResultsContainer';
import SettingsContainer from './SettingsContainer';
import EditorService from './EditorService';
import ResultsState from './ResultsState';
import {setUpSettings} from './settings';

const INITIAL_RESULTS_STATE = `$$INITIAL_RESULTS_STATE$$`;

function renderUi() {
  const rootState = new ResultsState(INITIAL_RESULTS_STATE);
  const {query, isContextSearch, stats, absPathsMap, files} = rootState;
  const settingsState = setUpSettings();
  const editorService = new EditorService(absPathsMap, settingsState);
  const queryTitle = renderQueryTitle(query);
  const statsElem = renderStats(stats);
  const settingsContainer = new SettingsContainer(settingsState);
  const resultsContainer = new ResultsContainer({
    files,
    isContextSearch,
    handleOpenEditor: (filePath, lineNumber) => editorService.open(filePath, lineNumber)
  });
  const root = document.querySelector('#root');
  root.append(
    queryTitle,
    statsElem,
    settingsContainer.elem,
    resultsContainer.elem
  );
}

renderUi();
