import * as Tone from "tone";

export const DRUM_STANDARD_KIT_ID = "drum-standard";

const DEFAULT_KICK_DURATION = "8n";
const DEFAULT_SNARE_DURATION = "16n";
const DEFAULT_HAT_DURATION = "32n";
const DEFAULT_OPEN_HAT_DURATION = "8n";
const DEFAULT_CLAP_DURATION = "16n";
const DEFAULT_PERC_DURATION = "16n";
const DEFAULT_TOM_DURATION = "8n";
const CLAP_OFFSETS = [0, 0.01, 0.022] as const;
const CLAP_VELOCITIES = [0.76, 0.46, 0.24] as const;

const CLOSED_HAT_FREQUENCY = 290;
const OPEN_HAT_FREQUENCY = 380;
const PERC_NOTE = "A4";
const LOW_TOM_NOTE = "G2";
const HIGH_TOM_NOTE = "C3";

export const DRUM_STANDARD_KIT_TRACKS = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "closedHat", label: "Closed Hat" },
  { id: "openHat", label: "Open Hat" },
  { id: "clap", label: "Clap" },
  { id: "perc", label: "Perc" },
  { id: "lowTom", label: "Low Tom" },
  { id: "highTom", label: "High Tom" },
] as const;

export type DrumStandardTrackId =
  (typeof DRUM_STANDARD_KIT_TRACKS)[number]["id"];

export type DrumStandardKitVoices = {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  closedHat: Tone.MetalSynth;
  openHat: Tone.MetalSynth;
  clap: Tone.NoiseSynth;
  clapFilter: Tone.Filter;
  perc: Tone.Synth;
  lowTom: Tone.MembraneSynth;
  highTom: Tone.MembraneSynth;
};

export function createDrumStandardKitVoices(): DrumStandardKitVoices {
  const clapFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1500,
    Q: 1.5,
  }).toDestination();

  return {
    kick: new Tone.MembraneSynth({
      octaves: 4.2,
      pitchDecay: 0.045,
      envelope: {
        attack: 0.001,
        decay: 0.18,
        sustain: 0,
        release: 0.08,
      },
      volume: -1,
    }).toDestination(),
    snare: new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: {
        attack: 0.003,
        decay: 0.09,
        sustain: 0.12,
        release: 0.08,
      },
      volume: -11,
    }).toDestination(),
    closedHat: new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.04,
        release: 0.02,
      },
      harmonicity: 5.6,
      modulationIndex: 30,
      resonance: 2300,
      octaves: 1.4,
      volume: -24,
    }).toDestination(),
    openHat: new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.14,
        release: 0.12,
      },
      harmonicity: 7.1,
      modulationIndex: 34,
      resonance: 3600,
      octaves: 2,
      volume: -21,
    }).toDestination(),
    clap: new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: {
        attack: 0.001,
        decay: 0.024,
        sustain: 0,
        release: 0.2,
      },
      volume: -14.5,
    }).connect(clapFilter),
    clapFilter,
    perc: new Tone.Synth({
      oscillator: { type: "triangle8" },
      envelope: {
        attack: 0.001,
        decay: 0.06,
        sustain: 0,
        release: 0.05,
      },
      volume: -18,
    }).toDestination(),
    lowTom: new Tone.MembraneSynth({
      octaves: 2.4,
      pitchDecay: 0.04,
      envelope: {
        attack: 0.001,
        decay: 0.64,
        sustain: 0,
        release: 1.12,
      },
      volume: -7.5,
    }).toDestination(),
    highTom: new Tone.MembraneSynth({
      octaves: 2.1,
      pitchDecay: 0.035,
      envelope: {
        attack: 0.001,
        decay: 0.52,
        sustain: 0,
        release: 0.96,
      },
      volume: -8,
    }).toDestination(),
  };
}

export function disposeDrumStandardKitVoices(
  voices: DrumStandardKitVoices,
): void {
  voices.kick.dispose();
  voices.snare.dispose();
  voices.closedHat.dispose();
  voices.openHat.dispose();
  voices.clap.dispose();
  voices.clapFilter.dispose();
  voices.perc.dispose();
  voices.lowTom.dispose();
  voices.highTom.dispose();
}

export function playDrumStandardTrack(
  trackId: DrumStandardTrackId,
  voices: DrumStandardKitVoices,
  toneTime: number,
): void {
  switch (trackId) {
    case "kick":
      voices.kick.triggerAttackRelease("C1", DEFAULT_KICK_DURATION, toneTime, 0.52);
      break;
    case "snare":
      voices.snare.triggerAttackRelease(DEFAULT_SNARE_DURATION, toneTime, 0.72);
      break;
    case "closedHat":
      voices.closedHat.triggerAttackRelease(
        CLOSED_HAT_FREQUENCY,
        DEFAULT_HAT_DURATION,
        toneTime,
        0.36,
      );
      break;
    case "openHat":
      voices.openHat.triggerAttackRelease(
        OPEN_HAT_FREQUENCY,
        DEFAULT_OPEN_HAT_DURATION,
        toneTime,
        0.38,
      );
      break;
    case "clap":
      CLAP_OFFSETS.forEach((offset, index) => {
        voices.clap.triggerAttackRelease(
          DEFAULT_CLAP_DURATION,
          toneTime + offset,
          CLAP_VELOCITIES[index],
        );
      });
      break;
    case "perc":
      voices.perc.triggerAttackRelease(PERC_NOTE, DEFAULT_PERC_DURATION, toneTime, 0.52);
      break;
    case "lowTom":
      voices.lowTom.triggerAttackRelease(LOW_TOM_NOTE, DEFAULT_TOM_DURATION, toneTime, 0.66);
      break;
    case "highTom":
      voices.highTom.triggerAttackRelease(HIGH_TOM_NOTE, DEFAULT_TOM_DURATION, toneTime, 0.62);
      break;
  }
}
