import * as Tone from "tone";

export const BASS_FOURTHS_KIT_ID = "bass-fourths";

const DEFAULT_BASS_DURATION_SECONDS = 0.175;

export const BASS_FOURTHS_KIT_TRACKS = [
  { id: "c3", label: "C3", note: "C3" },
  { id: "g2", label: "G2", note: "G2" },
  { id: "f2", label: "F2", note: "F2" },
  { id: "c2", label: "C2", note: "C2" },
] as const;

export type BassFourthsTrackId = (typeof BASS_FOURTHS_KIT_TRACKS)[number]["id"];

export const BASS_FOURTHS_KIT_TRACK_COUNT = BASS_FOURTHS_KIT_TRACKS.length;

export type BassFourthsKitVoices = Record<BassFourthsTrackId, Tone.Synth>;

function createBassVoice(): Tone.Synth {
  return new Tone.Synth({
    oscillator: { type: "square" },
    envelope: {
      attack: 0.025,
      decay: 0.05,
      sustain: 0.5,
      release: 0.05,
    },
    volume: -13,
  }).toDestination();
}

export function createBassFourthsKitVoices(): BassFourthsKitVoices {
  return {
    c3: createBassVoice(),
    g2: createBassVoice(),
    f2: createBassVoice(),
    c2: createBassVoice(),
  };
}

export function disposeBassFourthsKitVoices(
  voices: BassFourthsKitVoices,
): void {
  voices.c3.dispose();
  voices.g2.dispose();
  voices.f2.dispose();
  voices.c2.dispose();
}

export function playBassFourthsTrack(
  trackId: BassFourthsTrackId,
  voices: BassFourthsKitVoices,
  toneTime: number,
): void {
  const track = BASS_FOURTHS_KIT_TRACKS.find((item) => item.id === trackId);
  if (track === undefined) {
    return;
  }

  voices[trackId].triggerAttackRelease(
    track.note,
    DEFAULT_BASS_DURATION_SECONDS,
    toneTime,
    0.78,
  );
}
