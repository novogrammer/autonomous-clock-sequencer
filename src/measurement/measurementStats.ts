import type { MeasurementResult } from "../engine/microphoneMeasurementEngine";

export type MeasurementStats = {
  averageText: string;
  stdDevText: string;
};

export function calculateMeasurementStats(
  results: MeasurementResult[],
): MeasurementStats {
  if (results.length === 0) {
    return { averageText: "-", stdDevText: "-" };
  }

  const values = results.map((result) => result.skewMs);
  const average =
    values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - average) ** 2, 0) /
    values.length;

  return {
    averageText: `${average.toFixed(1)}ms`,
    stdDevText: `${Math.sqrt(variance).toFixed(1)}ms`,
  };
}
