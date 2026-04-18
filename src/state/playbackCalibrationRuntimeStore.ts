import { create } from "zustand";

type PlaybackCalibrationRuntimeState = {
  clickFrequencyHz: number;
  isCalibrating: boolean;
  setClickFrequencyHz: (clickFrequencyHz: number) => void;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const usePlaybackCalibrationRuntimeStore =
  create<PlaybackCalibrationRuntimeState>((set) => ({
    clickFrequencyHz: 2000,
    isCalibrating: false,
    setClickFrequencyHz: (clickFrequencyHz) =>
      set({ clickFrequencyHz: clamp(Math.round(clickFrequencyHz), 800, 4000) }),
    setCalibrating: (isCalibrating) => set({ isCalibrating }),
  }));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
