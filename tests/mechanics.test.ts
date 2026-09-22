import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapHeightToNote, mapSeparationToFigure, calculateRealDurationSec } from '../src/data/musicalScaleData';
import { trackingState, palmAt } from '../src/services/trackingGeometry';
import { ColorBlobDetector } from '../src/services/colorDetection';
import { HoldTimer } from '../src/services/holdTimer';
import { classifyRhythmGesture } from '../src/services/gestureClassifier';
import { createRhythmEvaluation, evaluateRhythmGesture, getRhythmSequence } from '../src/services/rhythmEvaluation';

test('hold uses elapsed time, completes once and resets when tracking is lost', () => {
  const timer = new HoldTimer();
  timer.update(true, 100, 1000);
  assert.equal(timer.update(true, 600, 1000).progress, 50);
  assert.equal(timer.update(true, 1100, 1000).justCompleted, true);
  assert.equal(timer.update(true, 1200, 1000).justCompleted, false);
  assert.equal(timer.update(false, 1250, 1000).progress, 0);
  assert.equal(timer.update(true, 1300, 1000).progress, 0);
});
test('classifies rhythm gestures from the virtual opening scale', () => {
  assert.equal(classifyRhythmGesture(35), 'negra');
  assert.equal(classifyRhythmGesture(55), 'blanca');
  assert.equal(classifyRhythmGesture(75), 'redonda');
  assert.equal(classifyRhythmGesture(10), null);
});
test('evaluates the three-step rhythm sequence and supports restart', () => {
  assert.deepEqual(getRhythmSequence(2), ['negra', 'blanca', 'negra']);
  let evaluation = createRhythmEvaluation(2);
  evaluation = evaluateRhythmGesture(evaluation, 'negra');
  assert.equal(evaluation.position, 1);
  evaluation = evaluateRhythmGesture(evaluation, 'blanca');
  evaluation = evaluateRhythmGesture(evaluation, 'negra');
  assert.equal(evaluation.completed, true);
  assert.deepEqual(createRhythmEvaluation(2), {
    level: 2,
    sequence: ['negra', 'blanca', 'negra'],
    position: 0,
    completed: false,
  });
});

test('height increases pitch and opening increases duration', () => {
  assert.equal(mapHeightToNote(0.2).id, 'do5');
  assert.equal(mapHeightToNote(0.8).id, 'do4');
  assert.equal(mapSeparationToFigure(15).id, 'semicorchea');
  assert.equal(mapSeparationToFigure(85).id, 'redonda');
  assert.equal(calculateRealDurationSec(4, 120), 2);
  assert.equal(calculateRealDurationSec(0.25, 60), 0.25);
});
test('hysteresis suppresses tiny movements across note and figure boundaries', () => {
  assert.equal(mapHeightToNote(0.8 - (0.55 / 7) * 0.6, 0.2, 0.8, 'do4').id, 'do4');
  assert.equal(mapHeightToNote(0.8 - (0.7 / 7) * 0.6, 0.2, 0.8, 'do4').id, 're4');
  assert.equal(mapSeparationToFigure(15 + 0.55 * 70 / 4, 15, 85, 'semicorchea').id, 'semicorchea');
});
test('vertical movement cannot change the opening control', () => {
  const a = palmAt({ x: 0.2, y: 0.4 });
  const b = palmAt({ x: 0.8, y: 0.4 });
  assert.equal(trackingState(a, b).distanceCm, 75);
  assert.equal(trackingState(a, palmAt({ x: 0.8, y: 0.9 })).distanceCm, 75);
  assert.equal(trackingState(a, null).distanceCm, 0);
});
function scene() {
  const width = 40, height = 30, pixels = new Uint8ClampedArray(width * height * 4);
  function square(x: number, y: number, size: number, rgb: number[]) {
    for (let py = y; py < y + size; py++) for (let px = x; px < x + size; px++) pixels.set([...rgb, 255], (py * width + px) * 4);
  }
  return { pixels, square, detector: new ColorBlobDetector(width, height) };
}
test('colours select largest separate blobs, retaining identity after crossing', () => {
  const { pixels, square, detector } = scene();
  square(30, 10, 5, [220, 0, 0]); square(2, 5, 5, [0, 210, 210]);
  square(10, 20, 4, [240, 0, 0]);
  const [red, cyan] = detector.detect(pixels, '#ff0000', '#00ffff', 50);
  assert.ok(red && cyan);
  assert.equal(red.x, 32 / 40);
  assert.equal(cyan.x, 4 / 40);
  const next = detector.detect(pixels, '#ff0000', '#00ffff', 50);
  assert.deepEqual(next, [red, cyan]);
});
test('colour detection rejects noise and missing markers', () => {
  const { pixels, square, detector } = scene();
  square(2, 2, 2, [255, 0, 0]); square(20, 10, 5, [0, 190, 190]);
  const [red, cyan] = detector.detect(pixels, '#ff0000', '#00ffff', 50);
  assert.equal(red, null); assert.ok(cyan);
});
