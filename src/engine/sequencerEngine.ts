import * as Tone from "tone";
import { nowMs, secondsToMs } from "../clock/clock";
import {
  createKitVoices,
  disposeKitVoices,
  playKitTrack,
  type KitVoices,
} from "../kit/kits";
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
  isPatternEnabled: boolean;
  isClickEnabled: boolean;
  playbackOffsetMs: number;
};

const LOOKAHEAD_MS = 140;
const TICK_MS = 35;
const LOOP_CLICK_FREQUENCY = "G6";
const BEAT_CLICK_FREQUENCY = "E6";
const STEP_CLICK_FREQUENCY = "C6";
const CLICK_DURATION = "32n";

export async function unlockSequencerAudio(): Promise<void> {
  await Tone.start();
}

export class SequencerEngine {
  private clickSynth: Tone.Synth | null = null;
  private kitVoices: KitVoices | null = null;
  private timerId: number | null = null;
  private config: EngineConfig | null = null;
  private nextStep = 0;

  async start(config: EngineConfig): Promise<void> {
    await unlockSequencerAudio();
    this.stop();

    this.config = config;
    this.clickSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.001,
        decay: 0.04,
        sustain: 0,
        release: 0.02,
      },
      volume: -18,
    }).toDestination();
    this.kitVoices = createKitVoices(config.kit);

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
    if (this.config === null || this.kitVoices === null) {
      return;
    }

    const shouldReplaceKitVoices = this.config.kit !== config.kit;
    const shouldReschedule =
      shouldReplaceKitVoices ||
      this.config.bpm !== config.bpm ||
      this.config.stepsPerBeat !== config.stepsPerBeat ||
      this.config.swing !== config.swing ||
      this.config.beatsPerLoop !== config.beatsPerLoop ||
      this.config.playbackOffsetMs !== config.playbackOffsetMs;

    if (shouldReplaceKitVoices) {
      disposeKitVoices(this.config.kit, this.kitVoices);
      this.kitVoices = createKitVoices(config.kit);
    }

    this.config = config;
    if (shouldReschedule) {
      this.nextStep = Math.max(
        0,
        Math.floor(
          calculatePosition(config, nowMs() + config.playbackOffsetMs).step,
        ),
      );
    }
  }

  stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.clickSynth?.dispose();
    if (this.config !== null && this.kitVoices !== null) {
      disposeKitVoices(this.config.kit, this.kitVoices);
    }
    this.clickSynth = null;
    this.kitVoices = null;
    this.config = null;
    this.nextStep = 0;
  }

  private schedule(): void {
    if (
      this.config === null ||
      this.clickSynth === null ||
      this.kitVoices === null
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
        const stepInBeat = this.nextStep % this.config.stepsPerBeat;
        const stepInLoop = this.nextStep % loopLength;
        const activeTrackIds = getActiveTrackIdsAtStep(
          this.config.kit,
          this.config.pattern,
          stepInLoop,
        );

        if (this.config.isClickEnabled) {
          this.playClick(stepInLoop, stepInBeat, toneTime);
        }

        if (this.config.isPatternEnabled) {
          for (const trackId of activeTrackIds) {
            this.playTrack(trackId, toneTime);
          }
        }
      }

      this.nextStep += 1;
    }
  }

  private playTrack(trackId: string, toneTime: number): void {
    if (this.config === null || this.kitVoices === null) {
      return;
    }

    playKitTrack(this.config.kit, trackId, this.kitVoices, toneTime);
  }

  private playClick(
    stepInLoop: number,
    stepInBeat: number,
    toneTime: number,
  ): void {
    if (stepInLoop === 0) {
      this.clickSynth?.triggerAttackRelease(
        LOOP_CLICK_FREQUENCY,
        CLICK_DURATION,
        toneTime,
        0.55,
      );
      return;
    }

    if (stepInBeat === 0) {
      this.clickSynth?.triggerAttackRelease(
        BEAT_CLICK_FREQUENCY,
        CLICK_DURATION,
        toneTime,
        0.4,
      );
      return;
    }

    this.clickSynth?.triggerAttackRelease(
      STEP_CLICK_FREQUENCY,
      CLICK_DURATION,
      toneTime,
      0.22,
    );
  }
}
