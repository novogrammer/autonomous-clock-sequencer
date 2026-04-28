import { describe, expect, it } from "vitest";
import {
  normalizePhase0UrlState,
  parsePhase0Url,
} from "./phase0Url";

describe("parsePhase0Url", () => {
  it("URLパラメータを復元する", () => {
    expect(parsePhase0Url("?bpm=140&stepsPerBeat=8&swing=0.25")).toEqual({
      bpm: 140,
      stepsPerBeat: 8,
      swing: 0.25,
    });
  });

  it("境界外の値をクランプする", () => {
    expect(parsePhase0Url("?bpm=999&stepsPerBeat=0&swing=2")).toEqual({
      bpm: 300,
      stepsPerBeat: 1,
      swing: 0.95,
    });
  });

  it("不正値や空値はデフォルトに戻す", () => {
    expect(parsePhase0Url("?bpm=abc&stepsPerBeat=&swing=NaN")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      swing: 0,
    });
  });

  it("stepsPerBeatを整数に丸める", () => {
    expect(parsePhase0Url("?stepsPerBeat=3.6")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      swing: 0,
    });
  });
});

describe("normalizePhase0UrlState", () => {
  it("store更新値のNaNや無限大をデフォルトに戻す", () => {
    expect(
      normalizePhase0UrlState({
        bpm: Number.NaN,
        stepsPerBeat: Number.POSITIVE_INFINITY,
        swing: Number.NEGATIVE_INFINITY,
      }),
    ).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      swing: 0,
    });
  });

  it("store更新値をURL方針に合わせて正規化する", () => {
    expect(
      normalizePhase0UrlState({
        bpm: 19,
        stepsPerBeat: 7.8,
        swing: -0.1,
      }),
    ).toEqual({
      bpm: 20,
      stepsPerBeat: 8,
      swing: 0,
    });
  });
});
