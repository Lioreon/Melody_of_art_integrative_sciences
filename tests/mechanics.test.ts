import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapHeightToNote, mapSeparationToFigure, calculateRealDurationSec, mapBodyToMusic, ledgerLineStepsForStaffStep, noteHeightForId } from '../src/data/musicalScaleData';
import { trackingState, palmAt } from '../src/services/trackingGeometry';
import { ColorBlobDetector } from '../src/services/colorDetection';
import { HoldTimer } from '../src/services/holdTimer';
import { classifyGesture, type GestureLandmark } from '../src/services/gestureClassifier';
import {
  advanceRhythmSequence,
  evaluateRhythmTarget,
  exploreRhythm,
  generateRhythmSequence,
  getRhythmVocabulary,
  pickRhythmTarget,
  sequenceLengthForDifficulty,
} from '../src/services/rhythmEvaluation';
import { MUSICAL_FIGURES } from '../src/data/scorePresets';
import { midiToFrequency, nearestInstrumentSample, noteNameToMidi } from '../src/services/instrumentSamples';
import { beatDurationMs, buildCompasTimeline, compasGuidance, COMPAS_PATTERNS, getCompasFrame } from '../src/services/compasAccordion';
import { TrackingDiagnosticsRecorder } from '../src/services/trackingDiagnostics';
import { palmDataFromLandmarks } from '../src/services/handObservation';
import { GestureStateStabilizer } from '../src/services/gestureStability';
import { analyzeHandGeometry } from '../src/services/handGeometry';
import {
  applyAccidentalToFrequency,
  equivalentRestForFigure,
  interpretBimanualMusicalGesture,
} from '../src/services/musicalGesture';
import {
  EMPTY_LEARNING_SCORE,
  RANKING_UNLOCK_POINTS,
  addLearningPoints,
  isRankingUnlocked,
  pentagramGameAward,
  rhythmGameAward,
  totalLearningPoints,
} from '../src/services/learningGame';
import {
  parseStoredInstrumentTimbre,
  parseStoredLiveSoundFeedback,
} from '../src/services/userPreferences';
import {
  applyBodyCalibration,
  musicalOpeningToRaw,
  musicalYToRaw,
  normalizeHeight,
  normalizeOpening,
  rawOpeningToMusical,
  rawYToMusical,
} from '../src/services/bodyCalibration';
import { deriveCameraStageState } from '../src/services/cameraStage';
import type { BodyCalibration } from '../src/types';

test('hold uses elapsed time, completes once and resets when tracking is lost', () => {
  const timer = new HoldTimer();
  timer.update(true, 100, 1000);
  assert.equal(timer.update(true, 600, 1000).progress, 50);
  assert.equal(timer.update(true, 1100, 1000).justCompleted, true);
  assert.equal(timer.update(true, 1200, 1000).justCompleted, false);
  assert.equal(timer.update(false, 1250, 1000).progress, 0);
  assert.equal(timer.update(true, 1300, 1000).progress, 0);
});

test('height spans Sol3 to Si5 and opening increases duration', () => {
  assert.equal(mapHeightToNote(0.08).id, 'si5');
  assert.equal(mapHeightToNote(0.92).id, 'sol3');
  assert.equal(mapHeightToNote(noteHeightForId('do4')).id, 'do4');
  assert.equal(mapHeightToNote(noteHeightForId('do5')).id, 'do5');
  assert.equal(mapSeparationToFigure(15).id, 'semicorchea');
  assert.equal(mapSeparationToFigure(85).id, 'redonda');
  assert.equal(calculateRealDurationSec(4, 120), 2);
  assert.equal(calculateRealDurationSec(0.25, 60), 0.25);
});
test('hysteresis suppresses tiny movements across extended-note and figure boundaries', () => {
  const yMax = 0.92;
  const yMin = 0.08;
  const span = yMax - yMin;
  assert.equal(mapHeightToNote(yMax - (0.55 / 16) * span, yMin, yMax, 'sol3').id, 'sol3');
  assert.equal(mapHeightToNote(yMax - (0.70 / 16) * span, yMin, yMax, 'sol3').id, 'la3');
  assert.equal(mapSeparationToFigure(15 + 0.55 * 70 / 4, 15, 85, 'semicorchea').id, 'semicorchea');
});
test('body pitch and hand aperture remain independent musical axes', () => {
  const narrow = mapBodyToMusic(0.50, 15);
  const wide = mapBodyToMusic(0.50, 85);
  const high = mapBodyToMusic(0.08, 15);
  assert.equal(narrow.note.id, 'la4');
  assert.equal(wide.note.id, 'la4');
  assert.equal(narrow.figure.id, 'semicorchea');
  assert.equal(wide.figure.id, 'redonda');
  assert.equal(high.note.id, 'si5');
  assert.equal(high.figure.id, 'semicorchea');
});
test('ledger-line geometry supports notes below and above the treble staff', () => {
  assert.deepEqual(ledgerLineStepsForStaffStep(-3), [0, -2]);
  assert.deepEqual(ledgerLineStepsForStaffStep(-1), [0]);
  assert.deepEqual(ledgerLineStepsForStaffStep(4), []);
  assert.deepEqual(ledgerLineStepsForStaffStep(12), [12]);
  assert.deepEqual(ledgerLineStepsForStaffStep(13), [12]);
});
test('vertical movement cannot change the opening control', () => {
  const a = palmAt({ x: 0.2, y: 0.4 });
  const b = palmAt({ x: 0.8, y: 0.4 });
  assert.equal(trackingState(a, b).distanceCm, 75);
  assert.equal(trackingState(a, palmAt({ x: 0.8, y: 0.9 })).distanceCm, 75);
  assert.equal(trackingState(a, null).distanceCm, 0);
});
function gestureLandmarks(fingerTipDistance: number, thumbTipDistance = fingerTipDistance): GestureLandmark[] {
  const points = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
  points[0] = { x: 0, y: 0 };
  points[5] = { x: 1, y: 0 }; points[9] = { x: 0, y: 1 };
  points[13] = { x: -1, y: 0 }; points[17] = { x: 0, y: -1 };
  points[4] = { x: thumbTipDistance, y: 0 };
  points[8] = { x: fingerTipDistance, y: 0 };
  points[12] = { x: 0, y: fingerTipDistance };
  points[16] = { x: -fingerTipDistance, y: 0 };
  points[20] = { x: 0, y: -fingerTipDistance };
  return points;
}
test('classifies clearly open and closed hands without pixel thresholds', () => {
  assert.equal(classifyGesture(gestureLandmarks(2, 2)), 'OPEN_HAND');
  assert.equal(classifyGesture(gestureLandmarks(1, 1)), 'CLOSED_FIST');
});
test('classifies ambiguous and incomplete landmarks as unknown', () => {
  assert.equal(classifyGesture(gestureLandmarks(1.25, 1.25)), 'UNKNOWN');
  assert.equal(classifyGesture(gestureLandmarks(2).slice(0, 20)), 'UNKNOWN');
  assert.equal(classifyGesture([{ x: Number.NaN, y: 0 }]), 'UNKNOWN');
});
test('synthetic palm tracking reports unknown gesture state', () => {
  assert.equal(palmAt({ x: 0.5, y: 0.5 }).gestureState, 'UNKNOWN');
});
const rhythmFigures = MUSICAL_FIGURES.filter(figure => figure.type === 'note');
test('rhythm target evaluation matches the detected figure', () => {
  const target = rhythmFigures.find(figure => figure.id === 'negra')!;
  assert.equal(evaluateRhythmTarget(target, target, true, target.targetDistanceIdealCm).status, 'correct');
  assert.equal(evaluateRhythmTarget(target, target, true, target.targetDistanceMinCm).status, 'correct');
  assert.equal(evaluateRhythmTarget(target, target, true, target.targetDistanceMaxCm).status, 'correct');
});
test('rhythm target evaluation gives directional guidance', () => {
  const target = rhythmFigures.find(figure => figure.id === 'negra')!;
  const closer = rhythmFigures.find(figure => figure.id === 'corchea')!;
  const farther = rhythmFigures.find(figure => figure.id === 'blanca')!;
  assert.match(evaluateRhythmTarget(target, closer, true, closer.targetDistanceIdealCm).feedback, /Separa/);
  assert.match(evaluateRhythmTarget(target, farther, true, farther.targetDistanceIdealCm).feedback, /Acerca/);
});
test('tracking loss pauses rhythm evaluation without counting an error', () => {
  const target = rhythmFigures[2];
  const result = evaluateRhythmTarget(target, undefined, false, 0);
  assert.equal(result.status, 'tracking-paused');
});
test('rhythm sequence advances only after a correct result', () => {
  assert.equal(advanceRhythmSequence(0, 'incorrect', 3), 0);
  assert.equal(advanceRhythmSequence(0, 'tracking-paused', 3), 0);
  assert.equal(advanceRhythmSequence(0, 'correct', 3), 1);
  assert.equal(advanceRhythmSequence(2, 'correct', 3), 2);
});
test('exploration evaluation has no failure condition', () => {
  assert.equal(exploreRhythm().status, 'explore');
  assert.equal(exploreRhythm(false).status, 'explore');
  assert.match(exploreRhythm(false).feedback, /comenzar a explorar/);
});

test('rhythm difficulty exposes progressively larger musical vocabularies', () => {
  assert.deepEqual(getRhythmVocabulary(rhythmFigures, 'initial').map(figure => figure.id), ['blanca', 'negra']);
  assert.deepEqual(getRhythmVocabulary(rhythmFigures, 'intermediate').map(figure => figure.id), ['blanca', 'negra', 'corchea']);
  assert.deepEqual(getRhythmVocabulary(rhythmFigures, 'full').map(figure => figure.id), ['redonda', 'blanca', 'negra', 'corchea']);
  assert.equal(sequenceLengthForDifficulty('initial'), 3);
  assert.equal(sequenceLengthForDifficulty('intermediate'), 4);
  assert.equal(sequenceLengthForDifficulty('full'), 5);
});

test('controlled rhythm targets are deterministic and can avoid immediate repetition', () => {
  const first = pickRhythmTarget(rhythmFigures, 'initial', 1234);
  const repeated = pickRhythmTarget(rhythmFigures, 'initial', 1234);
  assert.equal(first.figure.id, repeated.figure.id);
  assert.equal(first.nextSeed, repeated.nextSeed);

  const next = pickRhythmTarget(rhythmFigures, 'initial', first.nextSeed, first.figure.id);
  assert.notEqual(next.figure.id, first.figure.id);
});

test('generated rhythm sequences are reproducible and avoid adjacent duplicates', () => {
  const a = generateRhythmSequence(rhythmFigures, 'full', 5, 42);
  const b = generateRhythmSequence(rhythmFigures, 'full', 5, 42);
  assert.deepEqual(a.figures.map(figure => figure.id), b.figures.map(figure => figure.id));
  assert.equal(a.nextSeed, b.nextSeed);
  assert.equal(a.figures.length, 5);
  for (let index = 1; index < a.figures.length; index += 1) {
    assert.notEqual(a.figures[index].id, a.figures[index - 1].id);
  }
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


test('sample note helpers map scientific pitch notation consistently', () => {
  assert.equal(noteNameToMidi('A4'), 69);
  assert.equal(noteNameToMidi('C4'), 60);
  assert.ok(Math.abs(midiToFrequency(69) - 440) < 0.001);
});

test('sampled timbres choose nearby anchors across the Melody Motion register', () => {
  assert.equal(nearestInstrumentSample('piano', 196).note, 'G3');
  assert.equal(nearestInstrumentSample('piano', 987.77).note, 'B5');
  assert.equal(nearestInstrumentSample('violin', 196).note, 'G3');
  assert.ok(['A5', 'C6'].includes(nearestInstrumentSample('violin', 987.77).note));
  assert.equal(nearestInstrumentSample('guitar', 880).note, 'A5');
  assert.equal(nearestInstrumentSample('violin_pizzicato', 196).note, 'G3');
  assert.equal(nearestInstrumentSample('violin_pizzicato', 987.77).note, 'B5');
  assert.match(nearestInstrumentSample('violin_pizzicato', 440).url, /peastman\/sso/);
  assert.match(nearestInstrumentSample('violin_pizzicato', 440).url, /violin_pizz_non_vib_/);
});


test('Compás body-accordion patterns resolve to complete 4/4 timelines', () => {
  for (const pattern of COMPAS_PATTERNS) {
    const timeline = buildCompasTimeline(pattern, MUSICAL_FIGURES);
    assert.equal(timeline[0].startBeat, 0);
    assert.equal(timeline[timeline.length - 1].endBeat, 4);
  }
});

test('Compás playhead exposes current, next and progress without skipping steps', () => {
  const timeline = buildCompasTimeline(COMPAS_PATTERNS[0], MUSICAL_FIGURES);
  const start = getCompasFrame(timeline, 0);
  assert.equal(start.currentStep.figure.id, 'negra');
  assert.equal(start.nextStep?.figure.id, 'negra');
  assert.equal(start.currentIndex, 0);
  assert.equal(start.patternProgress, 0);

  const middle = getCompasFrame(timeline, 2.5);
  assert.equal(middle.currentStep.figure.id, 'blanca');
  assert.equal(middle.currentIndex, 2);
  assert.ok(middle.stepProgress > 0 && middle.stepProgress < 1);

  const end = getCompasFrame(timeline, 4);
  assert.equal(end.complete, true);
  assert.equal(end.patternProgress, 1);
});

test('Compás timing uses BPM and tracking uncertainty never becomes learner error', () => {
  assert.equal(beatDurationMs(60), 1000);
  assert.equal(beatDurationMs(120), 500);

  const target = rhythmFigures.find((figure) => figure.id === 'negra')!;
  const aligned = compasGuidance(target, target, true, target.targetDistanceIdealCm);
  assert.equal(aligned.status, 'aligned');

  const paused = compasGuidance(target, undefined, false, 0);
  assert.equal(paused.status, 'tracking-paused');
  assert.match(paused.feedback, /espera/);
});


test('Tracking v2 diagnostics record availability, recovery, confidence and landmarks', () => {
  const recorder = new TrackingDiagnosticsRecorder();

  const missing = trackingState(null, null, 640, 480, 1000);
  recorder.record(missing, 'mediapipe-hands', 640, 480);
  recorder.recordProcessing(12);

  const left = palmAt({ x: 0.3, y: 0.5 });
  const right = palmAt({ x: 0.7, y: 0.5 });
  left.confidence = 0.9;
  right.confidence = 0.8;
  left.landmarks = Array.from({ length: 21 }, (_, index) => ({ x: index / 100, y: 0.5 }));
  right.landmarks = Array.from({ length: 21 }, (_, index) => ({ x: 0.5 + index / 100, y: 0.5 }));

  const tracked = trackingState(left, right, 640, 480, 1033);
  recorder.record(tracked, 'mediapipe-hands', 640, 480);
  recorder.recordProcessing(14);

  const snapshot = recorder.snapshot(tracked);
  assert.equal(snapshot.backend, 'mediapipe-hands');
  assert.equal(snapshot.totalFrames, 2);
  assert.equal(snapshot.zeroPointFrames, 1);
  assert.equal(snapshot.twoPointFrames, 1);
  assert.equal(snapshot.recoveryCount, 1);
  assert.equal(snapshot.landmarkCount1, 21);
  assert.equal(snapshot.landmarkCount2, 21);
  assert.ok(snapshot.confidence !== null && snapshot.confidence > 0.84 && snapshot.confidence < 0.86);
  assert.equal(snapshot.avgProcessingMs, 13);
  assert.ok(snapshot.fps > 30 && snapshot.fps < 31);
});

test('Tracking v2 diagnostics reset when perception backend changes', () => {
  const recorder = new TrackingDiagnosticsRecorder();
  const state = trackingState(palmAt({ x: 0.2, y: 0.5 }), palmAt({ x: 0.8, y: 0.5 }), 640, 480, 1000);
  recorder.record(state, 'mediapipe-hands', 640, 480);
  recorder.record(state, 'color-markers', 640, 480);
  const snapshot = recorder.snapshot(state);
  assert.equal(snapshot.backend, 'color-markers');
  assert.equal(snapshot.totalFrames, 1);
  assert.equal(snapshot.confidence, null);
});


test('Tracking v2 T1 persists all 21 landmarks with handedness and confidence', () => {
  const landmarks = Array.from({ length: 21 }, (_, index) => ({
    x: 0.1 + index * 0.01,
    y: 0.2 + index * 0.005,
    z: -index * 0.001,
  }));
  const palm = palmDataFromLandmarks(landmarks, { label: 'Right', score: 0.92 });
  assert.ok(palm);
  assert.equal(palm.landmarks?.length, 21);
  assert.equal(palm.handedness, 'Right');
  assert.equal(palm.confidence, 0.92);
  assert.deepEqual(palm.wrist, landmarks[0]);
  assert.deepEqual(palm.indexMcp, landmarks[5]);
  assert.deepEqual(palm.pinkyMcp, landmarks[17]);
});

test('Tracking v2 T1 rejects incomplete landmark frames', () => {
  const incomplete = Array.from({ length: 20 }, () => ({ x: 0.4, y: 0.4 }));
  assert.equal(palmDataFromLandmarks(incomplete, { label: 'Left', score: 0.9 }), null);
});


function realisticHandLandmarks(open: boolean) {
  const points = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  points[0] = { x: 0, y: 0, z: 0 };

  const chains: Array<[number, number, number, number, number, number]> = [
    [1, 2, 3, 4, 0.28, 0.02],
    [5, 6, 7, 8, 0.20, -0.12],
    [9, 10, 11, 12, 0.02, -0.15],
    [13, 14, 15, 16, -0.16, -0.12],
    [17, 18, 19, 20, -0.30, -0.06],
  ];

  for (const [a, b, d, tip, baseX, baseY] of chains) {
    points[a] = { x: baseX, y: baseY, z: 0 };
    if (open) {
      const dx = baseX * 0.18;
      points[b] = { x: baseX + dx, y: baseY - 0.20, z: 0 };
      points[d] = { x: baseX + dx * 2, y: baseY - 0.40, z: 0 };
      points[tip] = { x: baseX + dx * 3, y: baseY - 0.62, z: 0 };
    } else {
      points[b] = { x: baseX + 0.05, y: baseY - 0.08, z: 0 };
      points[d] = { x: baseX + 0.02, y: baseY + 0.02, z: 0 };
      points[tip] = { x: baseX + 0.01, y: baseY + 0.01, z: 0 };
    }
  }
  return points;
}

test('Tracking v2 T2 derives per-finger geometry from all phalanges', () => {
  const open = analyzeHandGeometry(realisticHandLandmarks(true));
  const closed = analyzeHandGeometry(realisticHandLandmarks(false));
  assert.ok(open && closed);
  assert.ok(open.opennessScore > closed.opennessScore);
  assert.ok(Object.values(open.fingers).filter((finger) => finger.extended).length >= 4);
  assert.ok(Object.values(closed.fingers).filter((finger) => finger.extended).length <= 1);
  assert.ok(open.palmSpan > 0);
});

function musicalPalm(x: number, gestureState: 'OPEN_HAND' | 'CLOSED_FIST') {
  const palm = palmAt({ x, y: 0.5 });
  palm.gestureState = gestureState;
  palm.landmarks = realisticHandLandmarks(gestureState === 'OPEN_HAND');
  return palm;
}

test('bimanual musical grammar maps open, closed, sharp and flat states', () => {
  const natural = trackingState(musicalPalm(0.25, 'OPEN_HAND'), musicalPalm(0.75, 'OPEN_HAND'));
  const rest = trackingState(musicalPalm(0.25, 'CLOSED_FIST'), musicalPalm(0.75, 'CLOSED_FIST'));
  const sharp = trackingState(musicalPalm(0.25, 'CLOSED_FIST'), musicalPalm(0.75, 'OPEN_HAND'));
  const flat = trackingState(musicalPalm(0.25, 'OPEN_HAND'), musicalPalm(0.75, 'CLOSED_FIST'));

  assert.equal(interpretBimanualMusicalGesture(natural).mode, 'sound');
  assert.equal(interpretBimanualMusicalGesture(rest).mode, 'rest');
  assert.equal(interpretBimanualMusicalGesture(sharp).accidental, 'sharp');
  assert.equal(interpretBimanualMusicalGesture(flat).accidental, 'flat');
});

test('position-only backends remain natural and do not pretend to know finger shape', () => {
  const state = trackingState(palmAt({ x: 0.25, y: 0.5 }), palmAt({ x: 0.75, y: 0.5 }));
  const result = interpretBimanualMusicalGesture(state);
  assert.equal(result.mode, 'sound');
  assert.equal(result.supportsHandShape, false);
});

test('rest equivalents preserve the same spatial duration as their sounding figure', () => {
  for (const note of MUSICAL_FIGURES.filter((figure) => figure.type === 'note')) {
    const rest = equivalentRestForFigure(note, MUSICAL_FIGURES);
    assert.ok(rest);
    assert.equal(rest.durationBeats, note.durationBeats);
    assert.equal(rest.targetDistanceMinCm, note.targetDistanceMinCm);
    assert.equal(rest.targetDistanceMaxCm, note.targetDistanceMaxCm);
    assert.equal(rest.targetDistanceIdealCm, note.targetDistanceIdealCm);
  }
});

test('sharp and flat gestures transpose exactly one semitone', () => {
  const sharpA4 = applyAccidentalToFrequency(440, 'sharp');
  const flatA4 = applyAccidentalToFrequency(440, 'flat');
  assert.ok(Math.abs(sharpA4 - 466.1637615) < 0.001);
  assert.ok(Math.abs(flatA4 - 415.3046976) < 0.001);
  assert.equal(applyAccidentalToFrequency(440, 'natural'), 440);
});

test('rhythm feedback distinguishes a rest from its sounding equivalent at the same distance', () => {
  const note = MUSICAL_FIGURES.find((figure) => figure.id === 'negra')!;
  const rest = MUSICAL_FIGURES.find((figure) => figure.id === 'silencio_negra')!;
  const result = evaluateRhythmTarget(rest, note, true, rest.targetDistanceIdealCm);
  assert.equal(result.status, 'incorrect');
  assert.match(result.feedback, /cierra ambos puños/);
});


test('gesture stabilization requires consecutive frames before changing musical state', () => {
  const stabilizer = new GestureStateStabilizer(3, 5);
  assert.equal(stabilizer.update('OPEN_HAND'), 'UNKNOWN');
  assert.equal(stabilizer.update('OPEN_HAND'), 'UNKNOWN');
  assert.equal(stabilizer.update('OPEN_HAND'), 'OPEN_HAND');
  assert.equal(stabilizer.update('CLOSED_FIST'), 'OPEN_HAND');
  assert.equal(stabilizer.update('CLOSED_FIST'), 'OPEN_HAND');
  assert.equal(stabilizer.update('CLOSED_FIST'), 'CLOSED_FIST');
  assert.equal(stabilizer.update('UNKNOWN'), 'CLOSED_FIST');
});

test('Compás includes a complete sound-rest pattern using the same spatial durations', () => {
  const pattern = COMPAS_PATTERNS.find((candidate) => candidate.id === 'sonido_silencio');
  assert.ok(pattern);
  const timeline = buildCompasTimeline(pattern, MUSICAL_FIGURES);
  assert.deepEqual(
    timeline.map((step) => step.figure.id),
    ['negra', 'silencio_negra', 'negra', 'silencio_negra'],
  );
  assert.equal(timeline[timeline.length - 1].endBeat, 4);

  const note = MUSICAL_FIGURES.find((figure) => figure.id === 'negra')!;
  const rest = MUSICAL_FIGURES.find((figure) => figure.id === 'silencio_negra')!;
  const restMismatch = compasGuidance(rest, note, true, rest.targetDistanceIdealCm);
  assert.equal(restMismatch.status, 'adjust');
  assert.match(restMismatch.feedback, /cierra ambos puños/);
});


test('learning game awards are transparent and ranking unlocks at the documented threshold', () => {
  let score = EMPTY_LEARNING_SCORE;
  assert.equal(totalLearningPoints(score), 0);
  assert.equal(isRankingUnlocked(score), false);

  assert.equal(rhythmGameAward(0, false), 0);
  assert.equal(rhythmGameAward(1, false), 25);
  assert.equal(rhythmGameAward(2, false), 30);
  assert.equal(rhythmGameAward(2, true), 90);
  assert.equal(pentagramGameAward('note'), 30);
  assert.equal(pentagramGameAward('piece'), 100);

  score = addLearningPoints(score, 'rhythm', 90);
  score = addLearningPoints(score, 'pentagram', RANKING_UNLOCK_POINTS - 90);
  assert.equal(totalLearningPoints(score), RANKING_UNLOCK_POINTS);
  assert.equal(isRankingUnlocked(score), true);
});

test('learning score ignores negative awards', () => {
  const score = addLearningPoints(EMPTY_LEARNING_SCORE, 'rhythm', -50);
  assert.deepEqual(score, EMPTY_LEARNING_SCORE);
});


test('instrument preferences restore only supported persistent values', () => {
  assert.equal(parseStoredInstrumentTimbre('violin_pizzicato'), 'violin_pizzicato');
  assert.equal(parseStoredInstrumentTimbre('piano'), 'piano');
  assert.equal(parseStoredInstrumentTimbre('unsupported'), 'violin_pizzicato');
  assert.equal(parseStoredInstrumentTimbre(null), 'violin_pizzicato');
  assert.equal(parseStoredLiveSoundFeedback('true'), true);
  assert.equal(parseStoredLiveSoundFeedback('false'), false);
  assert.equal(parseStoredLiveSoundFeedback(null), true);
  assert.equal(parseStoredLiveSoundFeedback('unsupported'), true);
});

test('body calibration maps a comfortable range into the standard musical space', () => {
  const calibration: BodyCalibration = {
    minOpening: 20, maxOpening: 80, lowY: 0.8, highY: 0.2, capturedAt: 1, version: 1,
  };
  assert.equal(normalizeOpening(20, calibration), 0);
  assert.equal(normalizeOpening(80, calibration), 1);
  assert.equal(normalizeOpening(50, calibration), 0.5);
  assert.equal(normalizeHeight(0.8, calibration), 0);
  assert.equal(normalizeHeight(0.2, calibration), 1);
  assert.equal(rawOpeningToMusical(20, calibration), 15);
  assert.equal(rawOpeningToMusical(80, calibration), 85);
  assert.ok(Math.abs(rawYToMusical(0.8, calibration) - 0.92) < 1e-9);
  assert.ok(Math.abs(rawYToMusical(0.2, calibration) - 0.08) < 1e-9);
  assert.equal(musicalOpeningToRaw(85, calibration), 80);
  assert.ok(Math.abs(musicalYToRaw(0.08, calibration) - 0.2) < 1e-9);
});

test('calibration transforms musical coordinates without mutating raw tracking coordinates', () => {
  const calibration: BodyCalibration = {
    minOpening: 20, maxOpening: 80, lowY: 0.8, highY: 0.2, capturedAt: 1, version: 1,
  };
  const raw = trackingState(palmAt({ x: 0.3, y: 0.5 }), palmAt({ x: 0.7, y: 0.5 }), 640, 480, 1);
  const musical = applyBodyCalibration(raw, calibration);
  assert.equal(raw.leftPalm?.center.y, 0.5);
  assert.equal(musical.leftPalm?.center.y, 0.5);
  assert.equal(raw.distanceCm, 50);
  assert.equal(musical.distanceCm, 50);
  assert.notEqual(musical, raw);
});

test('CameraStage keeps raw target placement while reporting calibrated musical meaning', () => {
  const calibration: BodyCalibration = {
    minOpening: 20, maxOpening: 80, lowY: 0.8, highY: 0.2, capturedAt: 1, version: 1,
  };
  const raw = trackingState(palmAt({ x: 0.1, y: 0.2 }), palmAt({ x: 0.9, y: 0.2 }), 640, 480, 1);
  const musical = applyBodyCalibration(raw, calibration);
  const stage = deriveCameraStageState(raw, musical, {
    noteId: 'si5', noteLabel: 'Si 5', targetYNorm: 0.08, targetOpening: 85, matched: true,
  }, calibration);
  assert.equal(stage.currentNoteId, 'si5');
  assert.equal(stage.currentFigureId, 'redonda');
  assert.ok(stage.targetRawY !== null && Math.abs(stage.targetRawY - 0.2) < 1e-9);
  assert.equal(stage.targetRawOpening, 80);
  assert.equal(stage.aligned, true);
  assert.equal(stage.calibrationActive, true);
});
