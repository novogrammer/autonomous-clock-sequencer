import * as Tone from "tone";

export const DIATONIC_NOTES_C_MAJOR_KIT_ID = "diatonic-notes-c-major";

const DEFAULT_NOTE_DURATION_SECONDS = 0.16;

export const DIATONIC_NOTES_C_MAJOR_KIT_TRACKS = [
  { id: "b4", label: "B4", note: "B4" },
  { id: "a4", label: "A4", note: "A4" },
  { id: "g4", label: "G4", note: "G4" },
  { id: "f4", label: "F4", note: "F4" },
  { id: "e4", label: "E4", note: "E4" },
  { id: "d4", label: "D4", note: "D4" },
  { id: "c4", label: "C4", note: "C4" },
] as const;

export type DiatonicNotesCMajorTrackId =
  (typeof DIATONIC_NOTES_C_MAJOR_KIT_TRACKS)[number]["id"];

export type DiatonicNotesCMajorKitVoices = Record<
  DiatonicNotesCMajorTrackId,
  Tone.Synth
>;

function createNoteVoice(): Tone.Synth {
  return new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.01,
      decay: 0.08,
      sustain: 0.22,
      release: 0.12,
    },
    volume: -16,
  }).toDestination();
}

export function createDiatonicNotesCMajorKitVoices(): DiatonicNotesCMajorKitVoices {
  return {
    b4: createNoteVoice(),
    a4: createNoteVoice(),
    g4: createNoteVoice(),
    f4: createNoteVoice(),
    e4: createNoteVoice(),
    d4: createNoteVoice(),
    c4: createNoteVoice(),
  };
}

export function disposeDiatonicNotesCMajorKitVoices(
  voices: DiatonicNotesCMajorKitVoices,
): void {
  voices.b4.dispose();
  voices.a4.dispose();
  voices.g4.dispose();
  voices.f4.dispose();
  voices.e4.dispose();
  voices.d4.dispose();
  voices.c4.dispose();
}

export function playDiatonicNotesCMajorTrack(
  trackId: DiatonicNotesCMajorTrackId,
  voices: DiatonicNotesCMajorKitVoices,
  toneTime: number,
): void {
  const track = DIATONIC_NOTES_C_MAJOR_KIT_TRACKS.find((item) => item.id === trackId);
  if (track === undefined) {
    return;
  }

  voices[trackId].triggerAttackRelease(
    track.note,
    DEFAULT_NOTE_DURATION_SECONDS,
    toneTime,
    0.76,
  );
}
