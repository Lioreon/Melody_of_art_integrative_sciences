// Monotonic elapsed time, independent of camera frame rate and UI rendering.
export class HoldTimer {
  private started: number | null = null;
  private completed = false;
  reset() { this.started = null; this.completed = false; }
  update(matched: boolean, now: number, durationMs: number) {
    if (!matched) { this.reset(); return { progress: 0, justCompleted: false }; }
    if (this.started === null) this.started = now;
    const progress = Math.min(100, (now - this.started) / Math.max(1, durationMs) * 100);
    const justCompleted = progress >= 100 && !this.completed;
    if (justCompleted) this.completed = true;
    return { progress, justCompleted };
  }
}
