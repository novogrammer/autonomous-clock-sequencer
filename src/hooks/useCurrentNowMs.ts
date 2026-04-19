import { useEffect, useState } from "react";
import { nowMs } from "../clock/clock";

export function useCurrentNowMs(intervalMs = 50): number {
  const [currentNowMs, setCurrentNowMs] = useState(() => nowMs());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentNowMs(nowMs());
    }, intervalMs);

    return () => window.clearInterval(timerId);
  }, [intervalMs]);

  return currentNowMs;
}
