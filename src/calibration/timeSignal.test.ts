import { describe, expect, it } from "vitest";
import { secondsToMs } from "../clock/clock";
import { getTimeSignalFlashState } from "./timeSignal";

describe("timeSignal", () => {
  it("10秒境界の先頭120msをboundaryにする", () => {
    expect(getTimeSignalFlashState(secondsToMs(10))).toBe("boundary");
    expect(getTimeSignalFlashState(secondsToMs(10.119))).toBe("boundary");
  });

  it("10秒境界以外の先頭120msをsecondにする", () => {
    expect(getTimeSignalFlashState(secondsToMs(11))).toBe("second");
    expect(getTimeSignalFlashState(secondsToMs(11.119))).toBe("second");
  });

  it("各秒の120ms以降をidleにする", () => {
    expect(getTimeSignalFlashState(secondsToMs(10.12))).toBe("idle");
    expect(getTimeSignalFlashState(secondsToMs(11.12))).toBe("idle");
  });
});
