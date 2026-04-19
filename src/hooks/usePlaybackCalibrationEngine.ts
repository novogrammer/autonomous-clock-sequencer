import { useEffect, useRef, useState } from "react";
import {
  PlaybackCalibrationEngine,
  unlockPlaybackCalibrationAudio,
} from "../engine/playbackCalibrationEngine";

export type PlaybackCalibrationAudioStatus =
  | "idle"
  | "starting"
  | "ready"
  | "blocked";

type PlaybackCalibrationEngineParams = {
  playbackOffsetMs: number;
  clickFrequencyHz: number;
  isCalibrating: boolean;
  setCalibrating: (isCalibrating: boolean) => void;
};

type PlaybackCalibrationEngineControls = {
  audioStatus: PlaybackCalibrationAudioStatus;
  startCalibration: () => Promise<void>;
  stopCalibration: () => void;
};

export function usePlaybackCalibrationEngine({
  playbackOffsetMs,
  clickFrequencyHz,
  isCalibrating,
  setCalibrating,
}: PlaybackCalibrationEngineParams): PlaybackCalibrationEngineControls {
  const engineRef = useRef<PlaybackCalibrationEngine | null>(null);
  const [audioStatus, setAudioStatus] =
    useState<PlaybackCalibrationAudioStatus>("idle");

  useEffect(() => {
    engineRef.current = new PlaybackCalibrationEngine();

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isCalibrating) {
      engineRef.current?.stop();
      return;
    }

    const engine = engineRef.current;
    if (engine === null) {
      return;
    }

    try {
      if (engine.isCalibrating()) {
        engine.updateCalibration(playbackOffsetMs, clickFrequencyHz);
      } else {
        engine.startCalibration(playbackOffsetMs, clickFrequencyHz);
      }
      setAudioStatus("ready");
    } catch (error) {
      console.error(error);
      engine.stop();
      setCalibrating(false);
      setAudioStatus("blocked");
    }
  }, [
    clickFrequencyHz,
    isCalibrating,
    playbackOffsetMs,
    setCalibrating,
  ]);

  async function startCalibration(): Promise<void> {
    setAudioStatus("starting");

    try {
      await unlockPlaybackCalibrationAudio();
      setCalibrating(true);
    } catch (error) {
      console.error(error);
      setCalibrating(false);
      setAudioStatus("blocked");
    }
  }

  function stopCalibration(): void {
    engineRef.current?.stop();
    setCalibrating(false);
    setAudioStatus("idle");
  }

  return {
    audioStatus,
    startCalibration,
    stopCalibration,
  };
}
