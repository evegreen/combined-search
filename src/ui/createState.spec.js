import chai from 'chai';
import { createState, batchUpdate } from './createState.js';
const { assert } = chai;

describe('batchUpdate', () => {
  it('should stop auto notification while sync updater fn works, then auto notify each changed states', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    const copterState = createState({ battery: 90 });
    let fuelSubscriber = 0;
    let engineSubscriber = 0;
    let batterySubscriber = 0;
    carState.subscribe(() => { fuelSubscriber++; }, cs => cs.fuel);
    carState.subscribe(() => { engineSubscriber++; }, cs => cs.engineSpeed);
    copterState.subscribe(() => { batterySubscriber++; }, cs => cs.battery);
    batchUpdate(() => {
      carState.fuel = 34;
      copterState.battery = 89;
      assert.equal(fuelSubscriber, 0);
      assert.equal(engineSubscriber, 0);
      assert.equal(batterySubscriber, 0);
    });
    assert.equal(fuelSubscriber, 1);
    assert.equal(engineSubscriber, 0);
    assert.equal(batterySubscriber, 1);
  });
  it('should auto notify only changed states once after batch', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000, oilLevel: 50 });
    const copterState = createState({ battery: 90 });
    let fuelAndEngineSubscriber = 0;
    let oilSubscriber = 0;
    let batterySubscriber = 0;
    carState.subscribe(() => { fuelAndEngineSubscriber++; }, cs => {
      cs.fuel;
      cs.engineSpeed;
    });
    carState.subscribe(() => { oilSubscriber++; }, cs => cs.oilLevel);
    copterState.subscribe(() => { batterySubscriber++; }, cs => cs.battery);
    batchUpdate(() => {
      carState.fuel = 34;
      copterState.battery = 89;
      carState.engineSpeed = 4000;
      assert.equal(fuelAndEngineSubscriber, 0);
      assert.equal(oilSubscriber, 0);
      assert.equal(batterySubscriber, 0);
    });
    assert.equal(fuelAndEngineSubscriber, 1);
    assert.equal(oilSubscriber, 0);
    assert.equal(batterySubscriber, 1);
  });
  it('should pause/resume auto notification both on "update" fn or setter fn', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000, oilLevel: 50 });
    let fuelSubscriber = 0;
    let engineSubscriber = 0;
    let oilSubscriber = 0;
    carState.subscribe(() => { fuelSubscriber++; }, cs => cs.fuel);
    carState.subscribe(() => { engineSubscriber++; }, cs => cs.engineSpeed);
    carState.subscribe(() => { oilSubscriber++; }, cs => cs.oilLevel);
    batchUpdate(() => {
      carState.fuel = 34;
      carState.update({ engineSpeed: 4000, oilLevel: 49 });
      assert.equal(fuelSubscriber, 0);
      assert.equal(engineSubscriber, 0);
      assert.equal(oilSubscriber, 0);
    });
    assert.equal(fuelSubscriber, 1);
    assert.equal(engineSubscriber, 1);
    assert.equal(oilSubscriber, 1);
  });
  it('should call subscriber fn once, when it subscribed on different states', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    const copterState = createState({ battery: 90 });
    let commonVehicleSubscriber = 0;
    const vehicleSubscriberFn = () => { commonVehicleSubscriber++; };
    carState.subscribe(vehicleSubscriberFn);
    copterState.subscribe(vehicleSubscriberFn);
    batchUpdate(() => {
      carState.fuel = 34;
      copterState.battery = 89;
    });
    assert.equal(commonVehicleSubscriber, 1);
  });
});
describe('createState instance', () => {
  describe('.update({...})', () => {
    it('should auto notify only updated fields (except same value setted)', () => {
      const carState = createState({ fuel: 35, engineSpeed: 3000, oilLevel: 50 });
      let fuelSubscriber = 0;
      let engineSubscriber = 0;
      let oilSubscriber = 0;
      carState.subscribe(() => { fuelSubscriber++; }, cs => cs.fuel);
      carState.subscribe(() => { engineSubscriber++; }, cs => cs.engineSpeed);
      carState.subscribe(() => { oilSubscriber++; }, cs => cs.oilLevel);
      carState.update({ fuel: 34, oilLevel: 50 });
      assert.equal(fuelSubscriber, 1);
      assert.equal(engineSubscriber, 0);
      assert.equal(oilSubscriber, 0);
      carState.update({ engineSpeed: 5000, oilLevel: 49 });
      assert.equal(fuelSubscriber, 1);
      assert.equal(engineSubscriber, 1);
      assert.equal(oilSubscriber, 1);
    });
    it('should not call subscriber, when all setted values was the same', () => {
      const carState = createState({ fuel: 35, engineSpeed: 3000 });
      let carSubscriber = 0;
      carState.subscribe(() => { carSubscriber++; });
      carState.update({ fuel: 35, engineSpeed: 3000 });
      assert.equal(carSubscriber, 0);
    });
  });
  it('should auto notify subscribers', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let carSubscriber = 0;
    carState.subscribe(() => { carSubscriber++; });
    carState.fuel = 34;
    assert.equal(carSubscriber, 1);
  });
  it('should auto notify only when subscribed field change', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let engineSubscriber = 0;
    carState.subscribe(
      () => { engineSubscriber++; },
      carState => carState.engineSpeed
    );
    carState.fuel = 34;
    assert.equal(engineSubscriber, 0);
    carState.engineSpeed = 4000;
    assert.equal(engineSubscriber, 1);
  });
  it('should stop and resume auto notification after notification enabled', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let carSubscriber = 0;
    carState.subscribe(() => { carSubscriber++; });
    carState.preventAutoNotification();
    carState.fuel = 34;
    carState.engineSpeed = 4000;
    assert.equal(carSubscriber, 0);
    carState.enableAutoNotification();
    assert.equal(carSubscriber, 0);
    carState.fuel = 33;
    carState.engineSpeed = 4500;
    assert.equal(carSubscriber, 2);
  });
  it('should stop and resume auto notification after manual notify called', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let carSubscriber = 0;
    carState.subscribe(() => { carSubscriber++; });
    carState.preventAutoNotification();
    carState.fuel = 34;
    carState.engineSpeed = 4000;
    assert.equal(carSubscriber, 0);
    carState.notify();
    assert.equal(carSubscriber, 1);
    carState.fuel = 33;
    carState.engineSpeed = 4500;
    assert.equal(carSubscriber, 3);
  });
  it('should not auto notify subscriber, when same value setted', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let carSubscriber = 0;
    carState.subscribe(() => { carSubscriber++; });
    carState.fuel = 35; // try set same value
    assert.equal(carSubscriber, 0);
  });
  it('should manual notify only specified field subscriber', () => {
    const carState = createState({ fuel: 35, engineSpeed: 3000 });
    let fuelSubscriber = 0;
    let engineSubscriber = 0;
    carState.subscribe(
      () => { fuelSubscriber++; },
      state => state.fuel
    );
    carState.subscribe(
      () => { engineSubscriber++; },
      state => state.engineSpeed
    );
    carState.notify('fuel');
    assert.equal(fuelSubscriber, 1);
    assert.equal(engineSubscriber, 0);
  });
  it('should not allow use reserved keywords for state field names', () => {
    assert.throws(
      () => { createState({ fuel: 35, notify: 'some value' }); },
      Error,
      'Cannot create state with reserved keywords in fields (subscribe, notify, getSubscribedCallbacks, update, preventAutoNotification, enableAutoNotification, autoNotify(internal field))'
    );
  });
});
