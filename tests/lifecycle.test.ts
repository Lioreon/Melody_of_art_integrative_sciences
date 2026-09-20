import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HandTracker } from '../src/services/handTracker';

Object.defineProperty(globalThis, 'document', { value: { createElement: () => ({ getContext: () => ({}) }) }, configurable: true });
let nextFrame = 0;
const frames = new Set<number>();
Object.defineProperty(globalThis, 'requestAnimationFrame', { value: () => { frames.add(++nextFrame); return nextFrame; }, configurable: true });
Object.defineProperty(globalThis, 'cancelAnimationFrame', { value: (id: number) => frames.delete(id), configurable: true });
function fakeStream() {
  let stopped = 0;
  const track = { stop() { stopped++; }, onended: null };
  return { stream: { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream, stopped: () => stopped };
}
function media(getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>) {
  Object.defineProperty(globalThis, 'navigator', { value: { mediaDevices: { getUserMedia } }, configurable: true });
}
function video() { return { srcObject: null, play: async () => {} } as unknown as HTMLVideoElement; }

test('switching to simulation closes the camera and cancels its loop', async () => {
  const fake = fakeStream(); let requests = 0;
  media(async () => { requests++; return fake.stream; });
  const tracker = new HandTracker(), element = video();
  assert.equal(await tracker.initialize(element, () => {}, 'colored_balls'), true);
  assert.equal(requests, 1); assert.equal(frames.size, 1);
  tracker.enableSimulationMode();
  assert.equal(fake.stopped(), 1); assert.equal(frames.size, 0);
  assert.equal(element.srcObject, null); assert.equal(tracker.getIsSimulation(), true);
  tracker.stop(); assert.equal(tracker.getIsRunning(), false);
});
test('camera permission completing after stop cannot reactivate the camera', async () => {
  const fake = fakeStream(); let resolve!: (stream: MediaStream) => void;
  media(() => new Promise(done => { resolve = done; }));
  const tracker = new HandTracker();
  const init = tracker.initialize(video(), () => {}, 'colored_balls');
  tracker.stop(); resolve(fake.stream);
  assert.equal(await init, false); assert.equal(fake.stopped(), 1);
  assert.equal(tracker.getIsRunning(), false); assert.equal(frames.size, 0);
});
test('simulation preserves height when changing opening and uses one scale', () => {
  const tracker = new HandTracker(); let state: any;
  tracker.enableSimulationMode(value => { state = value; });
  tracker.setSimulatedPalmPositions(0.2, 0.25, 0.8, 0.25);
  tracker.setSimulatedDistanceCm(50);
  assert.equal(state.distanceCm, 50); assert.equal(state.leftPalm.center.y, 0.25);
  tracker.stop();
});

test('selected camera uses exact deviceId and closes previous source before opening another', async () => {
  const first = fakeStream(), second = fakeStream();
  const constraints: MediaStreamConstraints[] = [];
  media(async value => {
    constraints.push(value);
    if (constraints.length === 2) assert.equal(first.stopped(), 1);
    return constraints.length === 1 ? first.stream : second.stream;
  });
  const tracker = new HandTracker(), element = video();
  assert.equal(await tracker.initialize(element, () => {}, 'colored_balls', undefined, 'usb-camera'), true);
  assert.deepEqual((constraints[0].video as MediaTrackConstraints).deviceId, { exact: 'usb-camera' });
  assert.equal(await tracker.initialize(element, () => {}, 'colored_balls', undefined, 'virtual-camera'), true);
  assert.deepEqual((constraints[1].video as MediaTrackConstraints).deviceId, { exact: 'virtual-camera' });
  assert.equal(frames.size, 1);
  tracker.stop(); assert.equal(second.stopped(), 1); assert.equal(frames.size, 0);
});

test('unavailable selected camera reports an error without silently switching devices', async () => {
  let requests = 0;
  media(async () => { requests++; throw Object.assign(new Error('missing'), { name: 'OverconstrainedError' }); });
  const tracker = new HandTracker();
  assert.equal(await tracker.initialize(video(), () => {}, 'colored_balls', undefined, 'unplugged'), false);
  assert.equal(requests, 1);
  assert.match(tracker.getLastError(), /cámara elegida no está disponible/);
  assert.equal(tracker.getIsRunning(), false);
  assert.equal(frames.size, 0);
});
