import { useEffect, useRef, useState } from "react";
import { PlaybackCalibrationEngine } from "../engine/playbackCalibrationEngine";
import { usePlaybackCalibrationRuntimeStore } from "../state/playbackCalibrationRuntimeStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";

type PlaybackCalibrationAudioStatus = "idle" | "starting" | "ready" | "blocked";

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
  const engineRef = useRef<PlaybackCalibrationEngine | null>(null);
  const [audioStatus, setAudioStatus] =
    useState<PlaybackCalibrationAudioStatus>("idle");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    engineRef.current = new PlaybackCalibrationEngine();

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 50);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!isCalibrating) {
      return;
    }

    let isActive = true;
    setAudioStatus("starting");

    engineRef.current
      ?.startCalibration(playbackOffsetMs, clickFrequencyHz)
      .then(() => {
        if (isActive) {
          setAudioStatus("ready");
        }
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isActive) {
          setCalibrating(false);
          setAudioStatus("blocked");
        }
      });

    return () => {
      isActive = false;
    };
  }, [clickFrequencyHz, isCalibrating, playbackOffsetMs, setCalibrating]);

  function stopCalibration() {
    engineRef.current?.stop();
    setCalibrating(false);
    setAudioStatus("idle");
  }

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
          <Readout label="raw time" value={formatLocalTime(nowMs)} />
          <Readout
            label="offset time"
            value={formatLocalTime(nowMs + playbackOffsetMs)}
          />
        </div>

        <div className="transport-row">
          <button
            className="primary"
            onClick={() => setCalibrating(true)}
            disabled={isCalibrating}
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

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="readout">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
