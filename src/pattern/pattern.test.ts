import { describe, expect, it } from "vitest";
import {
  createEmptyPattern,
  extendPatternWithRepeat,
  extendTrackWithRepeat,
  resamplePatternByBeat,
  resampleTrackByBeat,
  splitPatternTracks,
  togglePatternStep,
} from "./pattern";

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

describe("extendPatternWithRepeat", () => {
  it("単一trackの繰り返し拡張を行う", () => {
    expect(extendTrackWithRepeat("1010", 4, 10)).toBe("1010101010");
  });

  it("増やさないときは単一trackをその長さへ切り詰める", () => {
    expect(extendTrackWithRepeat("10101010", 8, 4)).toBe("1010");
  });

  it("beatsPerLoop を増やすと既存 loop を繰り返して拡張する", () => {
    expect(
      extendPatternWithRepeat(
        "1000100010001000_0000100000001000_1010101000101010_0000000010000000",
        {
          kit: "minimal",
          stepsPerBeat: 4,
          fromBeatsPerLoop: 4,
          toBeatsPerLoop: 8,
        },
      ),
    ).toBe(
      "10001000100010001000100010001000_00001000000010000000100000001000_10101010001010101010101000101010_00000000100000000000000010000000",
    );
  });

  it("beatsPerLoop を増やさないときは通常正規化だけ行う", () => {
    expect(
      extendPatternWithRepeat("10_01", {
        kit: "minimal",
        stepsPerBeat: 4,
        fromBeatsPerLoop: 4,
        toBeatsPerLoop: 2,
      }),
    ).toBe("10000000_01000000_00000000_00000000");
  });
});

describe("resamplePatternByBeat", () => {
  it("単一trackを beat 基準で再配置する", () => {
    expect(resampleTrackByBeat("0101", 4, 8, 1)).toBe("00100010");
  });

  it("単一trackで衝突は 1 に集約する", () => {
    expect(resampleTrackByBeat("00101000", 8, 4, 1)).toBe("0110");
  });

  it("単一trackで最後の step は clamp される", () => {
    expect(resampleTrackByBeat("0001", 4, 3, 1)).toBe("001");
  });

  it("pattern 全体では各trackへ再配置を適用して join する", () => {
    expect(
      resamplePatternByBeat("0101_0000_0000_0000", {
        kit: "minimal",
        fromStepsPerBeat: 4,
        toStepsPerBeat: 8,
        beatsPerLoop: 1,
      }),
    ).toBe("00100010_00000000_00000000_00000000");
  });
});
