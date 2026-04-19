import { useCurrentNowMs } from "../hooks/useCurrentNowMs";
import { usePlaybackCalibrationEngine } from "../hooks/usePlaybackCalibrationEngine";
import { usePlaybackCalibrationRuntimeStore } from "../state/playbackCalibrationRuntimeStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";
import { Readout } from "./Readout";

const PLAYBACK_OFFSET_STEPS_MS = [-1000, -100, -10, -1, 1, 10, 100, 1000] as const;
const CLICK_FREQUENCY_PRESETS_HZ = [1500, 2000, 2500, 3000] as const;

export function PlaybackCalibrationPanel() {
  const {
    clickFrequencyHz,
    isCalibrating,
    setClickFrequencyHz,
    setCalibrating,
  } =
    usePlaybackCalibrationRuntimeStore();
  const { playbackOffsetMs, setPlaybackOffsetMs } =
    usePlaybackCalibrationStore();
  const currentNowMs = useCurrentNowMs();
  const { audioStatus, startCalibration, stopCalibration } =
    usePlaybackCalibrationEngine({
      playbackOffsetMs,
      clickFrequencyHz,
      isCalibrating,
      setCalibrating,
    });

  const flashState = getTimeSignalFlashState(currentNowMs + playbackOffsetMs);

  return (
    <section className="playback-calibration">
      <div className="section-header">
        <div>
          <p className="eyebrow">Calibration</p>
          <h2>Playback calibration</h2>
        </div>
        <span className={`status status-${audioStatus}`}>{audioStatus}</span>
      </div>

      <div className="calibration-panel">
        <div className="controls calibration-controls">
          <label>
            <span>playbackOffsetMs</span>
            <input
              type="number"
              min="-10000"
              max="10000"
              step="1"
              value={playbackOffsetMs}
              onChange={(event) =>
                setPlaybackOffsetMs(Number(event.target.value))
              }
            />
          </label>

          <div className="offset-step-row" aria-label="Playback offset steps">
            {PLAYBACK_OFFSET_STEPS_MS.map((step) => (
              <button
                key={step}
                onClick={() => setPlaybackOffsetMs(playbackOffsetMs + step)}
              >
                {step > 0 ? `+${step}` : step}
              </button>
            ))}
          </div>

          <label>
            <span>clickFrequencyHz</span>
            <input
              type="number"
              min="800"
              max="4000"
              step="100"
              value={clickFrequencyHz}
              onChange={(event) =>
                setClickFrequencyHz(Number(event.target.value))
              }
            />
          </label>

          <div className="frequency-preset-row" aria-label="Click frequency presets">
            {CLICK_FREQUENCY_PRESETS_HZ.map((frequencyHz) => (
              <button
                key={frequencyHz}
                className={frequencyHz === clickFrequencyHz ? "selected" : ""}
                onClick={() => setClickFrequencyHz(frequencyHz)}
              >
                {frequencyHz}
              </button>
            ))}
          </div>
        </div>

        <div className="time-readout">
          <Readout label="raw time" value={formatLocalTime(currentNowMs)} />
          <Readout
            label="offset time"
            value={formatLocalTime(currentNowMs + playbackOffsetMs)}
          />
        </div>

        <div
          className={`time-signal-flash time-signal-flash-${flashState}`}
          aria-label="Time signal visual indicator"
        />

        <div className="transport-row">
          <button
            className="primary"
            onClick={startCalibration}
            disabled={isCalibrating || audioStatus === "starting"}
          >
            時報開始
          </button>
          <button onClick={stopCalibration} disabled={!isCalibrating}>
            停止
          </button>
        </div>
      </div>
    </section>
  );
}

function formatLocalTime(nowMs: number): string {
  const date = new Date(nowMs);
  const time = date.toLocaleTimeString("ja-JP", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${time}.${milliseconds}`;
}

function getTimeSignalFlashState(nowMs: number): "idle" | "second" | "boundary" {
  const millisecond = Math.floor(nowMs % 1000);
  if (millisecond >= 120) {
    return "idle";
  }

  const second = Math.floor(nowMs / 1000);
  return second % 10 === 0 ? "boundary" : "second";
}
