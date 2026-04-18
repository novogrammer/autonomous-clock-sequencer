import { useEffect, useMemo, useRef, useState } from "react";
import {
  MicrophoneMeasurementEngine,
  type MeasurementClickEvent,
  type MeasurementResult,
} from "../engine/microphoneMeasurementEngine";

type MeasurementStatus = "idle" | "starting" | "ready" | "blocked";

const DEFAULT_FREQUENCY_A_HZ = 1500;
const DEFAULT_FREQUENCY_B_HZ = 2500;
const MAX_RESULTS = 12;

export function MicrophoneMeasurementPanel() {
  const engineRef = useRef<MicrophoneMeasurementEngine | null>(null);
  const [status, setStatus] = useState<MeasurementStatus>("idle");
  const [frequencyAHz, setFrequencyAHz] = useState(DEFAULT_FREQUENCY_A_HZ);
  const [frequencyBHz, setFrequencyBHz] = useState(DEFAULT_FREQUENCY_B_HZ);
  const [clickCounts, setClickCounts] = useState({ a: 0, b: 0 });
  const [results, setResults] = useState<MeasurementResult[]>([]);

  const stats = useMemo(() => calculateStats(results), [results]);
  const latestResult = results[0] ?? null;

  useEffect(() => {
    engineRef.current = new MicrophoneMeasurementEngine();

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  async function startMeasurement() {
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

  function stopMeasurement() {
    engineRef.current?.stop();
    setStatus("idle");
  }

  function handleClick(event: MeasurementClickEvent) {
    setClickCounts((counts) => ({
      ...counts,
      [event.target]: counts[event.target] + 1,
    }));
  }

  function handleResult(result: MeasurementResult) {
    setResults((currentResults) => [result, ...currentResults].slice(0, MAX_RESULTS));
  }

  return (
    <section className="microphone-measurement">
      <div className="section-header">
        <div>
          <p className="eyebrow">Measurement</p>
          <h2>Microphone measurement</h2>
        </div>
        <span className={`status status-${status}`}>{status}</span>
      </div>

      <div className="measurement-panel">
        <div className="controls measurement-controls">
          <label>
            <span>device A Hz</span>
            <input
              type="number"
              min="800"
              max="4000"
              step="100"
              value={frequencyAHz}
              disabled={status === "ready" || status === "starting"}
              onChange={(event) => setFrequencyAHz(Number(event.target.value))}
            />
          </label>

          <label>
            <span>device B Hz</span>
            <input
              type="number"
              min="800"
              max="4000"
              step="100"
              value={frequencyBHz}
              disabled={status === "ready" || status === "starting"}
              onChange={(event) => setFrequencyBHz(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="measurement-grid">
          <Readout
            label="latest A-B"
            value={latestResult === null ? "-" : `${latestResult.skewMs.toFixed(1)}ms`}
          />
          <Readout label="average" value={stats.averageText} />
          <Readout label="stddev" value={stats.stdDevText} />
          <Readout label="samples" value={String(results.length)} />
          <Readout label="A clicks" value={String(clickCounts.a)} />
          <Readout label="B clicks" value={String(clickCounts.b)} />
        </div>

        <div className="transport-row">
          <button
            className="primary"
            onClick={startMeasurement}
            disabled={status === "ready" || status === "starting"}
          >
            測定開始
          </button>
          <button onClick={stopMeasurement} disabled={status !== "ready"}>
            停止
          </button>
        </div>
      </div>
    </section>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="readout">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function calculateStats(results: MeasurementResult[]): {
  averageText: string;
  stdDevText: string;
} {
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
