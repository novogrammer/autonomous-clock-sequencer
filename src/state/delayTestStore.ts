import { create } from "zustand";

export const DELAY_PRESETS_MS = [1, 2, 3, 5, 7, 10, 15, 20] as const;

type DelayTestState = {
  delayMs: number;
  isLooping: boolean;
  calibrationIntervalMs: number;
  isCalibrating: boolean;
  setDelayMs: (delayMs: number) => void;
  setLooping: (isLooping: boolean) => void;
  setCalibrationIntervalMs: (calibrationIntervalMs: number) => void;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const useDelayTestStore = create<DelayTestState>((set) => ({
  delayMs: 5,
  isLooping: false,
  calibrationIntervalMs: 1000,
  isCalibrating: false,
  setDelayMs: (delayMs) => set({ delayMs: clamp(delayMs, 0, 100) }),
  setLooping: (isLooping) => set({ isLooping }),
  setCalibrationIntervalMs: (calibrationIntervalMs) =>
    set({ calibrationIntervalMs: clamp(calibrationIntervalMs, 250, 5000) }),
  setCalibrating: (isCalibrating) => set({ isCalibrating }),
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
