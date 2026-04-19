import { secondsToMs } from "../clock/clock";

export type TransportConfig = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
  startAt: number | null;
};

export type TransportPosition = {
  elapsedMs: number;
  beat: number;
  beatInLoop: number;
  step: number;
  stepInBeat: number;
  stepInLoop: number;
  phaseBeats: number;
  loopLength: number;
};

export const DEFAULT_LOOP_LENGTH = 16;

export function msPerBeat(bpm: number): number {
  return secondsToMs(60) / bpm;
}

export function msPerStep(bpm: number, stepsPerBeat: number): number {
  return msPerBeat(bpm) / stepsPerBeat;
}

export function calculatePosition(
  config: TransportConfig,
  nowMs: number,
  loopLength = DEFAULT_LOOP_LENGTH,
): TransportPosition {
  if (config.startAt === null) {
    return {
      elapsedMs: 0,
      beat: 0,
      beatInLoop: 0,
      step: 0,
      stepInBeat: 0,
      stepInLoop: 0,
      phaseBeats: 0,
      loopLength,
    };
  }

  const elapsedMs = Math.max(0, nowMs - config.startAt);
  const phaseBeats = elapsedMs / msPerBeat(config.bpm);
  const beat = Math.floor(phaseBeats);
  const rawStep = Math.floor(phaseBeats * config.stepsPerBeat);
  const stepInLoop = modulo(rawStep, loopLength);
  const beatInLoop = modulo(beat, Math.ceil(loopLength / config.stepsPerBeat));

  return {
    elapsedMs,
    beat,
    beatInLoop,
    step: rawStep,
    stepInBeat: modulo(rawStep, config.stepsPerBeat),
    stepInLoop,
    phaseBeats,
    loopLength,
  };
}

export function scheduledStepTimeMs(
  config: Pick<TransportConfig, "bpm" | "stepsPerBeat" | "swing" | "startAt">,
  step: number,
): number {
  if (config.startAt === null) {
    throw new Error("Cannot schedule without startAt");
  }

  const baseStepMs = msPerStep(config.bpm, config.stepsPerBeat);
  const straightMs = config.startAt + step * baseStepMs;
  if (config.swing <= 0 || config.stepsPerBeat < 2 || step % 2 === 0) {
    return straightMs;
  }

  const swingDelay = baseStepMs * Math.min(config.swing, 0.95) * 0.5;
  return straightMs + swingDelay;
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
