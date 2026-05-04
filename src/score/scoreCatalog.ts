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
        "1000100010001000_0000100000001000_1010101010101010_0000000010000000",
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
      "1000100010001000_0000100000001000_1010101010101010_0000000010000000",
  },
  {
    id: "minimal-offbeat-open-hat",
    kit: "minimal",
    name: "Offbeat Open Hat",
    description: "open hat を裏拍へ置いた airy なドラム解釈。",
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    pattern:
      "1000000010001000_0000100000001000_1010101010101010_0010001000100010",
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
