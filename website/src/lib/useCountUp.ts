import { useEffect, useRef, useState } from "react";

/** Animates a number up from 0 once it is known. Honours prefers-reduced-motion. */
export function useCountUp(target: number | null, durationMs = 900): number | null {
  const [shown, setShown] = useState<number | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (target === null) {
      setShown(null);
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || target < 20) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setShown(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs]);

  return shown;
}
