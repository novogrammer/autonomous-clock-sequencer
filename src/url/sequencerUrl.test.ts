import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSequencerUrl,
  normalizePattern,
  normalizeSequencerUrlState,
  parseSequencerUrl,
} from "./sequencerUrl";

describe("parseSequencerUrl", () => {
  it("URLパラメータを復元する", () => {
    expect(
      parseSequencerUrl(
        "?bpm=140&stepsPerBeat=8&beatsPerLoop=2&kit=minimal&pattern=10_01&swing=0.25",
      ),
    ).toEqual({
      bpm: 140,
      stepsPerBeat: 8,
      beatsPerLoop: 2,
      kit: "minimal",
      pattern:
        "1000000000000000_0100000000000000_0000000000000000_0000000000000000",
      swing: 0.25,
    });
  });

  it("境界外の値をクランプする", () => {
    expect(parseSequencerUrl("?bpm=999&stepsPerBeat=0&beatsPerLoop=99&swing=2")).toEqual({
      bpm: 300,
      stepsPerBeat: 1,
      beatsPerLoop: 32,
      kit: "minimal",
      pattern: "0".repeat(32) + "_" + "0".repeat(32) + "_" + "0".repeat(32) + "_" + "0".repeat(32),
      swing: 0.95,
    });
  });

  it("不正値や空値はデフォルトに戻す", () => {
    expect(parseSequencerUrl("?bpm=abc&stepsPerBeat=&beatsPerLoop=&kit=unknown&swing=NaN")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "0000000000000000_0000000000000000_0000000000000000_0000000000000000",
      swing: 0,
    });
  });

  it("kit=bass-fourths を復元する", () => {
    expect(parseSequencerUrl("?kit=bass-fourths&pattern=1000_0100_0010_0001")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "bass-fourths",
      pattern:
        "1000000000000000_0100000000000000_0010000000000000_0001000000000000",
      swing: 0,
    });
  });

  it("stepsPerBeatを整数に丸める", () => {
    expect(parseSequencerUrl("?stepsPerBeat=3.6")).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "0000000000000000_0000000000000000_0000000000000000_0000000000000000",
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
        beatsPerLoop: Number.NEGATIVE_INFINITY,
        kit: "unknown",
        pattern: undefined,
        swing: Number.NEGATIVE_INFINITY,
      }),
    ).toEqual({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "0000000000000000_0000000000000000_0000000000000000_0000000000000000",
      swing: 0,
    });
  });

  it("store更新値をURL方針に合わせて正規化する", () => {
    expect(
      normalizeSequencerUrlState({
        bpm: 19,
        stepsPerBeat: 7.8,
        beatsPerLoop: 3.2,
        kit: "minimal",
        pattern: "1010",
        swing: -0.1,
      }),
    ).toEqual({
      bpm: 20,
      stepsPerBeat: 8,
      beatsPerLoop: 3,
      kit: "minimal",
      pattern:
        "101000000000000000000000_000000000000000000000000_000000000000000000000000_000000000000000000000000",
      swing: 0,
    });
  });
});

describe("normalizePattern", () => {
  it("トラック数不足と文字列長不足は0で補完する", () => {
    expect(
      normalizePattern("1010_01", {
        kit: "minimal",
        stepsPerBeat: 4,
        beatsPerLoop: 2,
      }),
    ).toBe(
      "10100000_01000000_00000000_00000000",
    );
  });

  it("不正文字と過剰トラックを切り捨てて正規化する", () => {
    expect(
      normalizePattern("10x1_111111111_0101_1_1111", {
        kit: "minimal",
        stepsPerBeat: 2,
        beatsPerLoop: 2,
      }),
    ).toBe("1001_1111_0101_1000");
  });

  it("loop長を広げても新しい領域は推測せず0で埋める", () => {
    expect(
      normalizePattern("1010_01", {
        kit: "minimal",
        stepsPerBeat: 4,
        beatsPerLoop: 4,
      }),
    ).toBe(
      "1010000000000000_0100000000000000_0000000000000000_0000000000000000",
    );
  });
});

describe("buildSequencerUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Phase 1 の共有状態を URL に載せる", () => {
    vi.stubGlobal("window", {
      location: {
        href: "https://example.com/sequencer",
      },
    });

    expect(
      buildSequencerUrl({
        bpm: 120,
        stepsPerBeat: 4,
        beatsPerLoop: 4,
        kit: "minimal",
        pattern:
          "1000100010001000_0000100000001000_1010101010101010_0000000010000000",
        swing: 0,
      }),
    ).toBe(
      "/sequencer?bpm=120&stepsPerBeat=4&beatsPerLoop=4&kit=minimal&pattern=1000100010001000_0000100000001000_1010101010101010_0000000010000000&swing=0",
    );
  });

  it("bass-fourths の共有状態を URL に載せる", () => {
    vi.stubGlobal("window", {
      location: {
        href: "https://example.com/sequencer",
      },
    });

    expect(
      buildSequencerUrl({
        bpm: 96,
        stepsPerBeat: 4,
        beatsPerLoop: 4,
        kit: "bass-fourths",
        pattern:
          "1000000000000000_0100000000000000_0010000000000000_0001000000000000",
        swing: 0,
      }),
    ).toBe(
      "/sequencer?bpm=96&stepsPerBeat=4&beatsPerLoop=4&kit=bass-fourths&pattern=1000000000000000_0100000000000000_0010000000000000_0001000000000000&swing=0",
    );
  });
});
