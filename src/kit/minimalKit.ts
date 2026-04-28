export const MINIMAL_KIT_ID = "minimal";

export const MINIMAL_KIT_TRACK_IDS = [
  "kick",
  "snare",
  "closedHat",
  "openHat",
] as const;

export const MINIMAL_KIT_TRACK_COUNT = MINIMAL_KIT_TRACK_IDS.length;

export const MINIMAL_KIT_TRACKS = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "closedHat", label: "Closed Hat" },
  { id: "openHat", label: "Open Hat" },
] as const;
