import { useEffect, useRef, useState } from "react";
import { DelayTestEngine } from "../engine/delayTestEngine";
import {
  DELAY_PRESETS_MS,
  useDelayTestStore,
} from "../state/delayTestStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";

type DelayTestAudioStatus = "idle" | "starting" | "ready" | "blocked";

const PLAYBACK_OFFSET_STEPS_MS = [-1000, -100, -10, -1, 1, 10, 100, 1000] as const;

export function DelayTestPanel() {
  const {
    delayMs,
    isLooping,
    calibrationIntervalMs,
    isCalibrating,
    setDelayMs,
    setLooping,
    setCalibrationIntervalMs,
    setCalibrating,
  } = useDelayTestStore();
  const { playbackOffsetMs, setPlaybackOffsetMs } =
    usePlaybackCalibrationStore();
  const engineRef = useRef<DelayTestEngine | null>(null);
  const [audioStatus, setAudioStatus] =
    useState<DelayTestAudioStatus>("idle");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    engineRef.current = new DelayTestEngine();

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
    if (!isLooping) {
      return;
    }

    let isActive = true;
    setAudioStatus("starting");

    engineRef.current
      ?.startLoop(delayMs)
      .then(() => {
        if (isActive) {
          setAudioStatus("ready");
        }
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isActive) {
          setLooping(false);
          setAudioStatus("blocked");
        }
      });

    return () => {
      isActive = false;
    };
  }, [delayMs, isLooping, setLooping]);

  useEffect(() => {
    if (!isCalibrating) {
      return;
    }

    let isActive = true;
    setAudioStatus("starting");

    engineRef.current
      ?.startCalibration(playbackOffsetMs, calibrationIntervalMs)
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
  }, [
    calibrationIntervalMs,
    isCalibrating,
    playbackOffsetMs,
    setCalibrating,
  ]);

  async function playOnce() {
    setAudioStatus("starting");

    try {
      await engineRef.current?.playOnce(delayMs);
      setAudioStatus("ready");
    } catch (error) {
      console.error(error);
      setAudioStatus("blocked");
    }
  }

  function stopAll() {
    engineRef.current?.stop();
    setLooping(false);
    setCalibrating(false);
    setAudioStatus("idle");
  }

  return (
    <section className="delay-test">
      <div className="section-header">
        <div>
          <p className="eyebrow">Timing Test</p>
          <h2>Delay perception check</h2>
        </div>
        <span className={`status status-${audioStatus}`}>{audioStatus}</span>
      </div>

      <div className="controls delay-controls">
        <label>
          <span>delay ms</span>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={delayMs}
            onChange={(event) => setDelayMs(Number(event.target.value))}
          />
        </label>

        <div className="preset-row" aria-label="Delay presets">
          {DELAY_PRESETS_MS.map((preset) => (
            <button
              key={preset}
              className={preset === delayMs ? "selected" : ""}
              onClick={() => setDelayMs(preset)}
            >
              {preset} ms
            </button>
          ))}
        </div>
      </div>

      <div className="transport-row">
        <button onClick={playOnce}>単発再生</button>
        <button
          className="primary"
          onClick={() => setLooping(true)}
          disabled={isLooping}
        >
          連続再生
        </button>
        <button onClick={stopAll} disabled={!isLooping}>
          停止
        </button>
      </div>

      <div className="calibration-panel">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">Calibration</p>
            <h3>Calibration beep</h3>
          </div>
        </div>

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
            <span>interval ms</span>
            <input
              type="number"
              min="250"
              max="5000"
              step="250"
              value={calibrationIntervalMs}
              onChange={(event) =>
                setCalibrationIntervalMs(Number(event.target.value))
              }
            />
          </label>
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
          <button onClick={stopAll} disabled={!isLooping && !isCalibrating}>
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
