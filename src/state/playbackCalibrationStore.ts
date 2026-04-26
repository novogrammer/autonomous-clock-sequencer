import { create } from "zustand";
import { secondsToMs } from "../clock/clock";

const PLAYBACK_OFFSET_STORAGE_KEY =
  "autonomous-clock-sequencer:playbackOffsetMs";
const MIN_PLAYBACK_OFFSET_MS = -secondsToMs(10);
const MAX_PLAYBACK_OFFSET_MS = secondsToMs(10);

type PlaybackCalibrationState = {
  playbackOffsetMs: number;
  isPlaybackOffsetStored: boolean;
  setPlaybackOffsetMs: (playbackOffsetMs: number) => void;
  resetPlaybackOffsetMs: () => void;
};

const initialPlaybackOffset = readStoredPlaybackOffsetMs();

export const usePlaybackCalibrationStore = create<PlaybackCalibrationState>(
  (set) => ({
    playbackOffsetMs: initialPlaybackOffset.playbackOffsetMs,
    isPlaybackOffsetStored: initialPlaybackOffset.isStored,
    setPlaybackOffsetMs: (playbackOffsetMs) => {
      const nextPlaybackOffsetMs = normalizePlaybackOffsetMs(playbackOffsetMs);
      const isStored = writeStoredPlaybackOffsetMs(nextPlaybackOffsetMs);
      set({
        playbackOffsetMs: nextPlaybackOffsetMs,
        isPlaybackOffsetStored: isStored,
      });
    },
    resetPlaybackOffsetMs: () => {
      removeStoredPlaybackOffsetMs();
      set({
        playbackOffsetMs: 0,
        isPlaybackOffsetStored: false,
      });
    },
  }),
);

function readStoredPlaybackOffsetMs(): {
  playbackOffsetMs: number;
  isStored: boolean;
} {
  if (typeof window === "undefined") {
    return { playbackOffsetMs: 0, isStored: false };
  }

  try {
    const raw = window.localStorage.getItem(PLAYBACK_OFFSET_STORAGE_KEY);
    if (raw === null) {
      return { playbackOffsetMs: 0, isStored: false };
    }

    if (raw.trim() === "") {
      return { playbackOffsetMs: 0, isStored: false };
    }

    return {
      playbackOffsetMs: normalizePlaybackOffsetMs(Number(raw)),
      isStored: true,
    };
  } catch {
    return { playbackOffsetMs: 0, isStored: false };
  }
}

function writeStoredPlaybackOffsetMs(playbackOffsetMs: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      PLAYBACK_OFFSET_STORAGE_KEY,
      String(playbackOffsetMs),
    );
    return true;
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
    return false;
  }
}

function removeStoredPlaybackOffsetMs(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(PLAYBACK_OFFSET_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function normalizePlaybackOffsetMs(playbackOffsetMs: number): number {
  if (!Number.isFinite(playbackOffsetMs)) {
    return 0;
  }

  return clamp(
    playbackOffsetMs,
    MIN_PLAYBACK_OFFSET_MS,
    MAX_PLAYBACK_OFFSET_MS,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
