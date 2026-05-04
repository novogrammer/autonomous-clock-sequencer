import { useEffect, useState, type ChangeEvent, type MouseEvent } from "react";
import { toDataURL } from "qrcode";
import { secondsToMs } from "../clock/clock";
import {
  useSequencerEngine, type AudioStatus
} from "../hooks/useSequencerEngine";
import { useSequencerPosition } from "../hooks/useSequencerPosition";
import { KIT_IDS, getKitTracks } from "../kit/kits";
import {
  createEmptyPattern,
  splitPatternTracks,
  togglePatternStep,
} from "../pattern/pattern";
import {
  DEFAULT_SHARED_SCORES_HASHTAG,
  EXAMPLE_SCORES,
  PATTERN_PRESETS,
  SHARED_SCORES_LINKS,
  applyPatternPreset,
} from "../score/scoreCatalog";
import { useSequencerUrlSync } from "../hooks/useSequencerUrlSync";
import { useSequencerStore } from "../state/sequencerStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";
import { buildSequencerUrl } from "../url/sequencerUrl";
import { Readout } from "./Readout";

export function SequencerPanel() {
  const [isClickEnabled, setClickEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
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
    setKit,
    setPattern,
    setSwing,
    loadExampleScore,
    loadPatternPreset,
    start,
    stop,
  } = useSequencerStore();
  const playbackOffsetMs = usePlaybackCalibrationStore(
    (state) => state.playbackOffsetMs,
  );
  const position = useSequencerPosition({
    bpm,
    stepsPerBeat,
    beatsPerLoop,
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

  function handleKitChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextKit = event.target.value;
    setKit(nextKit);
    setPattern(createEmptyPattern(nextKit, stepsPerBeat, beatsPerLoop));
  }

  function handleStepToggle(trackIndex: number, stepIndex: number) {
    setPattern(togglePatternStep(pattern, trackIndex, stepIndex));
  }

  function handleClearPattern() {
    setPattern(createEmptyPattern(kit, stepsPerBeat, beatsPerLoop));
  }

  function handleExampleScoreLinkClick(
    event: MouseEvent<HTMLAnchorElement>,
    exampleScoreId: string,
  ) {
    if (shouldKeepDefaultLinkBehavior(event)) {
      return;
    }

    const exampleScore = EXAMPLE_SCORES.find((item) => item.id === exampleScoreId);
    if (exampleScore === undefined) {
      return;
    }

    event.preventDefault();
    loadExampleScore(exampleScore);
  }

  function handlePatternPresetLinkClick(
    event: MouseEvent<HTMLAnchorElement>,
    patternPresetId: string,
  ) {
    if (shouldKeepDefaultLinkBehavior(event)) {
      return;
    }

    const patternPreset = PATTERN_PRESETS.find((item) => item.id === patternPresetId);
    if (patternPreset === undefined) {
      return;
    }

    event.preventDefault();
    loadPatternPreset(patternPreset);
  }

  function handleClickOn() {
    setClickEnabled(true);
  }

  function handleClickOff() {
    setClickEnabled(false);
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopyStatus("copied");
    } catch (error) {
      console.error(error);
      setCopyStatus("failed");
    }
  }

  const patternTracks = splitPatternTracks(pattern);
  const kitTracks = getKitTracks(kit);
  const loopLength = stepsPerBeat * beatsPerLoop;
  const presetsByKit = KIT_IDS.map((kitId) => ({
    kitId,
    presets: PATTERN_PRESETS.filter((preset) => preset.kit === kitId),
  })).filter((group) => group.presets.length > 0);
  const currentUrlState = {
    bpm,
    stepsPerBeat,
    beatsPerLoop,
    kit,
    pattern,
    swing,
  };

  useEffect(() => {
    let isActive = true;

    toDataURL(currentUrl, {
      width: 224,
      margin: 1,
      color: {
        dark: "#18202a",
        light: "#fffdf8",
      },
    })
      .then((nextUrl: string) => {
        if (isActive) {
          setQrCodeUrl(nextUrl);
        }
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isActive) {
          setQrCodeUrl("");
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentUrl]);

  return (
    <section className="p-sequencer">
      <div className="p-sequencer__header">
        <div>
          <p className="c-eyebrow">Sequencer</p>
          <h1 className="c-heading c-heading--1">Autonomous Clock Sequencer</h1>
        </div>
        <StatusBadge isPlaying={isPlaying} audioStatus={audioStatus} />
      </div>

      <div className="l-stack l-stack--subsection">
        <div className="c-action-row">
          <button
            className="c-button c-button--primary"
            onClick={handlePlay}
            disabled={isPlaying || audioStatus === "starting"}
          >
            Sound On
          </button>
          <button className="c-button" onClick={handleStop} disabled={!isPlaying}>
            Sound Off
          </button>
        </div>

        <div className="p-sequencer__subcontrol-row">
          <label className="c-checkbox">
            <input
              type="checkbox"
              checked={isClickEnabled}
              onChange={(event) => {
                if (event.target.checked) {
                  handleClickOn();
                  return;
                }

                handleClickOff();
              }}
            />
            <span>Enable metronome click</span>
          </label>
        </div>

        {!isPlaying ? (
          <div className="p-sequencer__start-hint" role="status" aria-live="polite">
            <strong>Press Sound On to hear the sequencer on this device.</strong>
            <span>Loading a score or preset only changes the shared state. Metronome is available while sound is on.</span>
          </div>
        ) : null}

        <details className="p-sequencer__catalog-section p-sequencer__catalog-details">
          <summary className="p-sequencer__catalog-summary">
            <span className="p-sequencer__summary-main">
              <span className="p-sequencer__summary-title">Example Scores</span>
              <span className="p-sequencer__summary-meta">
                {EXAMPLE_SCORES.length} scores
              </span>
            </span>
            <span className="p-sequencer__summary-hint">Toggle</span>
          </summary>
          <p className="p-sequencer__section-copy">
            まず試す譜面をここから呼び出せます。
          </p>
          <div className="p-sequencer__catalog-grid">
            {EXAMPLE_SCORES.map((exampleScore) => (
              <article className="c-detail-box p-sequencer__catalog-card" key={exampleScore.id}>
                <div className="p-sequencer__catalog-card-content">
                  <span className="c-detail-box__label">{exampleScore.state.kit}</span>
                  <strong className="p-sequencer__catalog-title">{exampleScore.name}</strong>
                  <p className="p-sequencer__catalog-copy">{exampleScore.description}</p>
                </div>
                <div className="p-sequencer__catalog-card-actions">
                  <a
                    className="c-button"
                    href={buildSequencerUrl(exampleScore.state)}
                    onClick={(event) => handleExampleScoreLinkClick(event, exampleScore.id)}
                  >
                    Open Score
                  </a>
                </div>
              </article>
            ))}
          </div>
        </details>

        <section className="p-sequencer__catalog-section">
          <div className="c-section-header">
            <div>
              <h2 className="c-heading c-heading--2">See Shared Scores</h2>
              <p className="p-sequencer__section-copy">
                {DEFAULT_SHARED_SCORES_HASHTAG} で外部の score URL を辿ります。
              </p>
            </div>
          </div>

          <div className="c-button-group">
            {SHARED_SCORES_LINKS.map((link) => (
              <a key={link.id} className="c-button" href={link.href} title={link.description}>
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <details className="p-sequencer__catalog-section p-sequencer__catalog-details">
          <summary className="p-sequencer__catalog-summary">
            <span className="p-sequencer__summary-main">
              <span className="p-sequencer__summary-title">Pattern Presets</span>
              <span className="p-sequencer__summary-meta">
                {PATTERN_PRESETS.length} presets
              </span>
            </span>
            <span className="p-sequencer__summary-hint">Toggle</span>
          </summary>
          <p className="p-sequencer__section-copy">
            BPM と swing は保ったまま、kit ごとの pattern 解釈だけを差し替えます。
          </p>
          <div className="p-sequencer__preset-groups">
            {presetsByKit.map((group) => (
              <details className="p-sequencer__preset-group" key={group.kitId}>
                <summary className="p-sequencer__preset-group-head">
                  <span className="p-sequencer__summary-main">
                    <span className="p-sequencer__preset-group-label">
                      <span className="c-detail-box__label">kit</span>
                      <strong>{group.kitId}</strong>
                    </span>
                    <span className="p-sequencer__summary-meta">
                      {group.presets.length} presets
                    </span>
                  </span>
                  <span className="p-sequencer__summary-hint">Toggle</span>
                </summary>
                <div className="p-sequencer__catalog-grid">
                  {group.presets.map((patternPreset) => (
                    <article
                      className="c-detail-box p-sequencer__catalog-card"
                      key={patternPreset.id}
                    >
                      <div className="p-sequencer__catalog-card-content">
                        <span className="c-detail-box__label">
                          {patternPreset.stepsPerBeat} steps/beat, {patternPreset.beatsPerLoop} beats
                        </span>
                        <strong className="p-sequencer__catalog-title">
                          {patternPreset.name}
                        </strong>
                        <p className="p-sequencer__catalog-copy">
                          {patternPreset.description}
                        </p>
                      </div>
                      <div className="p-sequencer__catalog-card-actions">
                        <a
                          className="c-button"
                          href={buildSequencerUrl(
                            applyPatternPreset(currentUrlState, patternPreset),
                          )}
                          onClick={(event) =>
                            handlePatternPresetLinkClick(event, patternPreset.id)
                          }
                        >
                          Open Preset
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </details>
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

        <label className="c-field">
          <span className="c-field__label">kit</span>
          <select className="c-input" value={kit} onChange={handleKitChange}>
            {KIT_IDS.map((kitId) => (
              <option key={kitId} value={kitId}>
                {kitId}
              </option>
            ))}
          </select>
        </label>

        <div className="c-detail-box c-detail-box--compact">
          <span className="c-detail-box__label">loopLength</span>
          <strong className="c-detail-box__value">{loopLength} steps</strong>
        </div>

        <div className="c-action-row p-sequencer__field-action">
          <span className="c-field__label">Pattern</span>
          <button className="c-button" onClick={handleClearPattern}>
            Clear Pattern
          </button>
        </div>
      </div>

      <div className="p-sequencer__sequencer">
        <div className="p-sequencer__track-labels">
          {kitTracks.map((track) => (
            <div className="p-sequencer__track-label" key={track.id}>
              {track.label}
            </div>
          ))}
        </div>

        <div className="p-sequencer__track-grid">
          {kitTracks.map((track, trackIndex) => (
            <div className="p-sequencer__track-steps" key={track.id}>
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
          ))}
        </div>
      </div>

      <details className="p-sequencer__transport-details">
        <summary className="p-sequencer__transport-summary">
          Transport Details
        </summary>
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
      </details>

      <section className="p-sequencer__share-section">
        <div className="c-section-header">
          <div>
            <h2 className="c-heading c-heading--2">Share</h2>
          </div>
        </div>

        <div className="p-sequencer__share">
          <div className="c-detail-box">
            <span className="c-detail-box__label">URL</span>
            <code className="c-detail-box__value">{currentUrl}</code>
            <div className="p-sequencer__share-actions">
              <button className="c-button" onClick={handleCopyUrl}>
                Copy URL
              </button>
              {copyStatus === "copied" ? (
                <span className="p-sequencer__share-status">Copied</span>
              ) : null}
              {copyStatus === "failed" ? (
                <span className="p-sequencer__share-status">Copy failed</span>
              ) : null}
            </div>
          </div>

          <div className="c-detail-box p-sequencer__qr-box">
            <span className="c-detail-box__label">QR Code</span>
            {qrCodeUrl === "" ? (
              <span className="c-detail-box__value">QR unavailable</span>
            ) : (
              <img
                className="p-sequencer__qr-image"
                src={qrCodeUrl}
                alt="Shared sequencer URL QR code"
              />
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

function shouldKeepDefaultLinkBehavior(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
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
