import { clearAllChildren } from '../utils';
import { settingsIcon } from './icons';

export default class SettingsContainer {
  constructor(settingsState) {
    this.elem = document.createElement('div');
    this.elem.className = 'SettingsContainer';
    this._state = settingsState;
    // preventing rerendering when input proceed
    this._isRenderPreventedOnce = false;
    settingsState.subscribe(() => {
      if (this._isRenderPreventedOnce) {
        this._isRenderPreventedOnce = false;
        return;
      }
      this.render();
    });
    this.render();
  }

  render() {
    const { isOpened } = this._state;
    clearAllChildren(this.elem);
    this.elem.append(
      this.renderSettingsButton(),
      isOpened ? this.renderSettingsPanel(this._state) : ''
    );
  }

  renderSettingsButton() {
    const elem = document.createElement('div');
    elem.className = 'SettingsButton';
    elem.onclick = () => { this._state.isOpened = !this._state.isOpened; };
    elem.innerHTML = settingsIcon;
    return elem;
  }

  renderSettingsPanel(settingsState) {
    const elem = document.createElement('div');
    elem.className = 'SettingsPanel';
    const infoSpan = document.createElement('span');
    infoSpan.innerHTML = `
      <a href="https://github.com/webpack/webpack-dev-server" target="_blank">webpack-dev-server</a> or <a href="https://github.com/evegreen/combined-search/blob/master/openEditorService.js" target="_blank">openEditorService</a> local port:&nbsp;
    `;
    const portInput = document.createElement('input');
    portInput.type = 'number';
    portInput.value = `${settingsState.oesPort}`;
    portInput.onchange = (event) => { this._handleChangeOESPort(event.target.valueAsNumber); };
    elem.append(infoSpan, portInput);
    return elem;
  }

  _handleChangeOESPort(newPort) {
    this._isRenderPreventedOnce = true;
    this._state.oesPort = newPort;
  }
}
