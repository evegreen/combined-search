import chai from 'chai';
import createState from './createState.js';
const { assert } = chai;

describe('createState instance', () => {
  it('should auto notify subscribers', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let subscriberCalled = false;
    carState.subscribe(() => { subscriberCalled = true; });
    carState.fuel = 34;
    assert.equal(subscriberCalled, true);
  });
  it('should auto notify only when subscribed field change', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    const mapStateToProp = carState => carState.engineSpeed;
    let subscriberCalled = false;
    carState.subscribe(() => { subscriberCalled = true; }, mapStateToProp);
    carState.fuel = 34;
    assert.equal(subscriberCalled, false);
    carState.engineSpeed = 4000;
    assert.equal(subscriberCalled, true);
  });
  it('should stop and resume auto notification after notification enabled', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let subscriberCalledCount = 0;
    carState.subscribe(() => { subscriberCalledCount++; });
    carState.preventAutoNotification();
    carState.fuel = 34;
    carState.engineSpeed = 4000;
    assert.equal(subscriberCalledCount, 0);
    carState.enableAutoNotification();
    assert.equal(subscriberCalledCount, 0);
    carState.fuel = 33;
    carState.engineSpeed = 4500;
    assert.equal(subscriberCalledCount, 2);
  });
  it('should stop and resume auto notification after manual notify called', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let subscriberCalledCount = 0;
    carState.subscribe(() => { subscriberCalledCount++; });
    carState.preventAutoNotification();
    carState.fuel = 34;
    carState.engineSpeed = 4000;
    assert.equal(subscriberCalledCount, 0);
    carState.notify();
    assert.equal(subscriberCalledCount, 1);
    carState.fuel = 33;
    carState.engineSpeed = 4500;
    assert.equal(subscriberCalledCount, 3);
  });
  it('should not auto notify subscriber, when same value setted', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let subscriberCalled = false;
    carState.subscribe(() => { subscriberCalled = true; });
    carState.fuel = 35; // try set same value
    assert.equal(subscriberCalled, false);
  });
  it('should manual notify only specified field subscriber', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let fuelSubscriberCalled = false;
    let engineSubscriberCalled = false;
    carState.subscribe(
      () => { fuelSubscriberCalled = true; },
      state => state.fuel
    );
    carState.subscribe(
      () => { engineSubscriberCalled = true; },
      state => state.engineSpeed
    );
    carState.notify('fuel');
    assert.equal(fuelSubscriberCalled, true);
    assert.equal(engineSubscriberCalled, false);
  });
  it('should not allow use reserved keywords for state field names', () => {
    assert.throws(
      () => { createState({ fuel: 35, notify: 'some value' }); },
      Error,
      'Cannot create state with reserved keywords in fields (subscribe, notify, preventAutoNotification, enableAutoNotification, autoNotify(internal field))'
    );
  });
});
