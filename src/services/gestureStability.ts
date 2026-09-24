import type { GestureState } from '../types';

export class GestureStateStabilizer {
  private stable: GestureState = 'UNKNOWN';
  private candidate: GestureState = 'UNKNOWN';
  private candidateFrames = 0;

  constructor(
    private readonly confirmFrames = 3,
    private readonly unknownFrames = 5,
  ) {}

  reset() {
    this.stable = 'UNKNOWN';
    this.candidate = 'UNKNOWN';
    this.candidateFrames = 0;
  }

  update(raw: GestureState): GestureState {
    if (raw === this.stable) {
      this.candidate = raw;
      this.candidateFrames = 0;
      return this.stable;
    }

    if (raw !== this.candidate) {
      this.candidate = raw;
      this.candidateFrames = 1;
    } else {
      this.candidateFrames += 1;
    }

    const required = raw === 'UNKNOWN' ? this.unknownFrames : this.confirmFrames;
    if (this.candidateFrames >= required) {
      this.stable = raw;
      this.candidateFrames = 0;
    }

    return this.stable;
  }
}
