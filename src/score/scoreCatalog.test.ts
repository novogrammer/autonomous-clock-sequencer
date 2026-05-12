import { describe, expect, it } from "vitest";
import {
  EXAMPLE_SCORES,
  PATTERN_PRESETS,
  applyExampleScore,
  applyPatternPreset,
} from "./scoreCatalog";

describe("applyExampleScore", () => {
  it("example score で URL 共有状態を一式差し替える", () => {
    const score = EXAMPLE_SCORES.find((item) => item.id === "minimal-swung-break");

    expect(score).toBeDefined();
    expect(applyExampleScore(score!)).toEqual({
      bpm: 132,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "1000000010001000_0000100000001000_1010111010101110_0000000000100000",
      swing: 0.18,
    });
  });
});

describe("applyPatternPreset", () => {
  it("preset 適用時は bpm と swing を維持したまま kit 系の値を差し替える", () => {
    const preset = PATTERN_PRESETS.find((item) => item.id === "bass-fourths-triplet-climb");

    expect(preset).toBeDefined();
    expect(
      applyPatternPreset(
        {
          bpm: 147,
          stepsPerBeat: 4,
          beatsPerLoop: 4,
          kit: "minimal",
          pattern:
            "1000100010001000_0000100000001000_1010101000101010_0000000010000000",
          swing: 0.27,
        },
        preset!,
      ),
    ).toEqual({
      bpm: 147,
      stepsPerBeat: 3,
      beatsPerLoop: 4,
      kit: "bass-fourths",
      pattern: "100000100000_010001010000_001010001000_000100000100",
      swing: 0.27,
    });
  });

  it("diatonic note preset でも 7 track pattern を正規化して差し替える", () => {
    const preset = PATTERN_PRESETS.find((item) => item.id === "diatonic-notes-c-major-cascade");

    expect(preset).toBeDefined();
    expect(
      applyPatternPreset(
        {
          bpm: 124,
          stepsPerBeat: 4,
          beatsPerLoop: 4,
          kit: "minimal",
          pattern:
            "1000100010001000_0000100000001000_1010101000101010_0000000010000000",
          swing: 0.12,
        },
        preset!,
      ),
    ).toEqual({
      bpm: 124,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "diatonic-notes-c-major",
      pattern:
        "0000000000100000_0000001000000000_0010000000000000_0000000000001000_0000000010000000_0000100000000000_1000000000000000",
      swing: 0.12,
    });
  });

  it("diatonic triad preset でも 7 track pattern を正規化して差し替える", () => {
    const preset = PATTERN_PRESETS.find((item) => item.id === "diatonic-triads-c-major-cadence");

    expect(preset).toBeDefined();
    expect(
      applyPatternPreset(
        {
          bpm: 118,
          stepsPerBeat: 4,
          beatsPerLoop: 4,
          kit: "minimal",
          pattern:
            "1000100010001000_0000100000001000_1010101000101010_0000000010000000",
          swing: 0.05,
        },
        preset!,
      ),
    ).toEqual({
      bpm: 118,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "diatonic-triads-c-major",
      pattern:
        "0000000000000000_0000000000000000_0010000000000000_0000000010000000_0000000000001000_0000100000000000_1000000000000000",
      swing: 0.05,
    });
  });
});
