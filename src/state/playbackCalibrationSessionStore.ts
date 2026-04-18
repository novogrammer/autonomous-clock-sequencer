import { create } from "zustand";

type PlaybackCalibrationSessionState = {
  isCalibrating: boolean;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const usePlaybackCalibrationSessionStore =
  create<PlaybackCalibrationSessionState>((set) => ({
    isCalibrating: false,
    setCalibrating: (isCalibrating) => set({ isCalibrating }),
  }));
