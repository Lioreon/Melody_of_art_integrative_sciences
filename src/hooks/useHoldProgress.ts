import { useEffect, useRef, useState } from 'react';
import { HoldTimer } from '../services/holdTimer';

export function useHoldProgress(key: string, matched: boolean, durationMs: number, onComplete: () => void) {
  const callback = useRef(onComplete);
  useEffect(() => { callback.current = onComplete; }, [onComplete]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    if (!matched) return;
    const timer = new HoldTimer();
    timer.update(true, performance.now(), durationMs);
    const id = window.setInterval(() => {
      const result = timer.update(true, performance.now(), durationMs);
      setProgress(result.progress);
      if (result.justCompleted) { clearInterval(id); callback.current(); }
    }, 25);
    return () => clearInterval(id);
  }, [key, matched, durationMs]);
  return [progress, setProgress] as const;
}
