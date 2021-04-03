import { createState } from './createState';

export function setUpSettings() {
  const LOCAL_STORAGE_OPEN_EDITOR_PORT_KEY = 'openEditorServicePort';
  const initialOesPort = Number(localStorage.getItem(LOCAL_STORAGE_OPEN_EDITOR_PORT_KEY)) || 3000;
  const settingsState = createState({
    isOpened: false,
    oesPort: initialOesPort
  });
  settingsState.subscribe(() => {
    localStorage.setItem(LOCAL_STORAGE_OPEN_EDITOR_PORT_KEY, settingsState.oesPort);
  }, ss => ss.oesPort);
  return settingsState;
}
