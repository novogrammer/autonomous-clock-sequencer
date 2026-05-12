import { describe, expect, it } from "vitest";
import { getActiveTrackIdsAtStep } from "./playback";

describe("getActiveTrackIdsAtStep", () => {
  it("指定stepで有効なtrack idを返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "minimal",
        "1000_0100_0010_0001",
        0,
      ),
    ).toEqual(["kick"]);
    expect(
      getActiveTrackIdsAtStep(
        "minimal",
        "1000_0100_0010_0001",
        1,
      ),
    ).toEqual(["snare"]);
  });

  it("同じstepで複数trackが有効ならすべて返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "minimal",
        "1000_1000_1000_1000",
        0,
      ),
    ).toEqual(["kick", "snare", "closedHat", "openHat"]);
  });

  it("bass-fourths ではkit順で有効track idを返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "bass-fourths",
        "1000_0100_0010_0001",
        2,
      ),
    ).toEqual(["f2"]);
  });

  it("diatonic note kit でもkit順で有効track idを返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "diatonic-notes-c-major",
        "0001_0001_0001_0001_0000_0000_0000",
        3,
      ),
    ).toEqual(["b4", "a4", "g4", "f4"]);
  });

  it("無効なら空配列を返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "minimal",
        "0000_0000_0000_0000",
        2,
      ),
    ).toEqual([]);
  });
});
