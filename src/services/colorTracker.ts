/** @license SPDX-License-Identifier: Apache-2.0 */
import type { ColorMarkerConfig, DualPalmState } from '../types';
import { ColorBlobDetector, type Point } from './colorDetection';
import { palmAt, trackingState } from './trackingGeometry';
export type ColorTrackerCallback = (state: DualPalmState, isTrackingLost: boolean) => void;

export class ColorTracker {
  private video: HTMLVideoElement | null = null;
  private canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D | null;
  private detector = new ColorBlobDetector(160, 120);
  private callback: ColorTrackerCallback | null = null;
  private frameId: number | null = null;
  private running = false;
  private lastTime = -1;
  private lastVideoTime = -1;
  private previous: [Point | null, Point | null] = [null, null];
  private config: ColorMarkerConfig = { color1Hex: '#ef4444', color2Hex: '#06b6d4',
    color1Label: 'Pelota roja', color2Label: 'Pelota cian', tolerance: 50 };
  constructor() {
    this.canvas.width = 160; this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }
  setConfig(config: Partial<ColorMarkerConfig>) { this.config = { ...this.config, ...config }; this.previous = [null, null]; }
  getConfig() { return { ...this.config }; }
  start(video: HTMLVideoElement, callback: ColorTrackerCallback) {
    this.stop(); this.video = video; this.callback = callback; this.running = true;
    this.frameId = requestAnimationFrame(this.loop);
  }
  stop() {
    this.running = false;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null; this.video = null; this.callback = null;
    this.previous = [null, null]; this.lastTime = -1; this.lastVideoTime = -1;
  }
  private loop = (now: number) => {
    if (!this.running) return;
    const video = this.video;
    if (!document.hidden && video && this.ctx && video.readyState >= 2 && video.currentTime !== this.lastVideoTime && now - this.lastTime >= 1000 / 30) {
      const dt = this.lastTime < 0 ? 33 : now - this.lastTime;
      this.lastTime = now; this.lastVideoTime = video.currentTime;
      this.ctx.drawImage(video, 0, 0, 160, 120);
      const pixels = this.ctx.getImageData(0, 0, 160, 120).data;
      const points = this.detector.detect(pixels, this.config.color1Hex, this.config.color2Hex, this.config.tolerance);
      const alpha = 1 - Math.exp(-dt / 65);
      this.previous = points.map((point, i) => {
        const prev = this.previous[i];
        return point && prev ? { x: prev.x + alpha * (point.x - prev.x), y: prev.y + alpha * (point.y - prev.y) } : point;
      }) as [Point | null, Point | null];
      const [a, b] = this.previous;
      this.callback?.(trackingState(a ? palmAt(a) : null, b ? palmAt(b) : null,
        video.videoWidth, video.videoHeight, now), !a || !b);
    }
    if (this.running) this.frameId = requestAnimationFrame(this.loop);
  };
}
