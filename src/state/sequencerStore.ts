import { create } from "zustand";
import {
  normalizeSequencerUrlState,
  parseSequencerUrl,
} from "../url/sequencerUrl";

export type SequencerState = {
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
    : parseSequencerUrl(window.location.search);

export const useSequencerStore = create<SequencerState>((set) => ({
  ...initialUrlState,
  isPlaying: false,

  setBpm: (bpm) =>
    set((state) => normalizeSequencerUrlState({ ...state, bpm })),

  setStepsPerBeat: (stepsPerBeat) =>
    set((state) => normalizeSequencerUrlState({ ...state, stepsPerBeat })),

  setSwing: (swing) =>
    set((state) => normalizeSequencerUrlState({ ...state, swing })),

  start: () =>
    set({
      isPlaying: true,
    }),

  stop: () => set({ isPlaying: false }),

  hydrateFromUrl: (search) => {
    const next = parseSequencerUrl(search);
    set({ ...next, isPlaying: false });
  },
}));
