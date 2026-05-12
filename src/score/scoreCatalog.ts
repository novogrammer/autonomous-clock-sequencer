import type { SequencerUrlState } from "../url/sequencerUrl";
import { normalizeSequencerUrlState } from "../url/sequencerUrl";

export type ExampleScore = {
  id: string;
  name: string;
  description: string;
  state: SequencerUrlState;
};

export type PatternPreset = {
  id: string;
  kit: string;
  name: string;
  description: string;
  stepsPerBeat: number;
  beatsPerLoop: number;
  pattern: string;
};

export type SharedScoresLink = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export const DEFAULT_SHARED_SCORES_HASHTAG = "#AutonomousClockSequencer";

export const EXAMPLE_SCORES: readonly ExampleScore[] = [
  defineExampleScore({
    id: "minimal-four-on-the-floor",
    name: "Four on the Floor",
    description: "Minimal kit の基本グルーヴ。最初に URL 共有を試す入口。",
    state: {
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "1000100010001000_0000100000001000_1010101000101010_0000000010000000",
      swing: 0,
    },
  }),
  defineExampleScore({
    id: "minimal-swung-break",
    name: "Swung Break",
    description: "同じ absolute time 上で swing を含むドラム解釈を確認する譜面。",
    state: {
      bpm: 132,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "1000000010001000_0000100000001000_1010111010101110_0000000000100000",
      swing: 0.18,
    },
  }),
  defineExampleScore({
    id: "bass-fourths-ostinato",
    name: "Bass Fourths Ostinato",
    description: "bass-fourths kit で同じ時間軸を別の pitch grid として試す譜面。",
    state: {
      bpm: 104,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "bass-fourths",
      pattern:
        "1000100010001000_0000001000000010_0010000000100000_0000000000000000",
      swing: 0.08,
    },
  }),
  defineExampleScore({
    id: "diatonic-notes-c-major-cascade",
    name: "Diatonic Cascade",
    description: "C major の 7 track を上行させて note 系 kit の入口を確認する譜面。",
    state: {
      bpm: 110,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "diatonic-notes-c-major",
      pattern:
        "0000000000100000_0000001000000000_0010000000000000_0000000000001000_0000000010000000_0000100000000000_1000000000000000",
      swing: 0.04,
    },
  }),
  defineExampleScore({
    id: "diatonic-triads-c-major-cadence",
    name: "Triad Cadence",
    description: "C major の triad を順に置いて harmonic 系 kit の入口を確認する譜面。",
    state: {
      bpm: 96,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "diatonic-triads-c-major",
      pattern:
        "0000000000000000_0000000000000000_0010000000000000_0000000010000000_0000000000001000_0000100000000000_1000000000000000",
      swing: 0.02,
    },
  }),
  defineExampleScore({
    id: "drum-standard-floor-toms",
    name: "Standard Floor Toms",
    description: "tom を含む 8 track drum kit でフィル込みの入口を確認する譜面。",
    state: {
      bpm: 122,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "drum-standard",
      pattern:
        "1000100010001000_0000100000001000_1010101010101010_0000000010000010_0000000000001000_0000001000000000_0000000000000010_0000000000000001",
      swing: 0.06,
    },
  }),
] as const;

export const PATTERN_PRESETS: readonly PatternPreset[] = [
  {
    id: "minimal-four-on-the-floor",
    kit: "minimal",
    name: "Four on the Floor",
    description: "4つ打ちの土台。現在の BPM と swing を維持したまま切り替える。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "1000100010001000_0000100000001000_1010101000101010_0000000010000000",
  },
  {
    id: "minimal-offbeat-open-hat",
    kit: "minimal",
    name: "Offbeat Open Hat",
    description: "open hat を裏拍へ置いた airy なドラム解釈。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "1000100010001010_0000100000001000_1000100010001000_0010001000100010",
  },
  {
    id: "bass-fourths-pulse",
    kit: "bass-fourths",
    name: "Pulse",
    description: "C を芯にしながら四度の応答を返す短いオスティナート。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "1000100010001000_0000001000000010_0010000000100000_0000000000000000",
  },
  {
    id: "bass-fourths-triplet-climb",
    kit: "bass-fourths",
    name: "Triplet Weave",
    description: "3 steps / beat で各音が交差する interlocking な bass preset。",
    stepsPerBeat: 3,
    beatsPerLoop: 4,
    pattern:
      "100000100000_010001010000_001010001000_000100000100",
  },
  {
    id: "diatonic-notes-c-major-cascade",
    kit: "diatonic-notes-c-major",
    name: "Cascade",
    description: "C major の各 degree を順に置く最小 melodic preset。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "0000000000100000_0000001000000000_0010000000000000_0000000000001000_0000000010000000_0000100000000000_1000000000000000",
  },
  {
    id: "diatonic-triads-c-major-cadence",
    kit: "diatonic-triads-c-major",
    name: "Cadence",
    description: "C major の triad を下から積み上げる最小 harmonic preset。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "0000000000000000_0000000000000000_0010000000000000_0000000010000000_0000000000001000_0000100000000000_1000000000000000",
  },
  {
    id: "drum-standard-floor-toms",
    kit: "drum-standard",
    name: "Floor Toms",
    description: "kick と hat を保ったまま clap, perc, tom でフィルを加える drum preset。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "1000100010001000_0000100000001000_1010101010101010_0000000010000010_0000000000001000_0000001000000000_0000000000000010_0000000000000001",
  },
] as const;

export const SHARED_SCORES_LINKS: readonly SharedScoresLink[] = [
  {
    id: "x",
    label: "Search on X",
    href: "https://x.com/search?q=%23AutonomousClockSequencer&src=typed_query",
    description: `${DEFAULT_SHARED_SCORES_HASHTAG} の投稿を検索する`,
  },
  {
    id: "bluesky",
    label: "Search on Bluesky",
    href: "https://bsky.app/search?q=%23AutonomousClockSequencer",
    description: `${DEFAULT_SHARED_SCORES_HASHTAG} の投稿を検索する`,
  },
] as const;

export function applyExampleScore(exampleScore: ExampleScore): SequencerUrlState {
  return normalizeSequencerUrlState(exampleScore.state);
}

export function applyPatternPreset(
  currentState: SequencerUrlState,
  patternPreset: PatternPreset,
): SequencerUrlState {
  return normalizeSequencerUrlState({
    ...currentState,
    kit: patternPreset.kit,
    stepsPerBeat: patternPreset.stepsPerBeat,
    beatsPerLoop: patternPreset.beatsPerLoop,
    pattern: patternPreset.pattern,
  });
}

function defineExampleScore(exampleScore: {
  id: string;
  name: string;
  description: string;
  state: SequencerUrlState;
}): ExampleScore {
  return {
    ...exampleScore,
    state: normalizeSequencerUrlState(exampleScore.state),
  };
}
