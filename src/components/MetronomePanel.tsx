import type { ChangeEvent } from "react";
import { secondsToMs } from "../clock/clock";
import {
  useMetronomeEngine,
  type AudioStatus,
} from "../hooks/useMetronomeEngine";
import { useMetronomePosition } from "../hooks/useMetronomePosition";
import { useMetronomeUrlSync } from "../hooks/useMetronomeUrlSync";
import { useMetronomeStore } from "../state/metronomeStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";
import { Readout } from "./Readout";

export function MetronomePanel() {
  const {
    bpm,
    stepsPerBeat,
    swing,
    isPlaying,
    setBpm,
    setStepsPerBeat,
    setSwing,
    start,
    stop,
  } = useMetronomeStore();
  const playbackOffsetMs = usePlaybackCalibrationStore(
    (state) => state.playbackOffsetMs,
  );
  const position = useMetronomePosition({
    bpm,
    stepsPerBeat,
    swing,
    playbackOffsetMs,
  });
  const currentUrl = useMetronomeUrlSync({
    bpm,
    stepsPerBeat,
    swing,
  });
  const {
    audioStatus,
    enableAudio,
  } = useMetronomeEngine({
    bpm,
    stepsPerBeat,
    swing,
    isPlaying,
    playbackOffsetMs,
  });

  async function handlePlay() {
    const audioReady = await enableAudio();
    if (audioReady) {
      start();
    }
  }

  function handleStop() {
    stop();
  }

  function handleBpmChange(event: ChangeEvent<HTMLInputElement>) {
    setBpm(Number(event.target.value));
  }

  function handleStepsPerBeatChange(event: ChangeEvent<HTMLInputElement>) {
    setStepsPerBeat(Number(event.target.value));
  }

  function handleSwingChange(event: ChangeEvent<HTMLInputElement>) {
    setSwing(Number(event.target.value));
  }

  return (
    <section className="p-metronome">
      <div className="p-metronome__header">
        <div>
          <p className="c-eyebrow">Phase 0</p>
          <h1 className="c-heading c-heading--1">Autonomous Clock Metronome</h1>
        </div>
        <StatusBadge isPlaying={isPlaying} audioStatus={audioStatus} />
      </div>

      <div className="c-action-row">
        <button
          className="c-button c-button--primary"
          onClick={handlePlay}
          disabled={isPlaying || audioStatus === "starting"}
        >
          再生
        </button>
        <button className="c-button" onClick={handleStop}>停止</button>
      </div>

      <div className="l-grid l-grid--columns-3 l-grid--gap-l l-grid--section">
        <label className="c-field">
          <span className="c-field__label">BPM</span>
          <input
            className="c-input"
            type="number"
            min="20"
            max="300"
            step="1"
            value={bpm}
            onChange={handleBpmChange}
          />
        </label>

        <label className="c-field">
          <span className="c-field__label">stepsPerBeat</span>
          <input
            className="c-input"
            type="number"
            min="1"
            max="16"
            step="1"
            value={stepsPerBeat}
            onChange={handleStepsPerBeatChange}
          />
        </label>

        <label className="c-field">
          <span className="c-field__label">swing</span>
          <input
            className="c-input"
            type="number"
            min="0"
            max="0.95"
            step="0.05"
            value={swing}
            onChange={handleSwingChange}
          />
        </label>
      </div>

      <div className="l-grid l-grid--columns-3 l-grid--gap-m l-grid--section">
        <Readout
          label="elapsed"
          value={`${(position.elapsedMs / secondsToMs(1)).toFixed(2)}s`}
        />
        <Readout label="beat" value={String(position.beat)} />
        <Readout label="step" value={String(position.step)} />
        <Readout label="stepInBeat" value={String(position.stepInBeat)} />
        <Readout label="stepInLoop" value={String(position.stepInLoop)} />
      </div>

      <div className="c-detail-box">
        <span className="c-detail-box__label">URL</span>
        <code className="c-detail-box__value">{currentUrl}</code>
      </div>
    </section>
  );
}

function StatusBadge({
  isPlaying,
  audioStatus,
}: {
  isPlaying: boolean;
  audioStatus: AudioStatus;
}) {
  const label = isPlaying ? audioStatus : "stopped";
  return <span className={`c-status c-status--${label}`}>{label}</span>;
}
