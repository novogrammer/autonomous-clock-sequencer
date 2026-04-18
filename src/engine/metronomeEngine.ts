import * as Tone from "tone";
import {
  calculatePosition,
  msPerStep,
  scheduledStepTimeMs,
  type TransportConfig,
} from "../transport/transport";

type EngineConfig = Omit<TransportConfig, "startAt"> & {
  startAt: number;
  playbackOffsetMs: number;
};

const LOOKAHEAD_MS = 140;
const TICK_MS = 35;

export async function unlockMetronomeAudio(): Promise<void> {
  await Tone.start();
}

export class MetronomeEngine {
  private synth: Tone.Synth | null = null;
  private timerId: number | null = null;
  private config: EngineConfig | null = null;
  private nextStep = 0;

  async start(config: EngineConfig): Promise<void> {
    await unlockMetronomeAudio();
    this.stop();

    this.config = config;
    this.synth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: {
        attack: 0.001,
        decay: 0.04,
        sustain: 0,
        release: 0.02,
      },
      volume: -12,
    }).toDestination();

    this.nextStep = Math.max(
      0,
      Math.floor(
        calculatePosition(config, Date.now() + config.playbackOffsetMs).step,
      ),
    );
    this.schedule();
    this.timerId = window.setInterval(() => this.schedule(), TICK_MS);
  }

  update(config: EngineConfig): void {
    if (this.config === null || this.synth === null) {
      return;
    }

    this.config = config;
    this.nextStep = Math.max(
      0,
      Math.floor(
        calculatePosition(config, Date.now() + config.playbackOffsetMs).step,
      ),
    );
  }

  stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.synth?.dispose();
    this.synth = null;
    this.config = null;
    this.nextStep = 0;
  }

  private schedule(): void {
    if (this.config === null || this.synth === null) {
      return;
    }

    const nowMs = Date.now();
    const horizonMs = nowMs + LOOKAHEAD_MS;
    const stepLengthMs = msPerStep(this.config.bpm, this.config.stepsPerBeat);

    while (true) {
      const eventMs =
        scheduledStepTimeMs(this.config, this.nextStep) -
        this.config.playbackOffsetMs;
      if (eventMs > horizonMs) {
        break;
      }

      if (eventMs >= nowMs - stepLengthMs) {
        const toneTime = Tone.now() + Math.max(0, eventMs - nowMs) / 1000;
        const stepInBeat = this.nextStep % this.config.stepsPerBeat;
        const isBeat = stepInBeat === 0;
        this.synth.triggerAttackRelease(
          isBeat ? "C6" : "C5",
          isBeat ? "32n" : "64n",
          toneTime,
          isBeat ? 0.9 : 0.45,
        );
      }

      this.nextStep += 1;
    }
  }
}
