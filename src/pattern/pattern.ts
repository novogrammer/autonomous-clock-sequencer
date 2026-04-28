import { getKitTracks } from "../kit/kits";

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
