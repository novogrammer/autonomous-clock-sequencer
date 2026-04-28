import { MINIMAL_KIT_TRACK_IDS } from "../kit/minimalKit";
import { splitPatternTracks } from "./pattern";

export function getActiveTrackIdsAtStep(
  pattern: string,
  stepInLoop: number,
): string[] {
  const tracks = splitPatternTracks(pattern);

  return MINIMAL_KIT_TRACK_IDS.filter((trackId, trackIndex) => {
    const track = tracks[trackIndex];
    return track !== undefined && track[stepInLoop] === "1";
  });
}
