// base constant subscription state
export default class BaseState {
  constructor() {
    this._subscriptions = [];
    this._isAutoNotifyPrevented = false;
  }

  subscribe(cb) {
    this._subscriptions.push(cb);
  }
  notify() {
    this._isAutoNotifyPrevented = false;
    this._subscriptions.forEach(cb => cb());
  }
  preventAutoNotify() {
    this._isAutoNotifyPrevented = true;
  }
  autoNotify() {
    if (this._isAutoNotifyPrevented) return;
    this.notify();
  }
}
