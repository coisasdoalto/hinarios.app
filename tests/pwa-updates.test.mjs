import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import {
  startServiceWorkerUpdates,
  MIN_UPDATE_CHECK_INTERVAL,
  UPDATE_CHECK_INTERVAL,
} from '../utils/serviceWorkerUpdates.ts';

let sw;
let registration;
let notices;
let registrations;
let updates;
let now;
let timer;
let stop;
let descriptors;
const originalNow = Date.now;
const worker = () => ({ postMessage() {} });
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => {
  descriptors = Object.fromEntries(
    ['window', 'document', 'navigator'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ])
  );
  sw = new EventTarget();
  sw.controller = worker();
  notices = 0;
  registrations = [];
  updates = 0;
  now = 1000;
  Date.now = () => now;
  registration = {
    update: async () => {
      updates += 1;
    },
  };
  sw.register = async (...args) => {
    registrations.push(args);
    return registration;
  };
  const window = new EventTarget();
  window.setInterval = (callback, ms) => {
    assert.equal(ms, UPDATE_CHECK_INTERVAL);
    timer = callback;
    return 1;
  };
  window.clearInterval = () => {
    timer = null;
  };
  const document = new EventTarget();
  document.visibilityState = 'visible';
  for (const [key, value] of Object.entries({
    window,
    document,
    navigator: { serviceWorker: sw, onLine: true },
  })) {
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
});

afterEach(() => {
  stop?.();
  stop = undefined;
  Date.now = originalNow;
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

function start() {
  stop = startServiceWorkerUpdates(() => {
    notices += 1;
  }, 'build-a');
}

test('registers without HTTP cache and throttles focus/visibility checks', async () => {
  start();
  await flush();
  assert.deepEqual(registrations, [['/sw.js', { scope: '/', updateViaCache: 'none' }]]);
  window.dispatchEvent(new Event('focus'));
  assert.equal(updates, 0);
  now += MIN_UPDATE_CHECK_INTERVAL;
  window.dispatchEvent(new Event('focus'));
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(updates, 1);
  now += UPDATE_CHECK_INTERVAL;
  timer();
  await flush();
  assert.equal(updates, 2);
});

test('skips hidden/offline checks and retries when online', async () => {
  navigator.onLine = false;
  start();
  assert.equal(registrations.length, 0);
  navigator.onLine = true;
  window.dispatchEvent(new Event('online'));
  await flush();
  assert.equal(registrations.length, 1);
  now += MIN_UPDATE_CHECK_INTERVAL;
  document.visibilityState = 'hidden';
  timer();
  assert.equal(updates, 0);
  document.visibilityState = 'visible';
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(updates, 1);
});

test('ignores first install, then announces a replacement without reloading', () => {
  sw.controller = null;
  start();
  sw.controller = worker();
  sw.dispatchEvent(new Event('controllerchange'));
  assert.equal(notices, 0);
  sw.controller = worker();
  sw.dispatchEvent(new Event('controllerchange'));
  assert.equal(notices, 1);
});

test('detects an already activated build, ignoring matching or foreign messages', () => {
  start();
  const message = (source, buildId) => {
    const event = new Event('message');
    Object.assign(event, { source, data: { type: 'APP_BUILD_ID', buildId } });
    sw.dispatchEvent(event);
  };
  message(sw.controller, 'build-a');
  message(worker(), 'build-b');
  assert.equal(notices, 0);
  message(sw.controller, 'build-b');
  assert.equal(notices, 1);
});

test('retries failed registration and removes listeners on cleanup', async () => {
  sw.register = async () => {
    throw new Error('offline');
  };
  start();
  await flush();
  sw.register = async () => {
    registrations.push(true);
    return registration;
  };
  now += MIN_UPDATE_CHECK_INTERVAL;
  window.dispatchEvent(new Event('online'));
  await flush();
  assert.equal(registrations.length, 1);
  stop();
  assert.equal(timer, null);
  now += MIN_UPDATE_CHECK_INTERVAL;
  window.dispatchEvent(new Event('focus'));
  sw.controller = worker();
  sw.dispatchEvent(new Event('controllerchange'));
  assert.equal(updates, 0);
  assert.equal(notices, 0);
});

test('does not overlap checks or restart an installation', async () => {
  start();
  await flush();
  registration.installing = worker();
  now += MIN_UPDATE_CHECK_INTERVAL;
  timer();
  await flush();
  assert.equal(updates, 0);
  registration.installing = null;
  let finish;
  registration.update = () => {
    updates += 1;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  now += MIN_UPDATE_CHECK_INTERVAL;
  timer();
  now += MIN_UPDATE_CHECK_INTERVAL;
  timer();
  assert.equal(updates, 1);
  finish();
  await flush();
});
