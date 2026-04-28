import * as Tone from "tone";

export const MINIMAL_KIT_ID = "minimal";

const DEFAULT_KICK_DURATION = "8n";
const DEFAULT_SNARE_DURATION = "16n";
const DEFAULT_SNARE_TONE_DURATION = "32n";
const SNARE_CLAP_OFFSETS = [0, 0.014] as const;
const SNARE_CLAP_VELOCITIES = [0.72, 0.4] as const;
const DEFAULT_HAT_DURATION = "32n";
const DEFAULT_OPEN_HAT_DURATION = "8n";
const CLOSED_HAT_FREQUENCY = 280;
const OPEN_HAT_FREQUENCY = 220;
const SNARE_TONE_NOTE = "E3";

export const MINIMAL_KIT_TRACKS = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "closedHat", label: "Closed Hat" },
  { id: "openHat", label: "Open Hat" },
] as const;

export type MinimalKitTrackId = (typeof MINIMAL_KIT_TRACKS)[number]["id"];

export const MINIMAL_KIT_TRACK_IDS = MINIMAL_KIT_TRACKS.map(
  (track) => track.id,
) as MinimalKitTrackId[];

export const MINIMAL_KIT_TRACK_COUNT = MINIMAL_KIT_TRACKS.length;

export type MinimalKitVoices = {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  snareTone: Tone.Synth;
  closedHat: Tone.MetalSynth;
  openHat: Tone.MetalSynth;
};

export function createMinimalKitVoices(): MinimalKitVoices {
  return {
    kick: new Tone.MembraneSynth({
      octaves: 4,
      pitchDecay: 0.05,
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.08,
      },
    }).toDestination(),
    snare: new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: {
        attack: 0.004,
        decay: 0.1,
        sustain: 0.18,
        release: 0.12,
      },
      volume: -10,
    }).toDestination(),
    snareTone: new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.001,
        decay: 0.11,
        sustain: 0,
        release: 0.06,
      },
      volume: -13,
    }).toDestination(),
    closedHat: new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.04,
        release: 0.02,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 2500,
      octaves: 1.5,
      volume: -24,
    }).toDestination(),
    openHat: new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.14,
        release: 0.08,
      },
      harmonicity: 5.1,
      modulationIndex: 28,
      resonance: 2200,
      octaves: 1.5,
      volume: -26,
    }).toDestination(),
  };
}

export function disposeMinimalKitVoices(voices: MinimalKitVoices): void {
  voices.kick.dispose();
  voices.snare.dispose();
  voices.snareTone.dispose();
  voices.closedHat.dispose();
  voices.openHat.dispose();
}

export function playMinimalKitTrack(
  trackId: MinimalKitTrackId,
  voices: MinimalKitVoices,
  toneTime: number,
): void {
  switch (trackId) {
    case "kick":
      voices.kick.triggerAttackRelease("C1", DEFAULT_KICK_DURATION, toneTime, 0.48);
      break;
    case "snare":
      SNARE_CLAP_OFFSETS.forEach((offset, index) => {
        voices.snare.triggerAttackRelease(
          DEFAULT_SNARE_DURATION,
          toneTime + offset,
          SNARE_CLAP_VELOCITIES[index],
        );
      });
      voices.snareTone.triggerAttackRelease(
        SNARE_TONE_NOTE,
        DEFAULT_SNARE_TONE_DURATION,
        toneTime,
        0.72,
      );
      break;
    case "closedHat":
      voices.closedHat.triggerAttackRelease(
        CLOSED_HAT_FREQUENCY,
        DEFAULT_HAT_DURATION,
        toneTime,
        0.4,
      );
      break;
    case "openHat":
      voices.openHat.triggerAttackRelease(
        OPEN_HAT_FREQUENCY,
        DEFAULT_OPEN_HAT_DURATION,
        toneTime,
        0.35,
      );
      break;
  }
}
