import {
  BASS_FOURTHS_KIT_ID,
  BASS_FOURTHS_KIT_TRACKS,
  type BassFourthsTrackId,
  type BassFourthsKitVoices,
  createBassFourthsKitVoices,
  disposeBassFourthsKitVoices,
  playBassFourthsTrack,
} from "./bassFourthsKit";
import {
  MINIMAL_KIT_ID,
  MINIMAL_KIT_TRACKS,
  type MinimalKitTrackId,
  type MinimalKitVoices,
  createMinimalKitVoices,
  disposeMinimalKitVoices,
  playMinimalKitTrack,
} from "./minimalKit";

export const KIT_IDS = [MINIMAL_KIT_ID, BASS_FOURTHS_KIT_ID] as const;

export type KitId = (typeof KIT_IDS)[number];
export type KitTrackId = MinimalKitTrackId | BassFourthsTrackId;
export type KitVoices = MinimalKitVoices | BassFourthsKitVoices;

export function getDefaultKitId(): KitId {
  return MINIMAL_KIT_ID;
}

export function isKitId(value: string): value is KitId {
  return KIT_IDS.includes(value as KitId);
}

export function getKitTracks(kit: string) {
  switch (kit) {
    case BASS_FOURTHS_KIT_ID:
      return BASS_FOURTHS_KIT_TRACKS;
    case MINIMAL_KIT_ID:
    default:
      return MINIMAL_KIT_TRACKS;
  }
}

export function createKitVoices(kit: string): KitVoices {
  switch (kit) {
    case BASS_FOURTHS_KIT_ID:
      return createBassFourthsKitVoices();
    case MINIMAL_KIT_ID:
    default:
      return createMinimalKitVoices();
  }
}

export function disposeKitVoices(kit: string, voices: KitVoices): void {
  switch (kit) {
    case BASS_FOURTHS_KIT_ID:
      disposeBassFourthsKitVoices(voices as BassFourthsKitVoices);
      return;
    case MINIMAL_KIT_ID:
    default:
      disposeMinimalKitVoices(voices as MinimalKitVoices);
  }
}

export function playKitTrack(
  kit: string,
  trackId: string,
  voices: KitVoices,
  toneTime: number,
): void {
  switch (kit) {
    case BASS_FOURTHS_KIT_ID:
      playBassFourthsTrack(
        trackId as BassFourthsTrackId,
        voices as BassFourthsKitVoices,
        toneTime,
      );
      return;
    case MINIMAL_KIT_ID:
    default:
      playMinimalKitTrack(
        trackId as MinimalKitTrackId,
        voices as MinimalKitVoices,
        toneTime,
      );
  }
}
