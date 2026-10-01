import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deserializeReplaySession, type ReplaySessionV1 } from '../src/services/sessionReplay';

interface FixtureManifestItem {
  id: string;
  file: string;
  intent: string;
}

const fixtureRoot = new URL('./fixtures/replay/', import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL('manifest.json', fixtureRoot), 'utf8'),
) as FixtureManifestItem[];

function load(file: string): ReplaySessionV1 {
  return deserializeReplaySession(readFileSync(new URL(file, fixtureRoot), 'utf8'));
}

function averageY(session: ReplaySessionV1): number[] {
  return session.frames.map((frame) => {
    const left = frame.state.leftPalm;
    const right = frame.state.rightPalm;
    assert.ok(left && right, `fixture ${session.backend} requires two palms for average Y`);
    return (left.center.y + right.center.y) / 2;
  });
}

function openings(session: ReplaySessionV1): number[] {
  return session.frames.map((frame) => frame.state.distanceNormalized);
}

function validity(session: ReplaySessionV1): boolean[] {
  return session.frames.map((frame) => Boolean(
    frame.state.leftPalm?.present && frame.state.rightPalm?.present,
  ));
}

function assertConstant(values: number[], label: string) {
  assert.ok(values.every((value) => value === values[0]), `${label} must remain constant`);
}

function assertStrictlyIncreasing(values: number[], label: string) {
  for (let index = 1; index < values.length; index += 1) {
    assert.ok(values[index] > values[index - 1], `${label} must increase at frame ${index}`);
  }
}

function assertStrictlyDecreasing(values: number[], label: string) {
  for (let index = 1; index < values.length; index += 1) {
    assert.ok(values[index] < values[index - 1], `${label} must decrease at frame ${index}`);
  }
}

test('MM-R2A manifest declares exactly eight uniquely named canonical fixtures', () => {
  assert.equal(manifest.length, 8);
  assert.deepEqual(manifest.map((item) => item.id), ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08']);
  assert.equal(new Set(manifest.map((item) => item.file)).size, 8);
  for (const item of manifest) {
    assert.match(item.file, /^[a-z0-9-]+\.json$/);
    assert.ok(item.intent.trim().length >= 20, `${item.id} must declare a meaningful intent`);
    const session = load(item.file);
    assert.equal(session.backend, 'simulation');
    assert.ok(session.frames.length >= 4);
  }
});

test('F01 stable-hold keeps height and opening fixed with uninterrupted tracking', () => {
  const session = load('stable-hold.json');
  assertConstant(averageY(session), 'height');
  assertConstant(openings(session), 'opening');
  assert.ok(validity(session).every(Boolean));
});

test('F02 and F03 isolate opposite vertical motion while holding opening constant', () => {
  const ascent = load('vertical-ascent.json');
  const descent = load('vertical-descent.json');
  assertStrictlyDecreasing(averageY(ascent), 'screen Y during ascent');
  assertStrictlyIncreasing(averageY(descent), 'screen Y during descent');
  assertConstant(openings(ascent), 'ascent opening');
  assertConstant(openings(descent), 'descent opening');
});

test('F04 opening-transition changes three opening zones at a fixed height', () => {
  const session = load('opening-transition.json');
  assertConstant(averageY(session), 'height');
  const roundedOpenings = openings(session).map((value) => Number(value.toFixed(2)));
  assert.deepEqual([...new Set(roundedOpenings)], [0.4, 0.56, 0.72]);
});

test('F05 boundary-crossing oscillates narrowly across the selected note and opening boundaries', () => {
  const session = load('boundary-crossing.json');
  const y = averageY(session);
  const opening = openings(session);
  const noteBoundaryY = 0.47375;
  const openingBoundary = 0.47;
  assert.ok(Math.min(...y) < noteBoundaryY && Math.max(...y) > noteBoundaryY);
  assert.ok(Math.max(...y) - Math.min(...y) < 0.01);
  assert.ok(Math.min(...opening) < openingBoundary && Math.max(...opening) > openingBoundary);
  assert.ok(Math.max(...opening) - Math.min(...opening) < 0.02);
});

test('F06 and F07 represent loss and recovery as opposite availability sequences', () => {
  assert.deepEqual(validity(load('tracking-loss.json')), [true, true, false, false]);
  assert.deepEqual(validity(load('tracking-recovery.json')), [false, false, true, true]);
});

test('F08 combined-motion changes height and opening together without losing tracking', () => {
  const session = load('combined-motion.json');
  assertStrictlyDecreasing(averageY(session), 'screen Y');
  assertStrictlyIncreasing(openings(session), 'opening');
  assert.ok(validity(session).every(Boolean));
});
