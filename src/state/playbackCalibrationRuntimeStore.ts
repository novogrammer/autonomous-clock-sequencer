import { create } from "zustand";

type PlaybackCalibrationRuntimeState = {
  isCalibrating: boolean;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const usePlaybackCalibrationRuntimeStore =
  create<PlaybackCalibrationRuntimeState>((set) => ({
    isCalibrating: false,
    setCalibrating: (isCalibrating) => set({ isCalibrating }),
  }));
