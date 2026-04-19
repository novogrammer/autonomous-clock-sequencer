import { useEffect, useMemo, useRef, useState } from "react";
import {
  MicrophoneMeasurementEngine,
  type MeasurementClickEvent,
  type MeasurementResult,
} from "../engine/microphoneMeasurementEngine";
import {
  calculateMeasurementStats,
  type MeasurementStats,
} from "../measurement/measurementStats";

export type MeasurementStatus = "idle" | "starting" | "ready" | "blocked";

type ClickCounts = {
  a: number;
  b: number;
};

type MicrophoneMeasurementEngineParams = {
  frequencyAHz: number;
  frequencyBHz: number;
};

type MicrophoneMeasurementEngineControls = {
  status: MeasurementStatus;
  clickCounts: ClickCounts;
  results: MeasurementResult[];
  latestResult: MeasurementResult | null;
  stats: MeasurementStats;
  startMeasurement: () => Promise<void>;
  stopMeasurement: () => void;
};

const MAX_RESULTS = 12;

export function useMicrophoneMeasurementEngine({
  frequencyAHz,
  frequencyBHz,
}: MicrophoneMeasurementEngineParams): MicrophoneMeasurementEngineControls {
  const engineRef = useRef<MicrophoneMeasurementEngine | null>(null);
  const [status, setStatus] = useState<MeasurementStatus>("idle");
  const [clickCounts, setClickCounts] = useState<ClickCounts>({ a: 0, b: 0 });
  const [results, setResults] = useState<MeasurementResult[]>([]);
  const stats = useMemo(() => calculateMeasurementStats(results), [results]);
  const latestResult = results[0] ?? null;

  useEffect(() => {
    engineRef.current = new MicrophoneMeasurementEngine();

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  async function startMeasurement(): Promise<void> {
    setStatus("starting");
    setClickCounts({ a: 0, b: 0 });
    setResults([]);

    try {
      await engineRef.current?.start({
        frequencyAHz,
        frequencyBHz,
        onClick: handleClick,
        onResult: handleResult,
      });
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("blocked");
    }
  }

  function stopMeasurement(): void {
    engineRef.current?.stop();
    setStatus("idle");
  }

  function handleClick(event: MeasurementClickEvent): void {
    setClickCounts((counts) => ({
      ...counts,
      [event.target]: counts[event.target] + 1,
    }));
  }

  function handleResult(result: MeasurementResult): void {
    setResults((currentResults) =>
      [result, ...currentResults].slice(0, MAX_RESULTS),
    );
  }

  return {
    status,
    clickCounts,
    results,
    latestResult,
    stats,
    startMeasurement,
    stopMeasurement,
  };
}
