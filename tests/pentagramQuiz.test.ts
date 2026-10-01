import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TREBLE_TRAINING_RANGE } from '../src/data/musicalScaleData';
import { createQuizSession, generateQuizQuestions, nextQuizQuestion, stepQuiz, summarizeQuiz, DEFAULT_QUIZ_CONFIG } from '../src/services/pentagramQuiz';

for (const count of [3, 4] as const) {
  test(`generates ${count} unique candidates including the target, deterministically without adjacent repeat`, () => {
    const questions = generateQuizQuestions(TREBLE_TRAINING_RANGE.map(n => n.id), count, 10, 42);
    assert.deepEqual(questions, generateQuizQuestions(TREBLE_TRAINING_RANGE.map(n => n.id), count, 10, 42));
    for (let i = 0; i < questions.length; i++) {
      assert.equal(new Set(questions[i].candidateIds).size, count);
      assert.ok(questions[i].candidateIds.includes(questions[i].targetNoteId));
      if (i) assert.notEqual(questions[i].targetNoteId, questions[i - 1].targetNoteId);
    }
  });
}
const session = () => createQuizSession(DEFAULT_QUIZ_CONFIG, 42);
const target = (s: ReturnType<typeof session>) => s.questions[s.index].targetNoteId;

test('correct pitch needs full retention; leaving resets retention', () => {
  let s = session();
  s = stepQuiz(s, { trackingValid: true, noteId: target(s) }, 1000);
  assert.equal(s.results.length, 0);
  assert.equal(s.holdMs, 1000);
  s = stepQuiz(s, { trackingValid: true, noteId: 'wrong' }, 100);
  assert.equal(s.holdMs, 0);
  s = stepQuiz(s, { trackingValid: true, noteId: target(s) }, 1500);
  assert.equal(s.results[0].result, 'correct');
  assert.equal(s.results[0].holdCompleted, true);
});

test('timeout records active response time; a correct note with incomplete hold still times out', () => {
  let s = stepQuiz(session(), { trackingValid: true, noteId: 'wrong' }, 9000);
  s = stepQuiz(s, { trackingValid: true, noteId: target(s) }, 1000);
  assert.equal(s.results[0].result, 'timeout');
  assert.equal(s.results[0].responseTimeMs, 10000);
  assert.equal(s.results[0].holdCompleted, false);
});

test('tracking loss pauses both clocks without error and recovery continues retention', () => {
  let s = session();
  s = stepQuiz(s, { trackingValid: true, noteId: target(s) }, 500);
  const before = s;
  s = stepQuiz(s, { trackingValid: false, noteId: null }, 20000);
  assert.equal(s.elapsedMs, before.elapsedMs);
  assert.equal(s.holdMs, before.holdMs);
  assert.equal(s.results.length, 0);
  assert.equal(s.paused, true);
  s = stepQuiz(s, { trackingValid: true, noteId: target(s) }, 1000);
  assert.equal(s.results[0].result, 'correct');
  assert.equal(s.results[0].responseTimeMs, 1500);
});

test('correct completion before deadline wins even when the tick extends beyond the deadline', () => {
  let s = session();
  s = stepQuiz(s, { trackingValid: true, noteId: 'wrong' }, 8000);
  s = stepQuiz(s, { trackingValid: true, noteId: target(s) }, 3000);
  assert.equal(s.results[0].result, 'correct');
  assert.equal(s.results[0].responseTimeMs, 9500);
});

test('ten-question sessions finish; summary and feedback modes have the same pedagogical results', () => {
  function complete(feedback: 'immediate' | 'final') {
    let s = createQuizSession({ ...DEFAULT_QUIZ_CONFIG, feedback }, 42);
    for (let i = 0; i < 10; i++) {
      s = stepQuiz(s, { trackingValid: true, noteId: i < 8 ? target(s) : 'wrong' }, i < 8 ? 1500 : 10000);
      s = nextQuizQuestion(s);
    }
    assert.equal(s.phase, 'complete');
    return s;
  }
  const immediate = complete('immediate');
  const final = complete('final');
  assert.deepEqual(immediate.results, final.results);
  assert.deepEqual(summarizeQuiz(immediate.results), { total: 10, correct: 8, percentage: 80, meanResponseTimeMs: 3200, holdsCompleted: 8 });
});

test('rejects invalid config, insufficient vocabulary and invalid clock input', () => {
  assert.throws(() => createQuizSession({ ...DEFAULT_QUIZ_CONFIG, holdTimeMs: 11000 }, 42));
  assert.throws(() => generateQuizQuestions(['do4'], 3, 10, 42));
  assert.throws(() => stepQuiz(session(), { trackingValid: true, noteId: 'do4' }, Number.NaN));
});
