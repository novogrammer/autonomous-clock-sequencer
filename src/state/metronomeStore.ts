import { create } from "zustand";
import { retimeStartAtForBpmChange } from "../transport/transport";
import { parsePhase0Url } from "../url/phase0Url";

export type MetronomeState = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
  startAt: number | null;
  isPlaying: boolean;
  setBpm: (bpm: number, nowMs?: number) => void;
  setStepsPerBeat: (stepsPerBeat: number) => void;
  setSwing: (swing: number) => void;
  start: (nowMs?: number) => void;
  stop: () => void;
  hydrateFromUrl: (search: string) => void;
};

const initialUrlState =
  typeof window === "undefined"
    ? { bpm: 120, stepsPerBeat: 4, swing: 0, startAt: null }
    : parsePhase0Url(window.location.search);

export const useMetronomeStore = create<MetronomeState>((set) => ({
  ...initialUrlState,
  isPlaying: initialUrlState.startAt !== null,

  setBpm: (bpm, nowMs = Date.now()) =>
    set((state) => {
      const nextBpm = clamp(bpm, 20, 300);
      const startAt = state.isPlaying
        ? retimeStartAtForBpmChange(state, nextBpm, nowMs)
        : state.startAt;

      return { bpm: nextBpm, startAt };
    }),

  setStepsPerBeat: (stepsPerBeat) =>
    set({ stepsPerBeat: Math.round(clamp(stepsPerBeat, 1, 16)) }),

  setSwing: (swing) => set({ swing: clamp(swing, 0, 0.95) }),

  start: (nowMs = Date.now()) =>
    set((state) => ({
      isPlaying: true,
      startAt: state.startAt ?? nowMs,
    })),

  stop: () => set({ isPlaying: false, startAt: null }),

  hydrateFromUrl: (search) => {
    const next = parsePhase0Url(search);
    set({ ...next, isPlaying: next.startAt !== null });
  },
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
