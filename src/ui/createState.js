function validateKeyName(keyName) {
  switch (keyName) {
    case 'subscribe':
    case 'notify':
    case 'getSubscribedCallbacks':
    case 'update':
    case 'preventAutoNotification':
    case 'enableAutoNotification':
    case 'autoNotify':
      throw new Error(
        'Cannot create state with reserved keywords in fields (subscribe, notify, getSubscribedCallbacks, update, preventAutoNotification, enableAutoNotification, autoNotify(internal field))'
      );
  }
}

// base constant subscription state
// "class" maked with functions only just for example
export function createState(initObj) {
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
    const subscribedCallbacks = getSubscribedCallbacks(changedFieldOrFields);
    subscribedCallbacks.forEach(sc => sc());
  };

  /** @param {string | string[]} [changedFieldOrFields] */
  const getSubscribedCallbacks = (changedFieldOrFields) => {
    if (!changedFieldOrFields) { // manual notification
      return subscriptions.map(s => s.cb);
    }
    if (changedFieldOrFields.length === 0) { // nothing changed
      return [];
    }
    const changedFields = typeof changedFieldOrFields === 'string'
      ? [changedFieldOrFields]
      : changedFieldOrFields;
    return subscriptions
      .map(subscription => {
        const { subFields } = subscription;
        if (!subFields) return subscription;
        if (subFields.some(sf => changedFields.includes(sf))) {
          return subscription;
        }
      })
      .filter(subscription => subscription)
      .map(subscription => subscription.cb);
  };

  const preventAutoNotification = () => {
    isAutoNotifyPrevented = true;
  };

  const enableAutoNotification = () => {
    isAutoNotifyPrevented = false;
  };

  /** @param {string[]} fieldNames */
  const autoNotify = function (fieldNames) {
    if (isBatchUpdateRunning) {
      registerBatchUpdateFields(/*state*/this, fieldNames);
      return;
    }
    if (isAutoNotifyPrevented) return;
    notify(fieldNames);
  };

  /** @param {Object<string, any>} updaterObj */
  const update = function (updaterObj) {
    let changedFields = [];
    for (let [ key, newValue ] of Object.entries(updaterObj)) {
      if (newValue === innerState[key]) continue;
      innerState[key] = newValue;
      changedFields.push(key);
    }
    autoNotify.call(/*state*/this, changedFields);
  };

  // construction
  let resultState = {
    subscribe,
    notify,
    getSubscribedCallbacks,
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
      set: function (newValue) {
        if (newValue === innerState[key]) return;
        innerState[key] = newValue;
        autoNotify.call(/*state*/this, [key]);
      }
    });
  }
  return resultState;
}

let isBatchUpdateRunning = false;
let batchStateFieldsMap;
export function batchUpdate(updaterFn) {
  batchStateFieldsMap = new Map();
  isBatchUpdateRunning = true;
  updaterFn();
  isBatchUpdateRunning = false;
  const nonUniqueCallbacks = Array.from(batchStateFieldsMap)
    .flatMap(([state, fields]) => state.getSubscribedCallbacks(fields));
  const uniqueCallbacks = [...new Set(nonUniqueCallbacks)];
  uniqueCallbacks.forEach(cb => cb());
}

function registerBatchUpdateFields(state, fieldNames) {
  if (!batchStateFieldsMap.has(state)) {
    batchStateFieldsMap.set(state, fieldNames);
    return;
  }
  let changedFields = batchStateFieldsMap.get(state);
  batchStateFieldsMap.set(state, changedFields.concat(fieldNames));
}
