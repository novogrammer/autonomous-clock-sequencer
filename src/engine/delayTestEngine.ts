import * as Tone from "tone";

const CLICK_DURATION_SECONDS = 0.025;
const CALIBRATION_LOOKAHEAD_MS = 250;
const CALIBRATION_TICK_MS = 40;

export class DelayTestEngine {
  private referenceSynth: Tone.Synth | null = null;
  private calibrationTimerId: number | null = null;
  private nextCalibrationTimeMs: number | null = null;

  async startCalibration(
    playbackOffsetMs: number,
    intervalMs: number,
  ): Promise<void> {
    await Tone.start();
    this.stopCalibration();
    this.ensureSynths();

    this.nextCalibrationTimeMs = nextCalibrationTimeMs(
      Date.now() + playbackOffsetMs,
      intervalMs,
    );
    this.scheduleCalibration(playbackOffsetMs, intervalMs);
    this.calibrationTimerId = window.setInterval(() => {
      this.scheduleCalibration(playbackOffsetMs, intervalMs);
    }, CALIBRATION_TICK_MS);
  }

  stop(): void {
    this.stopCalibration();
    this.referenceSynth?.dispose();
    this.referenceSynth = null;
  }

  private stopCalibration(): void {
    if (this.calibrationTimerId !== null) {
      window.clearInterval(this.calibrationTimerId);
      this.calibrationTimerId = null;
    }

    this.nextCalibrationTimeMs = null;
  }

  private ensureSynths(): void {
    this.referenceSynth ??= createClickSynth(-10);
  }

  private scheduleCalibration(
    playbackOffsetMs: number,
    intervalMs: number,
  ): void {
    if (this.referenceSynth === null || this.nextCalibrationTimeMs === null) {
      return;
    }

    const nowMs = Date.now();
    const correctedNowMs = nowMs + playbackOffsetMs;
    const horizonMs = correctedNowMs + CALIBRATION_LOOKAHEAD_MS;

    while (this.nextCalibrationTimeMs <= horizonMs) {
      const localEventMs = this.nextCalibrationTimeMs - playbackOffsetMs;

      if (localEventMs >= nowMs - intervalMs) {
        const toneTime =
          Tone.now() + Math.max(0, localEventMs - nowMs) / 1000;
        this.referenceSynth.triggerAttackRelease(
          "C6",
          CLICK_DURATION_SECONDS,
          toneTime,
        );
      }

      this.nextCalibrationTimeMs += intervalMs;
    }
  }
}

function nextCalibrationTimeMs(
  correctedNowMs: number,
  intervalMs: number,
): number {
  return Math.ceil(correctedNowMs / intervalMs) * intervalMs;
}

function createClickSynth(volume: number): Tone.Synth {
  return new Tone.Synth({
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.018,
      sustain: 0,
      release: 0.006,
    },
    volume,
  }).toDestination();
}
