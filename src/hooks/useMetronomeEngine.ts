import { useEffect, useMemo, useRef, useState } from "react";
import {
  MetronomeEngine,
  unlockMetronomeAudio,
} from "../engine/metronomeEngine";
import type { TransportConfig } from "../transport/transport";

export type AudioStatus = "idle" | "locked" | "starting" | "ready" | "blocked";

type EngineConfig = TransportConfig & {
  playbackOffsetMs: number;
  metronomeMuted: boolean;
};

type MetronomeEngineParams = TransportConfig & {
  isPlaying: boolean;
  playbackOffsetMs: number;
};

type MetronomeEngineControls = {
  audioEnabled: boolean;
  audioStatus: AudioStatus;
  metronomeMuted: boolean;
  enableAudio: () => Promise<void>;
  toggleMetronomeMuted: () => void;
};

export function useMetronomeEngine({
  bpm,
  stepsPerBeat,
  swing,
  isPlaying,
  playbackOffsetMs,
}: MetronomeEngineParams): MetronomeEngineControls {
  const engineRef = useRef<MetronomeEngine | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [metronomeMuted, setMetronomeMuted] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const engineConfig = useMemo(
    () => ({
      bpm,
      stepsPerBeat,
      swing,
      playbackOffsetMs,
      metronomeMuted,
    }),
    [bpm, metronomeMuted, playbackOffsetMs, stepsPerBeat, swing],
  );
  const engineConfigRef = useRef<EngineConfig>(engineConfig);
  engineConfigRef.current = engineConfig;

  useEffect(() => {
    if (!isPlaying) {
      engineRef.current?.stop();
      setAudioStatus("idle");
      return;
    }

    if (!audioEnabled) {
      engineRef.current?.stop();
      setAudioStatus("locked");
      return;
    }

    const engine = engineRef.current ?? new MetronomeEngine();
    engineRef.current = engine;
    let isActive = true;
    setAudioStatus("starting");
    engine
      .start(engineConfigRef.current)
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
  }, [audioEnabled, isPlaying]);

  useEffect(() => {
    if (!isPlaying || !audioEnabled) {
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
