import {
  MINIMAL_KIT_ID,
  MINIMAL_KIT_TRACKS,
  type MinimalKitTrackId,
  type MinimalKitVoices,
  createMinimalKitVoices,
  disposeMinimalKitVoices,
  playMinimalKitTrack,
} from "./minimalKit";

export type KitId = typeof MINIMAL_KIT_ID;
export type KitTrackId = MinimalKitTrackId;
export type KitVoices = MinimalKitVoices;

export function getKitTracks(kit: string) {
  switch (kit) {
    case MINIMAL_KIT_ID:
    default:
      return MINIMAL_KIT_TRACKS;
  }
}

export function createKitVoices(kit: string): KitVoices {
  switch (kit) {
    case MINIMAL_KIT_ID:
    default:
      return createMinimalKitVoices();
  }
}

export function disposeKitVoices(kit: string, voices: KitVoices): void {
  switch (kit) {
    case MINIMAL_KIT_ID:
    default:
      disposeMinimalKitVoices(voices);
  }
}

export function playKitTrack(
  kit: string,
  trackId: string,
  voices: KitVoices,
  toneTime: number,
): void {
  switch (kit) {
    case MINIMAL_KIT_ID:
    default:
      playMinimalKitTrack(trackId as MinimalKitTrackId, voices, toneTime);
  }
}
