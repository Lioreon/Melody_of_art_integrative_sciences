export type Point = { x: number; y: number };
type HSV = { h: number; s: number; v: number };
function hsv(r: number, g: number, b: number): HSV {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  let h = delta === 0 ? 0 : max === r ? 60 * (((g - b) / delta) % 6)
    : max === g ? 60 * ((b - r) / delta + 2) : 60 * ((r - g) / delta + 4);
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : delta / max, v: max / 255 };
}
function fromHex(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return hsv((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

// Buffers persist between frames; choose one connected blob, never an average
// between unrelated objects of the same colour.
export class ColorBlobDetector {
  private mask: Uint8Array;
  private queue: Int32Array;
  constructor(private width: number, private height: number) {
    this.mask = new Uint8Array(width * height);
    this.queue = new Int32Array(width * height);
  }
  detect(rgba: Uint8ClampedArray, color1: string, color2: string, tolerance: number): [Point | null, Point | null] {
    const targets = [fromHex(color1), fromHex(color2)];
    const hueLimit = 8 + Math.max(0, Math.min(90, tolerance)) / 4;
    for (let i = 0; i < this.mask.length; i++) {
      const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
      const max = Math.max(r, g, b), delta = max - Math.min(r, g, b);
      let hue = delta === 0 ? 0 : max === r ? 60 * (((g - b) / delta) % 6)
        : max === g ? 60 * ((b - r) / delta + 2) : 60 * ((r - g) / delta + 4);
      if (hue < 0) hue += 360;
      let best = hueLimit, label = 0;
      if (max > 0 && delta / max >= 0.3 && max / 255 >= 0.15) for (let j = 0; j < 2; j++) {
        const target = targets[j];
        const diff = Math.abs(hue - target.h);
        const distance = Math.min(diff, 360 - diff);
        if (target.s >= 0.3 && distance < best) { best = distance; label = j + 1; }
      }
      this.mask[i] = label;
    }
    const result: [Point | null, Point | null] = [null, null];
    const largest = [11, 11];
    for (let start = 0; start < this.mask.length; start++) {
      const label = this.mask[start];
      if (!label) continue;
      let head = 0, tail = 1, sumX = 0, sumY = 0;
      this.queue[0] = start;
      this.mask[start] = 0;
      while (head < tail) {
        const i = this.queue[head++], x = i % this.width, y = Math.floor(i / this.width);
        sumX += x; sumY += y;
        for (let direction = 0; direction < 4; direction++) {
          if ((direction === 0 && x === 0) || (direction === 1 && x + 1 === this.width)
            || (direction === 2 && y === 0) || (direction === 3 && y + 1 === this.height)) continue;
          const next = direction === 0 ? i - 1 : direction === 1 ? i + 1
            : direction === 2 ? i - this.width : i + this.width;
          if (this.mask[next] === label) { this.mask[next] = 0; this.queue[tail++] = next; }
        }
      }
      if (tail > largest[label - 1]) {
        largest[label - 1] = tail;
        result[label - 1] = { x: sumX / tail / this.width, y: sumY / tail / this.height };
      }
    }
    return result;
  }
}
