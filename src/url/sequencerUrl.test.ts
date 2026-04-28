import { describe, expect, it } from "vitest";
import {
  normalizeSequencerUrlState,
  parseSequencerUrl,
} from "./sequencerUrl";

describe("parseSequencerUrl", () => {
  it("URLパラメータを復元する", () => {
    expect(parseSequencerUrl("?bpm=140&stepsPerBeat=8&swing=0.25")).toEqual({
      bpm: 140,
      stepsPerBeat: 8,
      swing: 0.25,
    });
  });

  it("境界外の値をクランプする", () => {
    expect(parseSequencerUrl("?bpm=999&stepsPerBeat=0&swing=2")).toEqual({
      bpm: 300,
      stepsPerBeat: 1,
      swing: 0.95,
    });
  });

  it("不正値や空値はデフォルトに戻す", () => {
    expect(parseSequencerUrl("?bpm=abc&stepsPerBeat=&swing=NaN")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      swing: 0,
    });
  });

  it("stepsPerBeatを整数に丸める", () => {
    expect(parseSequencerUrl("?stepsPerBeat=3.6")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      swing: 0,
    });
  });
});

describe("normalizeSequencerUrlState", () => {
  it("store更新値のNaNや無限大をデフォルトに戻す", () => {
    expect(
      normalizeSequencerUrlState({
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
      normalizeSequencerUrlState({
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
