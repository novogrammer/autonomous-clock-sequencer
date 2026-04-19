import { create } from "zustand";
import { secondsToMs } from "../clock/clock";

type PlaybackCalibrationState = {
  playbackOffsetMs: number;
  setPlaybackOffsetMs: (playbackOffsetMs: number) => void;
};

export const usePlaybackCalibrationStore = create<PlaybackCalibrationState>(
  (set) => ({
    playbackOffsetMs: 0,
    setPlaybackOffsetMs: (playbackOffsetMs) =>
      set({
        playbackOffsetMs: clamp(
          playbackOffsetMs,
          -secondsToMs(10),
          secondsToMs(10),
        ),
      }),
  }),
);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
