import * as Tone from "tone";
import { nowMs, secondsToMs } from "../clock/clock";
import { getActiveTrackIdsAtStep } from "../pattern/playback";
import {
  calculatePosition,
  msPerStep,
  scheduledStepTimeMs,
  type TransportConfig,
} from "../transport/transport";

type EngineConfig = TransportConfig & {
  beatsPerLoop: number;
  kit: string;
  pattern: string;
  playbackOffsetMs: number;
};

const LOOKAHEAD_MS = 140;
const TICK_MS = 35;
const DEFAULT_KICK_DURATION = "8n";
const DEFAULT_SNARE_DURATION = "16n";
const DEFAULT_HAT_DURATION = "32n";
const DEFAULT_OPEN_HAT_DURATION = "8n";
const CLOSED_HAT_FREQUENCY = 280;
const OPEN_HAT_FREQUENCY = 220;

export async function unlockMetronomeAudio(): Promise<void> {
  await Tone.start();
}

export class MetronomeEngine {
  private kickSynth: Tone.MembraneSynth | null = null;
  private snareSynth: Tone.NoiseSynth | null = null;
  private closedHatSynth: Tone.MetalSynth | null = null;
  private openHatSynth: Tone.MetalSynth | null = null;
  private timerId: number | null = null;
  private config: EngineConfig | null = null;
  private nextStep = 0;

  async start(config: EngineConfig): Promise<void> {
    await unlockMetronomeAudio();
    this.stop();

    this.config = config;
    this.kickSynth = new Tone.MembraneSynth({
      octaves: 4,
      pitchDecay: 0.05,
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.08,
      },
    }).toDestination();
    this.snareSynth = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: {
        attack: 0.001,
        decay: 0.12,
        sustain: 0,
        release: 0.05,
      },
      volume: -16,
    }).toDestination();
    this.closedHatSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.04,
        release: 0.02,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 2500,
      octaves: 1.5,
      volume: -24,
    }).toDestination();
    this.openHatSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.14,
        release: 0.08,
      },
      harmonicity: 5.1,
      modulationIndex: 28,
      resonance: 2200,
      octaves: 1.5,
      volume: -26,
    }).toDestination();

    this.nextStep = Math.max(
      0,
      Math.floor(
        calculatePosition(config, nowMs() + config.playbackOffsetMs).step,
      ),
    );
    this.schedule();
    this.timerId = window.setInterval(() => this.schedule(), TICK_MS);
  }

  update(config: EngineConfig): void {
    if (this.config === null || this.kickSynth === null) {
      return;
    }

    this.config = config;
    this.nextStep = Math.max(
      0,
      Math.floor(
        calculatePosition(config, nowMs() + config.playbackOffsetMs).step,
      ),
    );
  }

  stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.kickSynth?.dispose();
    this.snareSynth?.dispose();
    this.closedHatSynth?.dispose();
    this.openHatSynth?.dispose();
    this.kickSynth = null;
    this.snareSynth = null;
    this.closedHatSynth = null;
    this.openHatSynth = null;
    this.config = null;
    this.nextStep = 0;
  }

  private schedule(): void {
    if (
      this.config === null ||
      this.kickSynth === null ||
      this.snareSynth === null ||
      this.closedHatSynth === null ||
      this.openHatSynth === null
    ) {
      return;
    }

    const currentNowMs = nowMs();
    const horizonMs = currentNowMs + LOOKAHEAD_MS;
    const stepLengthMs = msPerStep(this.config.bpm, this.config.stepsPerBeat);
    const loopLength = this.config.stepsPerBeat * this.config.beatsPerLoop;

    while (true) {
      const eventMs =
        scheduledStepTimeMs(this.config, this.nextStep) -
        this.config.playbackOffsetMs;
      if (eventMs > horizonMs) {
        break;
      }

      if (eventMs >= currentNowMs - stepLengthMs) {
        const toneTime =
          Tone.now() + Math.max(0, eventMs - currentNowMs) / secondsToMs(1);
        const stepInLoop = this.nextStep % loopLength;
        const activeTrackIds = getActiveTrackIdsAtStep(
          this.config.pattern,
          stepInLoop,
        );

        for (const trackId of activeTrackIds) {
          this.playTrack(trackId, toneTime);
        }
      }

      this.nextStep += 1;
    }
  }

  private playTrack(trackId: string, toneTime: number): void {
    switch (trackId) {
      case "kick":
        this.kickSynth?.triggerAttackRelease("C1", DEFAULT_KICK_DURATION, toneTime, 0.95);
        break;
      case "snare":
        this.snareSynth?.triggerAttackRelease(DEFAULT_SNARE_DURATION, toneTime, 0.7);
        break;
      case "closedHat":
        this.closedHatSynth?.triggerAttackRelease(
          CLOSED_HAT_FREQUENCY,
          DEFAULT_HAT_DURATION,
          toneTime,
          0.4,
        );
        break;
      case "openHat":
        this.openHatSynth?.triggerAttackRelease(
          OPEN_HAT_FREQUENCY,
          DEFAULT_OPEN_HAT_DURATION,
          toneTime,
          0.35,
        );
        break;
      default:
        break;
    }
  }
}
