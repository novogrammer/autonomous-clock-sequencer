import type { SequencerState } from "../state/sequencerStore";

export type SequencerUrlState = Pick<
  SequencerState,
  "bpm" | "stepsPerBeat" | "swing"
>;

const DEFAULTS: SequencerUrlState = {
  bpm: 120,
  stepsPerBeat: 4,
  swing: 0,
};

export function parseSequencerUrl(search: string): SequencerUrlState {
  const params = new URLSearchParams(search);

  return normalizeSequencerUrlState({
    bpm: readNumber(params, "bpm", DEFAULTS.bpm, 20, 300),
    stepsPerBeat: readNumber(params, "stepsPerBeat", DEFAULTS.stepsPerBeat, 1, 16),
    swing: readNumber(params, "swing", DEFAULTS.swing, 0, 0.95),
  });
}

export function buildSequencerUrl(state: SequencerUrlState): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  const normalized = normalizeSequencerUrlState(state);
  params.set("bpm", formatNumber(normalized.bpm));
  params.set("stepsPerBeat", String(normalized.stepsPerBeat));
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
  return {
    bpm: normalizeNumber(state.bpm, DEFAULTS.bpm, 20, 300),
    stepsPerBeat: Math.round(
      normalizeNumber(state.stepsPerBeat, DEFAULTS.stepsPerBeat, 1, 16),
    ),
    swing: normalizeNumber(state.swing, DEFAULTS.swing, 0, 0.95),
  };
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

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
