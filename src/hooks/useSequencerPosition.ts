import { useEffect, useMemo, useState } from "react";
import { nowMs } from "../clock/clock";
import {
  calculatePosition,
  type TransportConfig,
  type TransportPosition,
} from "../transport/transport";

type SequencerPositionParams = TransportConfig & {
  playbackOffsetMs: number;
};

export function useSequencerPosition({
  bpm,
  stepsPerBeat,
  swing,
  playbackOffsetMs,
}: SequencerPositionParams): TransportPosition {
  const config = useMemo(
    () => ({ bpm, stepsPerBeat, swing }),
    [bpm, stepsPerBeat, swing],
  );
  const [position, setPosition] = useState<TransportPosition>(() =>
    calculatePosition(config, nowMs() + playbackOffsetMs),
  );

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setPosition(calculatePosition(config, nowMs() + playbackOffsetMs));
    }, 50);

    return () => window.clearInterval(timerId);
  }, [config, playbackOffsetMs]);

  return position;
}
