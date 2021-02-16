function validateKeyName(keyName) {
  switch (keyName) {
    case 'subscribe':
    case 'notify':
    case 'preventAutoNotification':
    case 'enableAutoNotification':
    case 'autoNotify':
      throw new Error(
        'Cannot create state with reserved keywords in fields (subscribe, notify, preventAutoNotification, enableAutoNotification, autoNotify(internal field))'
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

  /** @param {string} [changedFieldName] */
  const notify = (changedFieldName) => {
    enableAutoNotification();
    subscriptions.forEach(({ cb, subFields }) => {
      if (!subFields || !changedFieldName) {
        cb();
        return;
      }
      if (subFields.includes(changedFieldName)) {
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

  /** @param {string} fieldName */
  const autoNotify = (fieldName) => {
    if (isAutoNotifyPrevented) return;
    notify(fieldName);
  };

  // construction
  let resultState = {
    subscribe,
    notify,
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
