import { describe, expect, it } from "vitest";
import { createEmptyPattern, splitPatternTracks, togglePatternStep } from "./pattern";

describe("createEmptyPattern", () => {
  it("kitとloop長に応じた空patternを返す", () => {
    expect(createEmptyPattern("minimal", 4, 2)).toBe(
      "00000000_00000000_00000000_00000000",
    );
  });
});

describe("togglePatternStep", () => {
  it("指定stepを0から1へ切り替える", () => {
    expect(togglePatternStep("0000_0000", 1, 2)).toBe("0000_0010");
  });

  it("指定stepを1から0へ切り替える", () => {
    expect(togglePatternStep("0000_1010", 1, 2)).toBe("0000_1000");
  });

  it("範囲外なら元のpatternを返す", () => {
    expect(togglePatternStep("0000_0000", 3, 1)).toBe("0000_0000");
    expect(togglePatternStep("0000_0000", 1, 99)).toBe("0000_0000");
  });
});

describe("splitPatternTracks", () => {
  it("trackごとに分解する", () => {
    expect(splitPatternTracks("1010_0101_0000")).toEqual([
      "1010",
      "0101",
      "0000",
    ]);
  });
});
