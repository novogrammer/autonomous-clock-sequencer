import {
  BASS_FOURTHS_KIT_ID,
  BASS_FOURTHS_KIT_TRACKS,
  createBassFourthsKitVoices,
  disposeBassFourthsKitVoices,
  playBassFourthsTrack,
} from "./bassFourthsKit";
import {
  createDiatonicNotesCMajorKitVoices,
  DIATONIC_NOTES_C_MAJOR_KIT_ID,
  DIATONIC_NOTES_C_MAJOR_KIT_TRACKS,
  disposeDiatonicNotesCMajorKitVoices,
  playDiatonicNotesCMajorTrack,
} from "./diatonicNotesCMajorKit";
import {
  createDiatonicTriadsCMajorKitVoices,
  DIATONIC_TRIADS_C_MAJOR_KIT_ID,
  DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS,
  disposeDiatonicTriadsCMajorKitVoices,
  playDiatonicTriadsCMajorTrack,
} from "./diatonicTriadsCMajorKit";
import {
  createDrumStandardKitVoices,
  disposeDrumStandardKitVoices,
  DRUM_STANDARD_KIT_ID,
  DRUM_STANDARD_KIT_TRACKS,
  playDrumStandardTrack,
} from "./drumStandardKit";
import {
  MINIMAL_KIT_ID,
  MINIMAL_KIT_TRACKS,
  createMinimalKitVoices,
  disposeMinimalKitVoices,
  playMinimalKitTrack,
} from "./minimalKit";

export const KIT_IDS = [
  MINIMAL_KIT_ID,
  BASS_FOURTHS_KIT_ID,
  DIATONIC_NOTES_C_MAJOR_KIT_ID,
  DIATONIC_TRIADS_C_MAJOR_KIT_ID,
  DRUM_STANDARD_KIT_ID,
] as const;

export type KitId = (typeof KIT_IDS)[number];
export type KitTrack = {
  id: string;
  label: string;
  note?: string;
};

export type KitInstance = {
  id: KitId;
  tracks: readonly KitTrack[];
  dispose: () => void;
  playTrack: (trackId: string, toneTime: number) => void;
};

type KitDefinition = {
  id: KitId;
  tracks: readonly KitTrack[];
  createInstance: () => KitInstance;
};

const minimalKitDefinition: KitDefinition = {
  id: MINIMAL_KIT_ID,
  tracks: MINIMAL_KIT_TRACKS,
  createInstance() {
    const voices = createMinimalKitVoices();

    return {
      id: MINIMAL_KIT_ID,
      tracks: MINIMAL_KIT_TRACKS,
      dispose: () => disposeMinimalKitVoices(voices),
      playTrack: (trackId, toneTime) => {
        playMinimalKitTrack(trackId as (typeof MINIMAL_KIT_TRACKS)[number]["id"], voices, toneTime);
      },
    };
  },
};

const bassFourthsKitDefinition: KitDefinition = {
  id: BASS_FOURTHS_KIT_ID,
  tracks: BASS_FOURTHS_KIT_TRACKS,
  createInstance() {
    const voices = createBassFourthsKitVoices();

    return {
      id: BASS_FOURTHS_KIT_ID,
      tracks: BASS_FOURTHS_KIT_TRACKS,
      dispose: () => disposeBassFourthsKitVoices(voices),
      playTrack: (trackId, toneTime) => {
        playBassFourthsTrack(trackId as (typeof BASS_FOURTHS_KIT_TRACKS)[number]["id"], voices, toneTime);
      },
    };
  },
};

const diatonicNotesCMajorKitDefinition: KitDefinition = {
  id: DIATONIC_NOTES_C_MAJOR_KIT_ID,
  tracks: DIATONIC_NOTES_C_MAJOR_KIT_TRACKS,
  createInstance() {
    const voices = createDiatonicNotesCMajorKitVoices();

    return {
      id: DIATONIC_NOTES_C_MAJOR_KIT_ID,
      tracks: DIATONIC_NOTES_C_MAJOR_KIT_TRACKS,
      dispose: () => disposeDiatonicNotesCMajorKitVoices(voices),
      playTrack: (trackId, toneTime) => {
        playDiatonicNotesCMajorTrack(
          trackId as (typeof DIATONIC_NOTES_C_MAJOR_KIT_TRACKS)[number]["id"],
          voices,
          toneTime,
        );
      },
    };
  },
};

const diatonicTriadsCMajorKitDefinition: KitDefinition = {
  id: DIATONIC_TRIADS_C_MAJOR_KIT_ID,
  tracks: DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS,
  createInstance() {
    const voices = createDiatonicTriadsCMajorKitVoices();

    return {
      id: DIATONIC_TRIADS_C_MAJOR_KIT_ID,
      tracks: DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS,
      dispose: () => disposeDiatonicTriadsCMajorKitVoices(voices),
      playTrack: (trackId, toneTime) => {
        playDiatonicTriadsCMajorTrack(
          trackId as (typeof DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS)[number]["id"],
          voices,
          toneTime,
        );
      },
    };
  },
};

const drumStandardKitDefinition: KitDefinition = {
  id: DRUM_STANDARD_KIT_ID,
  tracks: DRUM_STANDARD_KIT_TRACKS,
  createInstance() {
    const voices = createDrumStandardKitVoices();

    return {
      id: DRUM_STANDARD_KIT_ID,
      tracks: DRUM_STANDARD_KIT_TRACKS,
      dispose: () => disposeDrumStandardKitVoices(voices),
      playTrack: (trackId, toneTime) => {
        playDrumStandardTrack(
          trackId as (typeof DRUM_STANDARD_KIT_TRACKS)[number]["id"],
          voices,
          toneTime,
        );
      },
    };
  },
};

const KIT_DEFINITIONS: Record<KitId, KitDefinition> = {
  [MINIMAL_KIT_ID]: minimalKitDefinition,
  [BASS_FOURTHS_KIT_ID]: bassFourthsKitDefinition,
  [DIATONIC_NOTES_C_MAJOR_KIT_ID]: diatonicNotesCMajorKitDefinition,
  [DIATONIC_TRIADS_C_MAJOR_KIT_ID]: diatonicTriadsCMajorKitDefinition,
  [DRUM_STANDARD_KIT_ID]: drumStandardKitDefinition,
};

export function getDefaultKitId(): KitId {
  return MINIMAL_KIT_ID;
}

export function isKitId(value: string): value is KitId {
  return KIT_IDS.includes(value as KitId);
}

export function getKitTracks(kit: string): readonly KitTrack[] {
  return getKitDefinition(kit).tracks;
}

export function createKit(kit: string): KitInstance {
  return getKitDefinition(kit).createInstance();
}

function getKitDefinition(kit: string): KitDefinition {
  if (isKitId(kit)) {
    return KIT_DEFINITIONS[kit];
  }

  return KIT_DEFINITIONS[getDefaultKitId()];
}
