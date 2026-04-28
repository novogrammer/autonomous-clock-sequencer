import { getKitTracks } from "../kit/kits";
import { splitPatternTracks } from "./pattern";

export function getActiveTrackIdsAtStep(
  kit: string,
  pattern: string,
  stepInLoop: number,
): string[] {
  const tracks = splitPatternTracks(pattern);
  const kitTracks = getKitTracks(kit);

  return kitTracks
    .map((track) => track.id)
    .filter((trackId, trackIndex) => {
    const track = tracks[trackIndex];
    return track !== undefined && track[stepInLoop] === "1";
  });
}
