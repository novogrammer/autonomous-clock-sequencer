import type { ChangeEvent } from "react";
import {
  formatLocalTime,
  getTimeSignalFlashState,
} from "../calibration/timeSignal";
import { useCurrentNowMs } from "../hooks/useCurrentNowMs";
import { usePlaybackCalibrationEngine } from "../hooks/usePlaybackCalibrationEngine";
import { usePlaybackCalibrationRuntimeStore } from "../state/playbackCalibrationRuntimeStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";
import { Readout } from "./Readout";

const PLAYBACK_OFFSET_STEPS_MS = [
  -1000,
  -100,
  -10,
  -1,
  1,
  10,
  100,
  1000,
] as const;
const CLICK_FREQUENCY_PRESETS_HZ = [1500, 2000, 2500, 3000] as const;

export function PlaybackCalibrationPanel() {
  const {
    clickFrequencyHz,
    isCalibrating,
    setClickFrequencyHz,
    setCalibrating,
  } =
    usePlaybackCalibrationRuntimeStore();
  const {
    playbackOffsetMs,
    isPlaybackOffsetStored,
    setPlaybackOffsetMs,
    resetPlaybackOffsetMs,
  } =
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

  function handlePlaybackOffsetChange(event: ChangeEvent<HTMLInputElement>) {
    setPlaybackOffsetMs(Number(event.target.value));
  }

  function handleClickFrequencyChange(event: ChangeEvent<HTMLInputElement>) {
    setClickFrequencyHz(Number(event.target.value));
  }

  return (
    <section className="playback-calibration">
      <div className="section-header">
        <div>
          <p className="eyebrow">Playback</p>
          <h3>Playback calibration</h3>
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
              onChange={handlePlaybackOffsetChange}
            />
          </label>

          <div className="storage-control">
            <div className="storage-status">
              <span>localStorage</span>
              <strong>{isPlaybackOffsetStored ? "保持中" : "未保存"}</strong>
            </div>
            <button onClick={resetPlaybackOffsetMs}>リセット</button>
          </div>

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
              onChange={handleClickFrequencyChange}
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
