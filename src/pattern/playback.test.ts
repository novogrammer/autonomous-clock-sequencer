import { describe, expect, it } from "vitest";
import { getActiveTrackIdsAtStep } from "./playback";

describe("getActiveTrackIdsAtStep", () => {
  it("指定stepで有効なtrack idを返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "1000_0100_0010_0001",
        0,
      ),
    ).toEqual(["kick"]);
    expect(
      getActiveTrackIdsAtStep(
        "1000_0100_0010_0001",
        1,
      ),
    ).toEqual(["snare"]);
  });

  it("同じstepで複数trackが有効ならすべて返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "1000_1000_1000_1000",
        0,
      ),
    ).toEqual(["kick", "snare", "closedHat", "openHat"]);
  });

  it("無効なら空配列を返す", () => {
    expect(
      getActiveTrackIdsAtStep(
        "0000_0000_0000_0000",
        2,
      ),
    ).toEqual([]);
  });
});
