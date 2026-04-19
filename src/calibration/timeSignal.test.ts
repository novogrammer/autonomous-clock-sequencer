import { describe, expect, it } from "vitest";
import { getTimeSignalFlashState } from "./timeSignal";

describe("timeSignal", () => {
  it("10秒境界の先頭120msをboundaryにする", () => {
    expect(getTimeSignalFlashState(10_000)).toBe("boundary");
    expect(getTimeSignalFlashState(10_119)).toBe("boundary");
  });

  it("10秒境界以外の先頭120msをsecondにする", () => {
    expect(getTimeSignalFlashState(11_000)).toBe("second");
    expect(getTimeSignalFlashState(11_119)).toBe("second");
  });

  it("各秒の120ms以降をidleにする", () => {
    expect(getTimeSignalFlashState(10_120)).toBe("idle");
    expect(getTimeSignalFlashState(11_120)).toBe("idle");
  });
});
