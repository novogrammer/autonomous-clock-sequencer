import { describe, expect, it } from "vitest";
import type { MeasurementResult } from "../engine/microphoneMeasurementEngine";
import { calculateMeasurementStats } from "./measurementStats";

describe("measurementStats", () => {
  it("結果がない場合は表示値をハイフンにする", () => {
    expect(calculateMeasurementStats([])).toEqual({
      averageText: "-",
      stdDevText: "-",
    });
  });

  it("平均を小数1桁のms表示にする", () => {
    expect(
      calculateMeasurementStats([
        createResult(-10),
        createResult(20),
        createResult(35),
      ]).averageText,
    ).toBe("15.0ms");
  });

  it("標準偏差を小数1桁のms表示にする", () => {
    expect(
      calculateMeasurementStats([
        createResult(10),
        createResult(20),
        createResult(30),
      ]).stdDevText,
    ).toBe("8.2ms");
  });
});

function createResult(skewMs: number): MeasurementResult {
  return {
    skewMs,
    eventA: {
      target: "a",
      frequencyHz: 1500,
      timeMs: 1000,
      power: 1,
    },
    eventB: {
      target: "b",
      frequencyHz: 2500,
      timeMs: 1000 - skewMs,
      power: 1,
    },
  };
}
