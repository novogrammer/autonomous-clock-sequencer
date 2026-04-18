import * as Tone from "tone";
import { nowMs } from "../clock/clock";

const CLICK_DURATION_SECONDS = 0.015;
const BOUNDARY_DURATION_SECONDS = 2;
const REFERENCE_INTERVAL_MS = 1000;
const CALIBRATION_LOOKAHEAD_MS = 250;
const CALIBRATION_TICK_MS = 40;

export class PlaybackCalibrationEngine {
  private referenceSynth: Tone.Synth | null = null;
  private boundarySynth: Tone.Synth | null = null;
  private calibrationTimerId: number | null = null;
  private nextCalibrationTimeMs: number | null = null;

  async startCalibration(
    playbackOffsetMs: number,
    clickFrequencyHz: number,
  ): Promise<void> {
    await Tone.start();
    this.stopCalibration();
    this.ensureSynths();

    this.nextCalibrationTimeMs = nextCalibrationTimeMs(
      nowMs() + playbackOffsetMs,
      REFERENCE_INTERVAL_MS,
    );
    this.scheduleCalibration(playbackOffsetMs, clickFrequencyHz);
    this.calibrationTimerId = window.setInterval(() => {
      this.scheduleCalibration(playbackOffsetMs, clickFrequencyHz);
    }, CALIBRATION_TICK_MS);
  }

  stop(): void {
    this.stopCalibration();
    this.referenceSynth?.dispose();
    this.boundarySynth?.dispose();
    this.referenceSynth = null;
    this.boundarySynth = null;
  }

  private stopCalibration(): void {
    if (this.calibrationTimerId !== null) {
      window.clearInterval(this.calibrationTimerId);
      this.calibrationTimerId = null;
    }

    this.nextCalibrationTimeMs = null;
  }

  private ensureSynths(): void {
    this.referenceSynth ??= createClickSynth(-11);
    this.boundarySynth ??= createSignalSynth(
      -8,
      BOUNDARY_DURATION_SECONDS,
      0.05,
    );
  }

  private scheduleCalibration(
    playbackOffsetMs: number,
    clickFrequencyHz: number,
  ): void {
    if (
      this.referenceSynth === null ||
      this.boundarySynth === null ||
      this.nextCalibrationTimeMs === null
    ) {
      return;
    }

    const currentNowMs = nowMs();
    const correctedNowMs = currentNowMs + playbackOffsetMs;
    const horizonMs = correctedNowMs + CALIBRATION_LOOKAHEAD_MS;

    while (this.nextCalibrationTimeMs <= horizonMs) {
      const localEventMs = this.nextCalibrationTimeMs - playbackOffsetMs;

      if (localEventMs >= currentNowMs - REFERENCE_INTERVAL_MS) {
        const toneTime =
          Tone.now() + Math.max(0, localEventMs - currentNowMs) / 1000;
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
  const second = Math.floor(timeMs / 1000);
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
