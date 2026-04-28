import { useState, type ChangeEvent } from "react";
import { secondsToMs } from "../clock/clock";
import {
  useSequencerEngine,
  type AudioStatus,
} from "../hooks/useSequencerEngine";
import { useSequencerPosition } from "../hooks/useSequencerPosition";
import { MINIMAL_KIT_TRACKS } from "../kit/minimalKit";
import {
  splitPatternTracks,
  togglePatternStep,
} from "../pattern/pattern";
import { useSequencerUrlSync } from "../hooks/useSequencerUrlSync";
import { useSequencerStore } from "../state/sequencerStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";
import { Readout } from "./Readout";

export function SequencerPanel() {
  const [isClickEnabled, setClickEnabled] = useState(false);
  const {
    bpm,
    stepsPerBeat,
    beatsPerLoop,
    kit,
    pattern,
    swing,
    isPlaying,
    setBpm,
    setStepsPerBeat,
    setBeatsPerLoop,
    setPattern,
    setSwing,
    start,
    stop,
  } = useSequencerStore();
  const playbackOffsetMs = usePlaybackCalibrationStore(
    (state) => state.playbackOffsetMs,
  );
  const position = useSequencerPosition({
    bpm,
    stepsPerBeat,
    swing,
    playbackOffsetMs,
  });
  const currentUrl = useSequencerUrlSync({
    bpm,
    stepsPerBeat,
    beatsPerLoop,
    kit,
    pattern,
    swing,
  });
  const {
    audioStatus,
    enableAudio,
  } = useSequencerEngine({
    bpm,
    stepsPerBeat,
    beatsPerLoop,
    kit,
    pattern,
    isClickEnabled,
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

  function handleBeatsPerLoopChange(event: ChangeEvent<HTMLInputElement>) {
    setBeatsPerLoop(Number(event.target.value));
  }

  function handleStepToggle(trackIndex: number, stepIndex: number) {
    setPattern(togglePatternStep(pattern, trackIndex, stepIndex));
  }

  function handleClickToggle() {
    setClickEnabled((current) => !current);
  }

  const patternTracks = splitPatternTracks(pattern);

  return (
    <section className="p-sequencer">
      <div className="p-sequencer__header">
        <div>
          <p className="c-eyebrow">Sequencer</p>
          <h1 className="c-heading c-heading--1">Autonomous Clock Sequencer</h1>
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
        <button className="c-button" onClick={handleClickToggle}>
          {isClickEnabled ? "click on" : "click off"}
        </button>
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

        <label className="c-field">
          <span className="c-field__label">beatsPerLoop</span>
          <input
            className="c-input"
            type="number"
            min="1"
            max="32"
            step="1"
            value={beatsPerLoop}
            onChange={handleBeatsPerLoopChange}
          />
        </label>

        <div className="c-detail-box c-detail-box--compact">
          <span className="c-detail-box__label">kit</span>
          <strong className="c-detail-box__value">{kit}</strong>
        </div>
      </div>

      <div className="p-sequencer__sequencer">
        {MINIMAL_KIT_TRACKS.map((track, trackIndex) => (
          <div className="p-sequencer__track" key={track.id}>
            <div className="p-sequencer__track-label">{track.label}</div>
            <div className="p-sequencer__track-steps">
              {(patternTracks[trackIndex] ?? "").split("").map((step, stepIndex) => (
                <button
                  key={`${track.id}-${stepIndex}`}
                  className={
                    [
                      "p-sequencer__step-button",
                      step === "1" ? "p-sequencer__step-button--active" : "",
                      stepIndex % stepsPerBeat === 0
                        ? "p-sequencer__step-button--beat-head"
                        : "",
                      stepIndex === position.stepInLoop
                        ? "p-sequencer__step-button--current"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                  onClick={() => handleStepToggle(trackIndex, stepIndex)}
                  aria-pressed={step === "1"}
                >
                  <span className="u-visually-hidden">
                    {track.label} step {stepIndex + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
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
