import { secondsToMs } from "../clock/clock";

export type TransportConfig = {
  bpm: number;
  stepsPerBeat: number;
  swing: number;
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
  const elapsedMs = Math.max(0, nowMs);
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
  config: Pick<TransportConfig, "bpm" | "stepsPerBeat" | "swing">,
  step: number,
): number {
  const baseStepMs = msPerStep(config.bpm, config.stepsPerBeat);
  const straightMs = step * baseStepMs;
  if (config.swing <= 0 || config.stepsPerBeat < 2 || step % 2 === 0) {
    return straightMs;
  }

  const swingDelay = baseStepMs * Math.min(config.swing, 0.95) * 0.5;
  return straightMs + swingDelay;
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
