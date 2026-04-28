import type { MetronomeState } from "../state/metronomeStore";

export type Phase0UrlState = Pick<
  MetronomeState,
  "bpm" | "stepsPerBeat" | "swing"
>;

const DEFAULTS: Phase0UrlState = {
  bpm: 120,
  stepsPerBeat: 4,
  swing: 0,
};

export function parsePhase0Url(search: string): Phase0UrlState {
  const params = new URLSearchParams(search);

  return normalizePhase0UrlState({
    bpm: readNumber(params, "bpm", DEFAULTS.bpm, 20, 300),
    stepsPerBeat: readNumber(params, "stepsPerBeat", DEFAULTS.stepsPerBeat, 1, 16),
    swing: readNumber(params, "swing", DEFAULTS.swing, 0, 0.95),
  });
}

export function buildPhase0Url(state: Phase0UrlState): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  const normalized = normalizePhase0UrlState(state);
  params.set("bpm", formatNumber(normalized.bpm));
  params.set("stepsPerBeat", String(normalized.stepsPerBeat));
  params.set("swing", formatNumber(normalized.swing));

  return `${url.pathname}?${params.toString()}${url.hash}`;
}

export function replaceUrlFromState(state: Phase0UrlState): void {
  const nextUrl = buildPhase0Url(state);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
}

export function normalizePhase0UrlState(
  state: Partial<Phase0UrlState>,
): Phase0UrlState {
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
