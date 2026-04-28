import { useEffect, useMemo, useState } from "react";
import { nowMs } from "../clock/clock";
import {
  calculatePosition,
  type TransportConfig,
  type TransportPosition,
} from "../transport/transport";

type SequencerPositionParams = TransportConfig & {
  beatsPerLoop: number;
  playbackOffsetMs: number;
};

export function useSequencerPosition({
  bpm,
  stepsPerBeat,
  beatsPerLoop,
  swing,
  playbackOffsetMs,
}: SequencerPositionParams): TransportPosition {
  const config = useMemo(
    () => ({ bpm, stepsPerBeat, swing }),
    [bpm, stepsPerBeat, swing],
  );
  const loopLength = stepsPerBeat * beatsPerLoop;
  const [position, setPosition] = useState<TransportPosition>(() =>
    calculatePosition(config, nowMs() + playbackOffsetMs, loopLength),
  );

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setPosition(calculatePosition(config, nowMs() + playbackOffsetMs, loopLength));
    }, 50);

    return () => window.clearInterval(timerId);
  }, [config, loopLength, playbackOffsetMs]);

  return position;
}
