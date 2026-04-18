import { create } from "zustand";

type DelayTestState = {
  calibrationIntervalMs: number;
  isCalibrating: boolean;
  setCalibrationIntervalMs: (calibrationIntervalMs: number) => void;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const useDelayTestStore = create<DelayTestState>((set) => ({
  calibrationIntervalMs: 1000,
  isCalibrating: false,
  setCalibrationIntervalMs: (calibrationIntervalMs) =>
    set({ calibrationIntervalMs: clamp(calibrationIntervalMs, 250, 5000) }),
  setCalibrating: (isCalibrating) => set({ isCalibrating }),
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
