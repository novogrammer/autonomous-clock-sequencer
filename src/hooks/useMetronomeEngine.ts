import { useEffect, useMemo, useRef, useState } from "react";
import {
  MetronomeEngine,
  unlockMetronomeAudio,
} from "../engine/metronomeEngine";
import type { TransportConfig } from "../transport/transport";

export type AudioStatus = "idle" | "locked" | "starting" | "ready" | "blocked";

type EngineConfig = TransportConfig & {
  beatsPerLoop: number;
  kit: string;
  pattern: string;
  playbackOffsetMs: number;
};

type MetronomeEngineParams = TransportConfig & {
  beatsPerLoop: number;
  kit: string;
  pattern: string;
  isPlaying: boolean;
  playbackOffsetMs: number;
};

type MetronomeEngineControls = {
  audioStatus: AudioStatus;
  enableAudio: () => Promise<boolean>;
};

export function useMetronomeEngine({
  bpm,
  stepsPerBeat,
  beatsPerLoop,
  kit,
  pattern,
  swing,
  isPlaying,
  playbackOffsetMs,
}: MetronomeEngineParams): MetronomeEngineControls {
  const engineRef = useRef<MetronomeEngine | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const engineConfig = useMemo(
    () => ({
      bpm,
      stepsPerBeat,
      beatsPerLoop,
      kit,
      pattern,
      swing,
      playbackOffsetMs,
    }),
    [beatsPerLoop, bpm, kit, pattern, playbackOffsetMs, stepsPerBeat, swing],
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

  async function enableAudio(): Promise<boolean> {
    setAudioStatus("starting");

    try {
      await unlockMetronomeAudio();
      setAudioEnabled(true);
      return true;
    } catch (error) {
      console.error(error);
      setAudioEnabled(false);
      setAudioStatus("blocked");
      return false;
    }
  }

  return {
    audioStatus,
    enableAudio,
  };
}
