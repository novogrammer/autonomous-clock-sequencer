import { useEffect, useMemo, useRef, useState } from "react";
import {
  MetronomeEngine,
  unlockMetronomeAudio,
} from "../engine/metronomeEngine";
import type { TransportConfig } from "../transport/transport";

export type AudioStatus = "idle" | "locked" | "starting" | "ready" | "blocked";

type MetronomeEngineParams = Omit<TransportConfig, "startAt"> & {
  startAt: number | null;
  isPlaying: boolean;
  playbackOffsetMs: number;
};

export function useMetronomeEngine({
  bpm,
  stepsPerBeat,
  swing,
  startAt,
  isPlaying,
  playbackOffsetMs,
}: MetronomeEngineParams): {
  audioEnabled: boolean;
  audioStatus: AudioStatus;
  metronomeMuted: boolean;
  enableAudio: () => Promise<void>;
  toggleMetronomeMuted: () => void;
} {
  const engineRef = useRef<MetronomeEngine | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [metronomeMuted, setMetronomeMuted] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>(
    startAt === null ? "idle" : "locked",
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
  }, [audioEnabled, isPlaying, startAt]);

  useEffect(() => {
    if (!isPlaying || !audioEnabled || engineConfig === null) {
      return;
    }

    engineRef.current?.update(engineConfig);
  }, [audioEnabled, engineConfig, isPlaying]);

  async function enableAudio(): Promise<void> {
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

  function toggleMetronomeMuted(): void {
    setMetronomeMuted((isMuted) => !isMuted);
  }

  return {
    audioEnabled,
    audioStatus,
    metronomeMuted,
    enableAudio,
    toggleMetronomeMuted,
  };
}
