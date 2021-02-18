function validateKeyName(keyName) {
  switch (keyName) {
    case 'subscribe':
    case 'notify':
    case 'update':
    case 'preventAutoNotification':
    case 'enableAutoNotification':
    case 'autoNotify':
      throw new Error(
        'Cannot create state with reserved keywords in fields (subscribe, notify, update preventAutoNotification, enableAutoNotification, autoNotify(internal field))'
      );
  }
}

// base constant subscription state
// "class" maked with functions only just for example
export default function createState(initObj) {
  let isPartialSubscriptionProcess = false;
  let isAutoNotifyPrevented = false;
  let subscriptions = [];
  let innerState = {};
  let tempSubscriptionFields = [];

  /**
   * @param {() => void} cb
   * @param {(any) => any} [subscriberFn] - mapStateToProp or mapStateToProps - is a subscriber fn, it will executed in subscribe method of state object to determine set of subscribed fields
   */
  const subscribe = (cb, subscriberFn) => {
    if (subscriberFn) {
      tempSubscriptionFields = [];
      isPartialSubscriptionProcess = true;
      subscriberFn(resultState);
      isPartialSubscriptionProcess = false;
      subscriptions.push({ cb, subFields: tempSubscriptionFields });
      tempSubscriptionFields = [];
      return;
    }
    subscriptions.push({ cb });
  };

  /** @param {string | string[]} [changedFieldOrFields] */
  const notify = (changedFieldOrFields) => {
    enableAutoNotification();
    if (!changedFieldOrFields || changedFieldOrFields.length === 0) {
      subscriptions.forEach(s => s.cb());
      return;
    }
    const changedFields =
      typeof changedFieldOrFields === 'string'
        ? [changedFieldOrFields]
        : changedFieldOrFields;
    subscriptions.forEach(({ cb, subFields }) => {
      if (!subFields) {
        cb();
        return;
      }
      if (subFields.some(sf => changedFields.includes(sf))) {
        cb();
      }
    });
  };

  const preventAutoNotification = () => {
    isAutoNotifyPrevented = true;
  };

  const enableAutoNotification = () => {
    isAutoNotifyPrevented = false;
  };

  /** @param {string | string[]} fieldNameOrFieldNames */
  const autoNotify = (fieldNameOrFieldNames) => {
    if (isAutoNotifyPrevented) return;
    notify(fieldNameOrFieldNames);
  };

  /** @param {Object<string, any>} updaterObj */
  const update = (updaterObj) => {
    let changedFields = [];
    for (let [ key, newValue ] of Object.entries(updaterObj)) {
      if (newValue === innerState[key]) continue;
      innerState[key] = newValue;
      changedFields.push(key);
    }
    autoNotify(changedFields);
  };

  // construction
  let resultState = {
    subscribe,
    notify,
    update,
    preventAutoNotification,
    enableAutoNotification
  };
  for (let [ key, value ] of Object.entries(initObj)) {
    validateKeyName(key);
    innerState[key] = value;
    Object.defineProperty(resultState, key, {
      get: () => {
        if (isPartialSubscriptionProcess) {
          tempSubscriptionFields.push(key);
        }
        return innerState[key];
      },
      set: (newValue) => {
        if (newValue === innerState[key]) {
          return;
        }
        innerState[key] = newValue;
        autoNotify(key);
      }
    });
  }
  return resultState;
}
