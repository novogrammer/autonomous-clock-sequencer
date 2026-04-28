import { useEffect, useMemo, useRef, useState } from "react";
import {
  SequencerEngine,
  unlockSequencerAudio,
} from "../engine/sequencerEngine";
import type { TransportConfig } from "../transport/transport";

export type AudioStatus = "idle" | "locked" | "starting" | "ready" | "blocked";

type EngineConfig = TransportConfig & {
  beatsPerLoop: number;
  kit: string;
  pattern: string;
  isPatternEnabled: boolean;
  isClickEnabled: boolean;
  playbackOffsetMs: number;
};

type SequencerEngineParams = TransportConfig & {
  beatsPerLoop: number;
  kit: string;
  pattern: string;
  isClickEnabled: boolean;
  isPlaying: boolean;
  playbackOffsetMs: number;
};

type SequencerEngineControls = {
  audioStatus: AudioStatus;
  enableAudio: () => Promise<boolean>;
};

export function useSequencerEngine({
  bpm,
  stepsPerBeat,
  beatsPerLoop,
  kit,
  pattern,
  isClickEnabled,
  swing,
  isPlaying,
  playbackOffsetMs,
}: SequencerEngineParams): SequencerEngineControls {
  const engineRef = useRef<SequencerEngine | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const shouldRun = isPlaying || isClickEnabled;
  const engineConfig = useMemo(
    () => ({
      bpm,
      stepsPerBeat,
      beatsPerLoop,
      kit,
      pattern,
      isPatternEnabled: isPlaying,
      isClickEnabled,
      swing,
      playbackOffsetMs,
    }),
    [
      beatsPerLoop,
      bpm,
      isPlaying,
      isClickEnabled,
      kit,
      pattern,
      playbackOffsetMs,
      stepsPerBeat,
      swing,
    ],
  );
  const engineConfigRef = useRef<EngineConfig>(engineConfig);
  engineConfigRef.current = engineConfig;

  useEffect(() => {
    if (!shouldRun) {
      engineRef.current?.stop();
      setAudioStatus("idle");
      return;
    }

    if (!audioEnabled) {
      engineRef.current?.stop();
      setAudioStatus("locked");
      return;
    }

    const engine = engineRef.current ?? new SequencerEngine();
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
  }, [audioEnabled, shouldRun]);

  useEffect(() => {
    if (!shouldRun || !audioEnabled) {
      return;
    }

    engineRef.current?.update(engineConfig);
  }, [audioEnabled, engineConfig, shouldRun]);

  async function enableAudio(): Promise<boolean> {
    setAudioStatus("starting");

    try {
      await unlockSequencerAudio();
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
