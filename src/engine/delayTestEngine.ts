import * as Tone from "tone";

const LOOP_INTERVAL_SECONDS = 1;
const LOOP_INTERVAL_MS = LOOP_INTERVAL_SECONDS * 1000;
const CLICK_DURATION_SECONDS = 0.025;

export class DelayTestEngine {
  private referenceSynth: Tone.Synth | null = null;
  private delayedSynth: Tone.Synth | null = null;
  private loopTimerId: number | null = null;

  async playOnce(delayMs: number): Promise<void> {
    await Tone.start();
    this.ensureSynths();
    this.playPair(Tone.now() + 0.04, delayMs);
  }

  async startLoop(delayMs: number): Promise<void> {
    await Tone.start();
    this.stopLoop();
    this.ensureSynths();
    this.playPair(Tone.now() + 0.04, delayMs);

    this.loopTimerId = window.setInterval(() => {
      this.playPair(Tone.now() + 0.04, delayMs);
    }, LOOP_INTERVAL_MS);
  }

  stop(): void {
    this.stopLoop();
    this.referenceSynth?.dispose();
    this.delayedSynth?.dispose();
    this.referenceSynth = null;
    this.delayedSynth = null;
  }

  private stopLoop(): void {
    if (this.loopTimerId !== null) {
      window.clearInterval(this.loopTimerId);
      this.loopTimerId = null;
    }
  }

  private ensureSynths(): void {
    this.referenceSynth ??= createClickSynth(-10);
    this.delayedSynth ??= createClickSynth(-10);
  }

  private playPair(time: number, delayMs: number): void {
    if (this.referenceSynth === null || this.delayedSynth === null) {
      return;
    }

    this.referenceSynth.triggerAttackRelease("C6", CLICK_DURATION_SECONDS, time);
    this.delayedSynth.triggerAttackRelease(
      "C6",
      CLICK_DURATION_SECONDS,
      time + delayMs / 1000,
    );
  }
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
