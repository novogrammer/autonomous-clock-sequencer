import * as Tone from "tone";
import { nowMs, secondsToMs } from "../clock/clock";

const CLICK_DURATION_SECONDS = 0.015;
const BOUNDARY_DURATION_SECONDS = 2;
const REFERENCE_INTERVAL_MS = secondsToMs(1);
const CALIBRATION_LOOKAHEAD_MS = 250;
const CALIBRATION_TICK_MS = 40;

type PlaybackCalibrationConfig = {
  playbackOffsetMs: number;
  clickFrequencyHz: number;
};

export async function unlockPlaybackCalibrationAudio(): Promise<void> {
  await Tone.start();
}

export class PlaybackCalibrationEngine {
  private referenceSynth: Tone.Synth | null = null;
  private boundarySynth: Tone.Synth | null = null;
  private calibrationTimerId: number | null = null;
  private nextCalibrationTimeMs: number | null = null;
  private config: PlaybackCalibrationConfig | null = null;

  isCalibrating(): boolean {
    return this.config !== null;
  }

  startCalibration(
    playbackOffsetMs: number,
    clickFrequencyHz: number,
  ): void {
    this.stopCalibration();
    this.ensureSynths();
    this.config = { playbackOffsetMs, clickFrequencyHz };

    this.nextCalibrationTimeMs = nextCalibrationTimeMs(
      nowMs() + playbackOffsetMs,
      REFERENCE_INTERVAL_MS,
    );
    this.scheduleCalibration();
    this.calibrationTimerId = window.setInterval(() => {
      this.scheduleCalibration();
    }, CALIBRATION_TICK_MS);
  }

  updateCalibration(
    playbackOffsetMs: number,
    clickFrequencyHz: number,
  ): void {
    if (this.config === null) {
      return;
    }

    this.recreateSynths();
    this.config = { playbackOffsetMs, clickFrequencyHz };
    this.nextCalibrationTimeMs = nextCalibrationTimeMs(
      nowMs() + playbackOffsetMs,
      REFERENCE_INTERVAL_MS,
    );
    this.scheduleCalibration();
  }

  stop(): void {
    this.stopCalibration();
    this.disposeSynths();
  }

  private stopCalibration(): void {
    if (this.calibrationTimerId !== null) {
      window.clearInterval(this.calibrationTimerId);
      this.calibrationTimerId = null;
    }

    this.nextCalibrationTimeMs = null;
    this.config = null;
  }

  private ensureSynths(): void {
    this.referenceSynth ??= createClickSynth(-11);
    this.boundarySynth ??= createSignalSynth(
      -8,
      BOUNDARY_DURATION_SECONDS,
      0.05,
    );
  }

  private recreateSynths(): void {
    this.disposeSynths();
    this.ensureSynths();
  }

  private disposeSynths(): void {
    this.referenceSynth?.dispose();
    this.boundarySynth?.dispose();
    this.referenceSynth = null;
    this.boundarySynth = null;
  }

  private scheduleCalibration(): void {
    if (
      this.referenceSynth === null ||
      this.boundarySynth === null ||
      this.nextCalibrationTimeMs === null ||
      this.config === null
    ) {
      return;
    }

    const { playbackOffsetMs, clickFrequencyHz } = this.config;
    const currentNowMs = nowMs();
    const correctedNowMs = currentNowMs + playbackOffsetMs;
    const horizonMs = correctedNowMs + CALIBRATION_LOOKAHEAD_MS;

    while (this.nextCalibrationTimeMs <= horizonMs) {
      const localEventMs = this.nextCalibrationTimeMs - playbackOffsetMs;

      if (localEventMs >= currentNowMs - REFERENCE_INTERVAL_MS) {
        const toneTime =
          Tone.now() +
          Math.max(0, localEventMs - currentNowMs) / secondsToMs(1);
        this.referenceSynth.triggerAttackRelease(
          clickFrequencyHz,
          CLICK_DURATION_SECONDS,
          toneTime,
          0.35,
        );

        if (isTenSecondBoundary(this.nextCalibrationTimeMs)) {
          this.boundarySynth.triggerAttackRelease(
            1000,
            BOUNDARY_DURATION_SECONDS,
            toneTime,
            0.9,
          );
        }
      }

      this.nextCalibrationTimeMs += REFERENCE_INTERVAL_MS;
    }
  }
}

function nextCalibrationTimeMs(
  correctedNowMs: number,
  intervalMs: number,
): number {
  return Math.ceil(correctedNowMs / intervalMs) * intervalMs;
}

function isTenSecondBoundary(timeMs: number): boolean {
  const second = Math.floor(timeMs / secondsToMs(1));
  return second % 10 === 0;
}

function createClickSynth(volume: number): Tone.Synth {
  return new Tone.Synth({
    oscillator: { type: "square" },
    envelope: {
      attack: 0.0005,
      decay: 0.009,
      sustain: 0,
      release: 0.003,
    },
    volume,
  }).toDestination();
}

function createSignalSynth(
  volume: number,
  decay: number,
  release: number,
): Tone.Synth {
  return new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.003,
      decay,
      sustain: 0,
      release,
    },
    volume,
  }).toDestination();
}
