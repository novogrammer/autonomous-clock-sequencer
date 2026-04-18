import { create } from "zustand";

export const DELAY_PRESETS_MS = [1, 2, 3, 5, 7, 10, 15, 20] as const;

type DelayTestState = {
  delayMs: number;
  isLooping: boolean;
  playbackOffsetMs: number;
  calibrationIntervalMs: number;
  isCalibrating: boolean;
  setDelayMs: (delayMs: number) => void;
  setLooping: (isLooping: boolean) => void;
  setPlaybackOffsetMs: (playbackOffsetMs: number) => void;
  setCalibrationIntervalMs: (calibrationIntervalMs: number) => void;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const useDelayTestStore = create<DelayTestState>((set) => ({
  delayMs: 5,
  isLooping: false,
  playbackOffsetMs: 0,
  calibrationIntervalMs: 1000,
  isCalibrating: false,
  setDelayMs: (delayMs) => set({ delayMs: clamp(delayMs, 0, 100) }),
  setLooping: (isLooping) => set({ isLooping }),
  setPlaybackOffsetMs: (playbackOffsetMs) =>
    set({ playbackOffsetMs: clamp(playbackOffsetMs, -10_000, 10_000) }),
  setCalibrationIntervalMs: (calibrationIntervalMs) =>
    set({ calibrationIntervalMs: clamp(calibrationIntervalMs, 250, 5000) }),
  setCalibrating: (isCalibrating) => set({ isCalibrating }),
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
