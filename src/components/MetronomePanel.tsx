import { useEffect, useMemo, useRef, useState } from "react";
import { nowMs, roundedNowMs } from "../clock/clock";
import {
  MetronomeEngine,
  unlockMetronomeAudio,
} from "../engine/metronomeEngine";
import { useMetronomeStore } from "../state/metronomeStore";
import { usePlaybackCalibrationStore } from "../state/playbackCalibrationStore";
import { calculatePosition, type TransportPosition } from "../transport/transport";
import { replaceUrlFromState } from "../url/phase0Url";

type UrlState = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
  startAt: number | null;
};

type AudioStatus = "idle" | "locked" | "starting" | "ready" | "blocked";

export function MetronomePanel() {
  const {
    bpm,
    stepsPerBeat,
    swing,
    startAt,
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
  const engineRef = useRef<MetronomeEngine | null>(null);
  const urlState = useMemo(
    () => ({ bpm, stepsPerBeat, swing, startAt }),
    [bpm, stepsPerBeat, swing, startAt],
  );
  const [position, setPosition] = useState<TransportPosition>(() =>
    calculatePosition(
      { bpm, stepsPerBeat, swing, startAt },
      nowMs() + playbackOffsetMs,
    ),
  );
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [metronomeMuted, setMetronomeMuted] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>(
    startAt === null ? "idle" : "locked",
  );
  const currentUrl = useCurrentUrl(urlState);

  const config = useMemo(
    () => ({ bpm, stepsPerBeat, swing, startAt }),
    [bpm, stepsPerBeat, swing, startAt],
  );
  const engineConfig = useMemo(
    () =>
      startAt === null
        ? null
        : {
            bpm,
            stepsPerBeat,
            swing,
            startAt,
            playbackOffsetMs,
            metronomeMuted,
          },
    [bpm, metronomeMuted, playbackOffsetMs, startAt, stepsPerBeat, swing],
  );
  const engineConfigRef = useRef<typeof engineConfig>(null);
  engineConfigRef.current = engineConfig;

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setPosition(calculatePosition(config, nowMs() + playbackOffsetMs));
    }, 50);

    return () => window.clearInterval(timerId);
  }, [config, playbackOffsetMs]);

  useEffect(() => {
    if (!isPlaying || startAt === null) {
      engineRef.current?.stop();
      setAudioStatus("idle");
      return;
    }

    if (!audioEnabled) {
      engineRef.current?.stop();
      setAudioStatus("locked");
      return;
    }

    const initialEngineConfig = engineConfigRef.current;
    if (initialEngineConfig === null) {
      return;
    }

    const engine = engineRef.current ?? new MetronomeEngine();
    engineRef.current = engine;
    let isActive = true;
    setAudioStatus("starting");
    engine
      .start(initialEngineConfig)
      .then(() => {
        if (isActive) {
          setAudioStatus("ready");
        }
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isActive) {
          setAudioEnabled(false);
          setAudioStatus("blocked");
        }
      });

    return () => {
      isActive = false;
      engine.stop();
    };
  }, [
    audioEnabled,
    isPlaying,
    startAt,
  ]);

  useEffect(() => {
    if (!isPlaying || !audioEnabled || engineConfig === null) {
      return;
    }

    engineRef.current?.update(engineConfig);
  }, [audioEnabled, engineConfig, isPlaying]);

  async function enableAudio() {
    setAudioStatus("starting");

    try {
      await unlockMetronomeAudio();
      setAudioEnabled(true);
    } catch (error) {
      console.error(error);
      setAudioEnabled(false);
      setAudioStatus("blocked");
    }
  }

  async function handlePlay() {
    start(roundedNowMs());
    await enableAudio();
  }

  async function handleEnableAudio() {
    await enableAudio();
  }

  function handleStop() {
    stop();
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
        <button
          onClick={() => setMetronomeMuted((isMuted) => !isMuted)}
          disabled={!isPlaying}
        >
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
            onChange={(event) =>
              setBpm(Number(event.target.value), nowMs())
            }
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
            onChange={(event) => setStepsPerBeat(Number(event.target.value))}
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
            onChange={(event) => setSwing(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="position-grid">
        <Readout label="startAt" value={startAt === null ? "-" : String(startAt)} />
        <Readout label="elapsed" value={`${(position.elapsedMs / 1000).toFixed(2)}s`} />
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

function useCurrentUrl(state: UrlState): string {
  const [href, setHref] = useState(() => window.location.href);

  useEffect(() => {
    replaceUrlFromState(state);
    setHref(window.location.href);
  }, [state]);

  return href;
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

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="readout">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
