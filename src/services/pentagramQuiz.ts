import { TREBLE_TRAINING_RANGE } from '../data/musicalScaleData';

export interface QuizConfig {
  candidateCount: 3 | 4;
  questionCount: 5 | 10;
  responseTimeMs: number;
  holdTimeMs: number;
  feedback: 'immediate' | 'final';
}
export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  candidateCount: 3, questionCount: 10, responseTimeMs: 10000,
  holdTimeMs: 1500, feedback: 'immediate',
};
export interface QuizQuestion { targetNoteId: string; candidateIds: string[] }
export interface QuizResult {
  targetNoteId: string;
  result: 'correct' | 'timeout';
  responseTimeMs: number;
  holdCompleted: boolean;
}
export interface QuizSession {
  config: QuizConfig;
  questions: QuizQuestion[];
  index: number;
  phase: 'active' | 'feedback' | 'complete';
  elapsedMs: number;
  holdMs: number;
  paused: boolean;
  results: QuizResult[];
}

export function generateQuizQuestions(vocabulary: readonly string[], candidateCount: 3 | 4, count: number, seed: number): QuizQuestion[] {
  const ids = [...new Set(vocabulary)];
  if (ids.length < candidateCount || ![3, 4].includes(candidateCount) || !Number.isInteger(count) || count < 1 || !Number.isFinite(seed)) {
    throw new Error('Invalid quiz generation parameters');
  }
  let randomState = Math.trunc(seed) >>> 0;
  const pickIndex = (length: number) => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return Math.floor(randomState / 0x100000000 * length);
  };
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const targets = ids.filter(id => id !== questions[i - 1]?.targetNoteId);
    const targetNoteId = targets[pickIndex(targets.length)];
    const pool = ids.filter(id => id !== targetNoteId);
    const candidateIds = [targetNoteId];
    while (candidateIds.length < candidateCount) candidateIds.push(pool.splice(pickIndex(pool.length), 1)[0]);
    for (let j = candidateIds.length - 1; j > 0; j--) {
      const k = pickIndex(j + 1);
      [candidateIds[j], candidateIds[k]] = [candidateIds[k], candidateIds[j]];
    }
    questions.push({ targetNoteId, candidateIds });
  }
  return questions;
}

export function createQuizSession(config: QuizConfig, seed: number): QuizSession {
  if (![3, 4].includes(config.candidateCount) || ![5, 10].includes(config.questionCount)
    || !['immediate', 'final'].includes(config.feedback)
    || !Number.isFinite(config.responseTimeMs) || config.responseTimeMs < 2000 || config.responseTimeMs > 60000
    || !Number.isFinite(config.holdTimeMs) || config.holdTimeMs < 250 || config.holdTimeMs > config.responseTimeMs) {
    throw new Error('Invalid quiz configuration');
  }
  return {
    config: { ...config }, questions: generateQuizQuestions(TREBLE_TRAINING_RANGE.map(n => n.id), config.candidateCount, config.questionCount, seed),
    index: 0, phase: 'active', elapsedMs: 0, holdMs: 0, paused: false, results: [],
  };
}

/** deltaMs is observable active time; lost tracking never consumes either clock. */
export function stepQuiz(session: QuizSession, observation: { trackingValid: boolean; noteId: string | null }, deltaMs: number): QuizSession {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new Error('Invalid quiz clock delta');
  if (session.phase !== 'active') return session;
  if (!observation.trackingValid) return { ...session, paused: true };
  const targetNoteId = session.questions[session.index].targetNoteId;
  const matches = observation.noteId === targetNoteId;
  const remaining = session.config.responseTimeMs - session.elapsedMs;
  const holdRemaining = session.config.holdTimeMs - session.holdMs;
  const correct = matches && holdRemaining <= Math.min(deltaMs, remaining);
  const spent = correct ? holdRemaining : Math.min(deltaMs, remaining);
  const elapsedMs = session.elapsedMs + spent;
  const holdMs = matches ? Math.min(session.config.holdTimeMs, session.holdMs + spent) : 0;
  if (correct || elapsedMs >= session.config.responseTimeMs) {
    return { ...session, elapsedMs, holdMs, paused: false, phase: 'feedback', results: [...session.results, {
      targetNoteId, result: correct ? 'correct' : 'timeout', responseTimeMs: elapsedMs, holdCompleted: correct,
    }] };
  }
  return { ...session, elapsedMs, holdMs, paused: false };
}

export function nextQuizQuestion(session: QuizSession): QuizSession {
  if (session.phase !== 'feedback') return session;
  if (session.index + 1 >= session.questions.length) return { ...session, phase: 'complete' };
  return { ...session, index: session.index + 1, phase: 'active', elapsedMs: 0, holdMs: 0, paused: false };
}

export function summarizeQuiz(results: readonly QuizResult[]) {
  const correct = results.filter(r => r.result === 'correct').length;
  return {
    total: results.length, correct, percentage: results.length ? correct / results.length * 100 : 0,
    meanResponseTimeMs: results.length ? results.reduce((sum, r) => sum + r.responseTimeMs, 0) / results.length : 0,
    holdsCompleted: results.filter(r => r.holdCompleted).length,
  };
}
