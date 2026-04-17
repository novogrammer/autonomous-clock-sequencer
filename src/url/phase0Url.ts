import type { MetronomeState } from "../state/metronomeStore";

export type Phase0UrlState = Pick<
  MetronomeState,
  "bpm" | "stepsPerBeat" | "swing" | "startAt"
>;

const DEFAULTS: Phase0UrlState = {
  bpm: 120,
  stepsPerBeat: 4,
  swing: 0,
  startAt: null,
};

export function parsePhase0Url(search: string): Phase0UrlState {
  const params = new URLSearchParams(search);

  return {
    bpm: readNumber(params, "bpm", DEFAULTS.bpm, 20, 300),
    stepsPerBeat: Math.round(
      readNumber(params, "stepsPerBeat", DEFAULTS.stepsPerBeat, 1, 16),
    ),
    swing: readNumber(params, "swing", DEFAULTS.swing, 0, 0.95),
    startAt: readNullableInteger(params, "startAt"),
  };
}

export function buildPhase0Url(state: Phase0UrlState): string {
  const url = new URL(window.location.href);
  url.searchParams.set("bpm", formatNumber(state.bpm));
  url.searchParams.set("stepsPerBeat", String(state.stepsPerBeat));
  url.searchParams.set("swing", formatNumber(state.swing));

  if (state.startAt === null) {
    url.searchParams.delete("startAt");
  } else {
    url.searchParams.set("startAt", String(state.startAt));
  }

  return `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
}

export function replaceUrlFromState(state: Phase0UrlState): void {
  const nextUrl = buildPhase0Url(state);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
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

function readNullableInteger(
  params: URLSearchParams,
  key: string,
): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") {
    return null;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
