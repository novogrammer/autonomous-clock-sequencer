import { create } from "zustand";

export const DELAY_PRESETS_MS = [1, 2, 3, 5, 7, 10, 15, 20] as const;

type DelayTestState = {
  delayMs: number;
  isLooping: boolean;
  setDelayMs: (delayMs: number) => void;
  setLooping: (isLooping: boolean) => void;
};

export const useDelayTestStore = create<DelayTestState>((set) => ({
  delayMs: 5,
  isLooping: false,
  setDelayMs: (delayMs) => set({ delayMs: clamp(delayMs, 0, 100) }),
  setLooping: (isLooping) => set({ isLooping }),
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
