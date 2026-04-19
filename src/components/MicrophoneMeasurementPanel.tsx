import { useState } from "react";
import { useMicrophoneMeasurementEngine } from "../hooks/useMicrophoneMeasurementEngine";

const DEFAULT_FREQUENCY_A_HZ = 1500;
const DEFAULT_FREQUENCY_B_HZ = 2500;

export function MicrophoneMeasurementPanel() {
  const [frequencyAHz, setFrequencyAHz] = useState(DEFAULT_FREQUENCY_A_HZ);
  const [frequencyBHz, setFrequencyBHz] = useState(DEFAULT_FREQUENCY_B_HZ);
  const {
    status,
    clickCounts,
    results,
    latestResult,
    stats,
    startMeasurement,
    stopMeasurement,
  } = useMicrophoneMeasurementEngine({ frequencyAHz, frequencyBHz });

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
