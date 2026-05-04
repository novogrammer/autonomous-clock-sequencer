import { create } from "zustand";
import {
  applyExampleScore,
  applyPatternPreset,
  type ExampleScore,
  type PatternPreset,
} from "../score/scoreCatalog";
import {
  normalizeSequencerUrlState,
  parseSequencerUrl,
} from "../url/sequencerUrl";

export type SequencerState = {
  bpm: number;
  stepsPerBeat: number;
  beatsPerLoop: number;
  kit: string;
  pattern: string;
  swing: number;
  isPlaying: boolean;
  setBpm: (bpm: number) => void;
  setStepsPerBeat: (stepsPerBeat: number) => void;
  setBeatsPerLoop: (beatsPerLoop: number) => void;
  setKit: (kit: string) => void;
  setPattern: (pattern: string) => void;
  setSwing: (swing: number) => void;
  loadExampleScore: (exampleScore: ExampleScore) => void;
  loadPatternPreset: (patternPreset: PatternPreset) => void;
  start: () => void;
  stop: () => void;
  hydrateFromUrl: (search: string) => void;
};

const initialUrlState =
  typeof window === "undefined"
    ? parseSequencerUrl("")
    : parseSequencerUrl(window.location.search);

export const useSequencerStore = create<SequencerState>((set) => ({
  ...initialUrlState,
  isPlaying: false,

  setBpm: (bpm) =>
    set((state) => normalizeSequencerUrlState({ ...state, bpm })),

  setStepsPerBeat: (stepsPerBeat) =>
    set((state) => normalizeSequencerUrlState({ ...state, stepsPerBeat })),

  setBeatsPerLoop: (beatsPerLoop) =>
    set((state) => normalizeSequencerUrlState({ ...state, beatsPerLoop })),

  setKit: (kit) =>
    set((state) => normalizeSequencerUrlState({ ...state, kit })),

  setPattern: (pattern) =>
    set((state) => normalizeSequencerUrlState({ ...state, pattern })),

  setSwing: (swing) =>
    set((state) => normalizeSequencerUrlState({ ...state, swing })),

  loadExampleScore: (exampleScore) =>
    set(() => applyExampleScore(exampleScore)),

  loadPatternPreset: (patternPreset) =>
    set((state) => applyPatternPreset(state, patternPreset)),

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
