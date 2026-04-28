import {
  getDefaultKitId,
  getKitTracks,
  isKitId,
} from "../kit/kits";
import type { SequencerState } from "../state/sequencerStore";

export type SequencerUrlState = Pick<
  SequencerState,
  "bpm" | "stepsPerBeat" | "swing" | "beatsPerLoop" | "kit" | "pattern"
>;

const DEFAULTS: SequencerUrlState = {
  bpm: 120,
  stepsPerBeat: 4,
  beatsPerLoop: 4,
  kit: getDefaultKitId(),
  pattern: buildEmptyPattern(4, 4),
  swing: 0,
};

export function parseSequencerUrl(search: string): SequencerUrlState {
  const params = new URLSearchParams(search);

  return normalizeSequencerUrlState({
    bpm: readNumber(params, "bpm", DEFAULTS.bpm, 20, 300),
    stepsPerBeat: readNumber(params, "stepsPerBeat", DEFAULTS.stepsPerBeat, 1, 16),
    beatsPerLoop: readNumber(params, "beatsPerLoop", DEFAULTS.beatsPerLoop, 1, 32),
    kit: params.get("kit") ?? DEFAULTS.kit,
    pattern: params.get("pattern") ?? DEFAULTS.pattern,
    swing: readNumber(params, "swing", DEFAULTS.swing, 0, 0.95),
  });
}

export function buildSequencerUrl(state: SequencerUrlState): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  const normalized = normalizeSequencerUrlState(state);
  params.set("bpm", formatNumber(normalized.bpm));
  params.set("stepsPerBeat", String(normalized.stepsPerBeat));
  params.set("beatsPerLoop", String(normalized.beatsPerLoop));
  params.set("kit", normalized.kit);
  params.set("pattern", normalized.pattern);
  params.set("swing", formatNumber(normalized.swing));

  return `${url.pathname}?${params.toString()}${url.hash}`;
}

export function replaceUrlFromState(state: SequencerUrlState): void {
  const nextUrl = buildSequencerUrl(state);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
}

export function normalizeSequencerUrlState(
  state: Partial<SequencerUrlState>,
): SequencerUrlState {
  const stepsPerBeat = Math.round(
    normalizeNumber(state.stepsPerBeat, DEFAULTS.stepsPerBeat, 1, 16),
  );
  const beatsPerLoop = Math.round(
    normalizeNumber(state.beatsPerLoop, DEFAULTS.beatsPerLoop, 1, 32),
  );
  const kit = normalizeKit(state.kit);

  return {
    bpm: normalizeNumber(state.bpm, DEFAULTS.bpm, 20, 300),
    stepsPerBeat,
    beatsPerLoop,
    kit,
    pattern: normalizePattern(state.pattern, {
      kit,
      stepsPerBeat,
      beatsPerLoop,
    }),
    swing: normalizeNumber(state.swing, DEFAULTS.swing, 0, 0.95),
  };
}

export function normalizePattern(
  value: string | undefined,
  {
    kit,
    stepsPerBeat,
    beatsPerLoop,
  }: Pick<SequencerUrlState, "kit" | "stepsPerBeat" | "beatsPerLoop">,
): string {
  const normalizedKit = normalizeKit(kit);
  const trackCount = getTrackCount(normalizedKit);
  const loopLength = stepsPerBeat * beatsPerLoop;
  const tracks = (value ?? "").split("_");
  const normalizedTracks: string[] = [];

  for (let index = 0; index < trackCount; index += 1) {
    normalizedTracks.push(
      normalizeTrackPattern(tracks[index] ?? "", loopLength),
    );
  }

  return normalizedTracks.join("_");
}

function readNumber(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return clamp(value, min, max);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeNumber(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return clamp(value, min, max);
}

function normalizeKit(value: string | undefined): string {
  if (value !== undefined && isKitId(value)) {
    return value;
  }

  return DEFAULTS.kit;
}

function getTrackCount(kit: string): number {
  return getKitTracks(kit).length;
}

function normalizeTrackPattern(value: string, loopLength: number): string {
  const sanitized = value
    .slice(0, loopLength)
    .replace(/[^01]/g, "0");

  return sanitized.padEnd(loopLength, "0");
}

function buildEmptyPattern(stepsPerBeat: number, beatsPerLoop: number): string {
  const trackLength = stepsPerBeat * beatsPerLoop;
  const emptyTrack = "0".repeat(trackLength);
  return Array.from({ length: getTrackCount(getDefaultKitId()) }, () => emptyTrack).join("_");
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
