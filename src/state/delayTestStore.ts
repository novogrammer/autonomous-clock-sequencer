import { create } from "zustand";

type DelayTestState = {
  isCalibrating: boolean;
  setCalibrating: (isCalibrating: boolean) => void;
};

export const useDelayTestStore = create<DelayTestState>((set) => ({
  isCalibrating: false,
  setCalibrating: (isCalibrating) => set({ isCalibrating }),
}));
