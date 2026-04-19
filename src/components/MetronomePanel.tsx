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
    audioEnabled,
    audioStatus,
    metronomeMuted,
    enableAudio,
    toggleMetronomeMuted,
  } = useMetronomeEngine({
    bpm,
    stepsPerBeat,
    swing,
    isPlaying,
    playbackOffsetMs,
  });

  async function handlePlay() {
    start();
    await enableAudio();
  }

  async function handleEnableAudio() {
    await enableAudio();
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
    <>
      <div className="header">
        <div>
          <p className="eyebrow">Phase 0</p>
          <h1>Autonomous Clock Metronome</h1>
        </div>
        <StatusBadge isPlaying={isPlaying} audioStatus={audioStatus} />
      </div>

      <div className="transport-row">
        <button className="primary" onClick={handlePlay} disabled={isPlaying}>
          再生
        </button>
        <button
          onClick={handleEnableAudio}
          disabled={!isPlaying || audioEnabled || audioStatus === "starting"}
        >
          音声を準備
        </button>
        <button onClick={toggleMetronomeMuted} disabled={!isPlaying}>
          {metronomeMuted ? "メトロノーム音を戻す" : "メトロノーム音をミュート"}
        </button>
        <button onClick={handleStop}>停止</button>
      </div>

      <div className="controls">
        <label>
          <span>BPM</span>
          <input
            type="number"
            min="20"
            max="300"
            step="1"
            value={bpm}
            onChange={handleBpmChange}
          />
        </label>

        <label>
          <span>stepsPerBeat</span>
          <input
            type="number"
            min="1"
            max="16"
            step="1"
            value={stepsPerBeat}
            onChange={handleStepsPerBeatChange}
          />
        </label>

        <label>
          <span>swing</span>
          <input
            type="number"
            min="0"
            max="0.95"
            step="0.05"
            value={swing}
            onChange={handleSwingChange}
          />
        </label>
      </div>

      <div className="position-grid">
        <Readout
          label="elapsed"
          value={`${(position.elapsedMs / secondsToMs(1)).toFixed(2)}s`}
        />
        <Readout label="beat" value={String(position.beat)} />
        <Readout label="step" value={String(position.step)} />
        <Readout label="stepInBeat" value={String(position.stepInBeat)} />
        <Readout label="stepInLoop" value={String(position.stepInLoop)} />
      </div>

      <div className="url-box">
        <span>URL</span>
        <code>{currentUrl}</code>
      </div>
    </>
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
  return <span className={`status status-${label}`}>{label}</span>;
}
