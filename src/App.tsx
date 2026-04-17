import { useEffect, useMemo, useRef, useState } from "react";
import { MetronomeEngine } from "./engine/metronomeEngine";
import { useMetronomeStore } from "./state/metronomeStore";
import { calculatePosition, type TransportPosition } from "./transport/transport";
import { replaceUrlFromState } from "./url/phase0Url";
import "./styles.css";

function App() {
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
  const engineRef = useRef<MetronomeEngine | null>(null);
  const urlState = useMemo(
    () => ({ bpm, stepsPerBeat, swing, startAt }),
    [bpm, stepsPerBeat, swing, startAt],
  );
  const [position, setPosition] = useState<TransportPosition>(() =>
    calculatePosition({ bpm, stepsPerBeat, swing, startAt }, Date.now()),
  );
  const [audioStatus, setAudioStatus] = useState<"idle" | "starting" | "ready" | "blocked">(
    "idle",
  );
  const currentUrl = useCurrentUrl(urlState);

  const config = useMemo(
    () => ({ bpm, stepsPerBeat, swing, startAt }),
    [bpm, stepsPerBeat, swing, startAt],
  );

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setPosition(calculatePosition(config, Date.now()));
    }, 50);

    return () => window.clearInterval(timerId);
  }, [config]);

  useEffect(() => {
    if (!isPlaying || startAt === null) {
      engineRef.current?.stop();
      return;
    }

    const engine = engineRef.current ?? new MetronomeEngine();
    engineRef.current = engine;
    setAudioStatus("starting");
    engine
      .start({ bpm, stepsPerBeat, swing, startAt })
      .then(() => setAudioStatus("ready"))
      .catch((error: unknown) => {
        console.error(error);
        setAudioStatus("blocked");
      });

    return () => {
      engine.stop();
    };
  }, [bpm, isPlaying, startAt, stepsPerBeat, swing]);

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="header">
          <div>
            <p className="eyebrow">Phase 0</p>
            <h1>Autonomous Clock Metronome</h1>
          </div>
          <StatusBadge isPlaying={isPlaying} audioStatus={audioStatus} />
        </div>

        <div className="transport-row">
          <button className="primary" onClick={() => start()}>
            再生
          </button>
          <button onClick={stop}>停止</button>
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
              onChange={(event) => setBpm(Number(event.target.value))}
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
      </section>
    </main>
  );
}

type UrlState = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
  startAt: number | null;
};

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
  audioStatus: "idle" | "starting" | "ready" | "blocked";
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

export default App;
