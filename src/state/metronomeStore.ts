import { create } from "zustand";
import { parsePhase0Url } from "../url/phase0Url";

export type MetronomeState = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
  startAt: number;
  isPlaying: boolean;
  setBpm: (bpm: number) => void;
  setStepsPerBeat: (stepsPerBeat: number) => void;
  setSwing: (swing: number) => void;
  start: () => void;
  stop: () => void;
  hydrateFromUrl: (search: string) => void;
};

const FIXED_START_AT_MS = 0;

const initialUrlState =
  typeof window === "undefined"
    ? { bpm: 120, stepsPerBeat: 4, swing: 0 }
    : parsePhase0Url(window.location.search);

export const useMetronomeStore = create<MetronomeState>((set) => ({
  ...initialUrlState,
  startAt: FIXED_START_AT_MS,
  isPlaying: false,

  setBpm: (bpm) => set({ bpm: clamp(bpm, 20, 300) }),

  setStepsPerBeat: (stepsPerBeat) =>
    set({ stepsPerBeat: Math.round(clamp(stepsPerBeat, 1, 16)) }),

  setSwing: (swing) => set({ swing: clamp(swing, 0, 0.95) }),

  start: () =>
    set({
      isPlaying: true,
      startAt: FIXED_START_AT_MS,
    }),

  stop: () => set({ isPlaying: false, startAt: FIXED_START_AT_MS }),

  hydrateFromUrl: (search) => {
    const next = parsePhase0Url(search);
    set({ ...next, startAt: FIXED_START_AT_MS, isPlaying: false });
  },
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
