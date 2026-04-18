import { create } from "zustand";

type PlaybackCalibrationState = {
  playbackOffsetMs: number;
  setPlaybackOffsetMs: (playbackOffsetMs: number) => void;
};

export const usePlaybackCalibrationStore = create<PlaybackCalibrationState>(
  (set) => ({
    playbackOffsetMs: 0,
    setPlaybackOffsetMs: (playbackOffsetMs) =>
      set({ playbackOffsetMs: clamp(playbackOffsetMs, -10_000, 10_000) }),
  }),
);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
