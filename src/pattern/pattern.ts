import { getKitTracks } from "../kit/kits";
import { normalizePatternByTrackCount } from "../url/sequencerUrl";

export function createEmptyPattern(
  kit: string,
  stepsPerBeat: number,
  beatsPerLoop: number,
): string {
  const trackLength = stepsPerBeat * beatsPerLoop;
  const emptyTrack = "0".repeat(trackLength);

  return getKitTracks(kit)
    .map(() => emptyTrack)
    .join("_");
}

export function togglePatternStep(
  pattern: string,
  trackIndex: number,
  stepIndex: number,
): string {
  const tracks = pattern.split("_");
  const track = tracks[trackIndex];
  if (track === undefined || stepIndex < 0 || stepIndex >= track.length) {
    return pattern;
  }

  const currentStep = track[stepIndex];
  if (currentStep === undefined) {
    return pattern;
  }

  tracks[trackIndex] =
    `${track.slice(0, stepIndex)}${currentStep === "1" ? "0" : "1"}${track.slice(stepIndex + 1)}`;

  return tracks.join("_");
}

export function splitPatternTracks(pattern: string): string[] {
  return pattern.split("_");
}

export function extendPatternWithRepeat(
  pattern: string,
  {
    trackCount,
    stepsPerBeat,
    fromBeatsPerLoop,
    toBeatsPerLoop,
  }: {
    trackCount: number;
    stepsPerBeat: number;
    fromBeatsPerLoop: number;
    toBeatsPerLoop: number;
  },
): string {
  if (toBeatsPerLoop <= fromBeatsPerLoop) {
    return normalizePatternByTrackCount(pattern, {
      trackCount,
      loopLength: stepsPerBeat * toBeatsPerLoop,
    });
  }

  const fromLoopLength = stepsPerBeat * fromBeatsPerLoop;
  const toLoopLength = stepsPerBeat * toBeatsPerLoop;
  const normalizedSource = normalizePatternByTrackCount(pattern, {
    trackCount,
    loopLength: fromLoopLength,
  });

  const nextTracks = splitPatternTracks(normalizedSource).map((track) => {
    return extendTrackWithRepeat(track, fromLoopLength, toLoopLength);
  });

  return normalizePatternByTrackCount(nextTracks.join("_"), {
    trackCount,
    loopLength: toLoopLength,
  });
}

export function resamplePatternByBeat(
  pattern: string,
  {
    trackCount,
    fromStepsPerBeat,
    toStepsPerBeat,
    beatsPerLoop,
  }: {
    trackCount: number;
    fromStepsPerBeat: number;
    toStepsPerBeat: number;
    beatsPerLoop: number;
  },
): string {
  const normalizedSource = normalizePatternByTrackCount(pattern, {
    trackCount,
    loopLength: fromStepsPerBeat * beatsPerLoop,
  });
  const targetLoopLength = toStepsPerBeat * beatsPerLoop;
  const nextTracks = splitPatternTracks(normalizedSource).map((track) => {
    return resampleTrackByBeat(
      track,
      fromStepsPerBeat,
      toStepsPerBeat,
      beatsPerLoop,
      targetLoopLength,
    );
  });

  return normalizePatternByTrackCount(nextTracks.join("_"), {
    trackCount,
    loopLength: toStepsPerBeat * beatsPerLoop,
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function extendTrackWithRepeat(
  track: string,
  fromLoopLength: number,
  toLoopLength: number,
): string {
  let expandedTrack = "";

  while (expandedTrack.length < toLoopLength) {
    expandedTrack += track.slice(0, fromLoopLength);
  }

  return expandedTrack.slice(0, toLoopLength);
}

export function resampleTrackByBeat(
  track: string,
  fromStepsPerBeat: number,
  toStepsPerBeat: number,
  beatsPerLoop: number,
  targetLoopLength: number = toStepsPerBeat * beatsPerLoop,
): string {
  const nextSteps = Array.from({ length: targetLoopLength }, () => "0");

  for (let stepIndex = 0; stepIndex < track.length; stepIndex += 1) {
    if (track[stepIndex] !== "1") {
      continue;
    }

    const beatIndex = Math.floor(stepIndex / fromStepsPerBeat);
    const offsetInBeat = stepIndex % fromStepsPerBeat;
    const unclampedOffset = Math.round(
      (offsetInBeat * toStepsPerBeat) / fromStepsPerBeat,
    );
    const nextOffsetInBeat = clamp(
      unclampedOffset,
      0,
      toStepsPerBeat - 1,
    );
    const nextStepIndex = beatIndex * toStepsPerBeat + nextOffsetInBeat;
    nextSteps[nextStepIndex] = "1";
  }

  return nextSteps.join("");
}
