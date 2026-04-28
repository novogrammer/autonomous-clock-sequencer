import { create } from "zustand";
import { normalizePhase0UrlState, parsePhase0Url } from "../url/phase0Url";

export type MetronomeState = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
  isPlaying: boolean;
  setBpm: (bpm: number) => void;
  setStepsPerBeat: (stepsPerBeat: number) => void;
  setSwing: (swing: number) => void;
  start: () => void;
  stop: () => void;
  hydrateFromUrl: (search: string) => void;
};

const initialUrlState =
  typeof window === "undefined"
    ? { bpm: 120, stepsPerBeat: 4, swing: 0 }
    : parsePhase0Url(window.location.search);

export const useMetronomeStore = create<MetronomeState>((set) => ({
  ...initialUrlState,
  isPlaying: false,

  setBpm: (bpm) =>
    set((state) => normalizePhase0UrlState({ ...state, bpm })),

  setStepsPerBeat: (stepsPerBeat) =>
    set((state) => normalizePhase0UrlState({ ...state, stepsPerBeat })),

  setSwing: (swing) =>
    set((state) => normalizePhase0UrlState({ ...state, swing })),

  start: () =>
    set({
      isPlaying: true,
    }),

  stop: () => set({ isPlaying: false }),

  hydrateFromUrl: (search) => {
    const next = parsePhase0Url(search);
    set({ ...next, isPlaying: false });
  },
}));
