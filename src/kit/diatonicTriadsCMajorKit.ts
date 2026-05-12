import * as Tone from "tone";

export const DIATONIC_TRIADS_C_MAJOR_KIT_ID = "diatonic-triads-c-major";

const DEFAULT_CHORD_DURATION_SECONDS = 0.22;

export const DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS = [
  { id: "bdim", label: "Bdim" },
  { id: "am", label: "Am" },
  { id: "g", label: "G" },
  { id: "f", label: "F" },
  { id: "em", label: "Em" },
  { id: "dm", label: "Dm" },
  { id: "c", label: "C" },
] as const;

const TRIAD_NOTES: Record<
  (typeof DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS)[number]["id"],
  readonly string[]
> = {
  bdim: ["B4", "D5", "F5"],
  am: ["A4", "C5", "E5"],
  g: ["G4", "B4", "D5"],
  f: ["F4", "A4", "C5"],
  em: ["E4", "G4", "B4"],
  dm: ["D4", "F4", "A4"],
  c: ["C4", "E4", "G4"],
};

export type DiatonicTriadsCMajorTrackId =
  (typeof DIATONIC_TRIADS_C_MAJOR_KIT_TRACKS)[number]["id"];

export type DiatonicTriadsCMajorKitVoices = Record<
  DiatonicTriadsCMajorTrackId,
  Tone.PolySynth
>;

function createChordVoice(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.015,
      decay: 0.09,
      sustain: 0.18,
      release: 0.18,
    },
    volume: -18,
  }).toDestination();
}

export function createDiatonicTriadsCMajorKitVoices(): DiatonicTriadsCMajorKitVoices {
  return {
    bdim: createChordVoice(),
    am: createChordVoice(),
    g: createChordVoice(),
    f: createChordVoice(),
    em: createChordVoice(),
    dm: createChordVoice(),
    c: createChordVoice(),
  };
}

export function disposeDiatonicTriadsCMajorKitVoices(
  voices: DiatonicTriadsCMajorKitVoices,
): void {
  voices.bdim.dispose();
  voices.am.dispose();
  voices.g.dispose();
  voices.f.dispose();
  voices.em.dispose();
  voices.dm.dispose();
  voices.c.dispose();
}

export function playDiatonicTriadsCMajorTrack(
  trackId: DiatonicTriadsCMajorTrackId,
  voices: DiatonicTriadsCMajorKitVoices,
  toneTime: number,
): void {
  const triadNotes = TRIAD_NOTES[trackId];
  if (triadNotes === undefined) {
    return;
  }

  voices[trackId].triggerAttackRelease(
    [...triadNotes],
    DEFAULT_CHORD_DURATION_SECONDS,
    toneTime,
    0.72,
  );
}
