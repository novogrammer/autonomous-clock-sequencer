import { useEffect, useRef, useState } from "react";
import { DelayTestEngine } from "../engine/delayTestEngine";
import {
  DELAY_PRESETS_MS,
  useDelayTestStore,
} from "../state/delayTestStore";

type DelayTestAudioStatus = "idle" | "starting" | "ready" | "blocked";

export function DelayTestPanel() {
  const { delayMs, isLooping, setDelayMs, setLooping } = useDelayTestStore();
  const engineRef = useRef<DelayTestEngine | null>(null);
  const [audioStatus, setAudioStatus] =
    useState<DelayTestAudioStatus>("idle");

  useEffect(() => {
    engineRef.current = new DelayTestEngine();

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isLooping) {
      return;
    }

    void startLoop(delayMs);
  }, [delayMs, isLooping]);

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

  async function startLoop(currentDelayMs = delayMs) {
    setAudioStatus("starting");

    try {
      await engineRef.current?.startLoop(currentDelayMs);
      setLooping(true);
      setAudioStatus("ready");
    } catch (error) {
      console.error(error);
      setLooping(false);
      setAudioStatus("blocked");
    }
  }

  function stopLoop() {
    engineRef.current?.stop();
    setLooping(false);
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
          onClick={() => void startLoop()}
          disabled={isLooping}
        >
          連続再生
        </button>
        <button onClick={stopLoop} disabled={!isLooping}>
          停止
        </button>
      </div>
    </section>
  );
}
