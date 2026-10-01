import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palmAt, trackingState } from '../src/services/trackingGeometry';
import {
  NumericSessionRecorder,
  deserializeReplaySession,
  replayMusicalSession,
  serializeReplaySession,
} from '../src/services/sessionReplay';

const fixtureText = readFileSync(
  new URL('./fixtures/mm-r1b-canonical.json', import.meta.url),
  'utf8',
);

test('records raw DualPalmState frames with relative monotonic time and immutable snapshots', () => {
  const recorder = new NumericSessionRecorder('simulation', null, { width: 640, height: 480 });
  const first = trackingState(palmAt({ x: 0.3, y: 0.8 }), palmAt({ x: 0.7, y: 0.8 }), 640, 480, 1000);
  recorder.capture(first);
  first.leftPalm!.center.y = 0.1;
  recorder.capture(trackingState(null, null, 640, 480, 1100));

  const session = recorder.finish();
  assert.deepEqual(session.frames.map((frame) => frame.tMs), [0, 100]);
  assert.equal(session.frames[0].state.leftPalm?.center.y, 0.8);
  assert.equal(session.context.recordedCalibration, null);
  assert.deepEqual(session.context.viewport, { width: 640, height: 480 });
});

test('recorder rejects decreasing source timestamps', () => {
  const recorder = new NumericSessionRecorder('simulation');
  recorder.capture(trackingState(null, null, 640, 480, 100));
  assert.throws(
    () => recorder.capture(trackingState(null, null, 640, 480, 99)),
    /monotonic/i,
  );
});

test('serializes and validates a replay session at the JSON boundary', () => {
  const session = deserializeReplaySession(fixtureText);
  assert.deepEqual(deserializeReplaySession(serializeReplaySession(session)), session);
});

test('runtime validation rejects unknown versions, backends, invalid coordinates and malformed frames', () => {
  const invalidDocuments = [
    fixtureText.replace('"schemaVersion": 1', '"schemaVersion": 2'),
    fixtureText.replace('"backend": "simulation"', '"backend": "camera-x"'),
    fixtureText.replace('"x": 0.3', '"x": 1.3'),
    fixtureText.replace('"tMs": 100', '"tMs": -1'),
    fixtureText.replace('"distancePx": 256', '"distancePx": 1e400'),
    '{"schemaVersion":1,"backend":"simulation","context":{"recordedCalibration":null},"frames":[{}]}',
  ];

  for (const document of invalidDocuments) {
    assert.throws(() => deserializeReplaySession(document));
  }
});

test('canonical fixture replays deterministically without camera access', () => {
  const session = deserializeReplaySession(fixtureText);
  const firstRun = replayMusicalSession(session);
  const secondRun = replayMusicalSession(session);

  assert.deepEqual(firstRun, secondRun);
  assert.deepEqual(firstRun, [
    { tMs: 0, trackingValid: true, noteId: 'si3', figureId: 'negra', leftGesture: 'UNKNOWN', rightGesture: 'UNKNOWN' },
    { tMs: 100, trackingValid: true, noteId: 'si3', figureId: 'negra', leftGesture: 'UNKNOWN', rightGesture: 'UNKNOWN' },
    { tMs: 200, trackingValid: true, noteId: 'la4', figureId: 'negra', leftGesture: 'UNKNOWN', rightGesture: 'UNKNOWN' },
    { tMs: 300, trackingValid: true, noteId: 'la4', figureId: 'blanca', leftGesture: 'OPEN_HAND', rightGesture: 'OPEN_HAND' },
    { tMs: 400, trackingValid: true, noteId: 'la4', figureId: 'blanca', leftGesture: 'OPEN_HAND', rightGesture: 'OPEN_HAND' },
    { tMs: 500, trackingValid: false, noteId: null, figureId: null, leftGesture: 'OPEN_HAND', rightGesture: null },
    { tMs: 600, trackingValid: true, noteId: 'la4', figureId: 'blanca', leftGesture: 'OPEN_HAND', rightGesture: 'OPEN_HAND' },
  ]);
});

test('recorded calibration is context and can be overridden or removed during replay', () => {
  const session = deserializeReplaySession(fixtureText);
  session.context.recordedCalibration = {
    minOpening: 20,
    maxOpening: 80,
    lowY: 0.8,
    highY: 0.2,
    capturedAt: 1,
    version: 1,
  };

  const recordedCalibrationResult = replayMusicalSession(session);
  const noCalibrationResult = replayMusicalSession(session, null);
  assert.notDeepEqual(recordedCalibrationResult, noCalibrationResult);
  assert.equal(session.frames[0].state.leftPalm?.center.y, 0.8);
});
