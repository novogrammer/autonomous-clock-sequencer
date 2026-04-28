import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduledStepTimeMs } from "../transport/transport";
import { SequencerEngine } from "./sequencerEngine";

const testState = vi.hoisted(() => ({
  mockedNowMs: 0,
  mockToneNow: vi.fn(() => 10),
  triggerAttackRelease: vi.fn(),
}));

vi.mock("../clock/clock", async () => {
  const actual = await vi.importActual<typeof import("../clock/clock")>(
    "../clock/clock",
  );

  return {
    ...actual,
    nowMs: () => testState.mockedNowMs,
  };
});

vi.mock("tone", () => ({
  default: {
    now: testState.mockToneNow,
    start: vi.fn(),
    Synth: class {
      toDestination() {
        return this;
      }

      triggerAttackRelease = testState.triggerAttackRelease;

      dispose() {}
    },
  },
  now: testState.mockToneNow,
  start: vi.fn(),
  Synth: class {
    toDestination() {
      return this;
    }

    triggerAttackRelease = testState.triggerAttackRelease;

    dispose() {}
  },
}));

describe("SequencerEngine.update", () => {
  beforeEach(() => {
    testState.mockedNowMs = 0;
    testState.mockToneNow.mockClear();
    testState.triggerAttackRelease.mockClear();
  });

  it("BPM変更時に共有グリッド上の現在stepへ再計算する", () => {
    testState.mockedNowMs = 1000;
    const engine = createPreparedEngine();

    engine.update({
      bpm: 60,
      stepsPerBeat: 4,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "1000_0000_0000_0000",
      isPatternEnabled: true,
      isClickEnabled: false,
      swing: 0,
      playbackOffsetMs: 0,
    });

    expect(engine.nextStep).toBe(4);
  });

  it("stepsPerBeat変更後のstep境界でアクセントを再計算する", () => {
    testState.mockedNowMs = 1125;
    const engine = createPreparedEngine();

    engine.update({
      bpm: 120,
      stepsPerBeat: 3,
      beatsPerLoop: 4,
      kit: "minimal",
      pattern:
        "000000100000_000000000000_000000000000_000000000000",
      isPatternEnabled: true,
      isClickEnabled: false,
      swing: 0,
      playbackOffsetMs: 0,
    });
    engine.schedule();

    expect(testState.triggerAttackRelease).toHaveBeenCalledTimes(1);
    expect(testState.triggerAttackRelease.mock.calls[0]?.[0]).toBe("C1");
  });

  it("swing変更後は奇数stepの発音時刻を新設定で再計算する", () => {
    testState.mockedNowMs = 130;
    const engine = createPreparedEngine();

    engine.update({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 1,
      kit: "minimal",
      pattern: "0100_0000_0000_0000",
      isPatternEnabled: true,
      isClickEnabled: false,
      swing: 0.5,
      playbackOffsetMs: 0,
    });
    engine.schedule();

    const expectedToneTime =
      10 +
      (scheduledStepTimeMs({ bpm: 120, stepsPerBeat: 4, swing: 0.5 }, 1) - 130) /
        1000;

    expect(testState.triggerAttackRelease).toHaveBeenCalledTimes(1);
    expect(testState.triggerAttackRelease.mock.calls[0]?.[2]).toBeCloseTo(
      expectedToneTime,
      5,
    );
  });

  it("patternの有効trackだけを同じstepで鳴らす", () => {
    testState.mockedNowMs = 0;
    const engine = createPreparedEngine();

    engine.update({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 1,
      kit: "minimal",
      pattern: "1000_1000_0000_0000",
      isPatternEnabled: true,
      isClickEnabled: false,
      swing: 0,
      playbackOffsetMs: 0,
    });
    engine.schedule();

    expect(testState.triggerAttackRelease).toHaveBeenCalledTimes(2);
    expect(testState.triggerAttackRelease.mock.calls[0]?.[0]).toBe("C1");
    expect(testState.triggerAttackRelease.mock.calls[1]?.[0]).toBe("16n");
  });

  it("pattern再生がoffでもclickだけは鳴らせる", () => {
    testState.mockedNowMs = 0;
    const engine = createPreparedEngine();

    engine.update({
      bpm: 120,
      stepsPerBeat: 4,
      beatsPerLoop: 1,
      kit: "minimal",
      pattern: "1000_1000_1000_1000",
      isPatternEnabled: false,
      isClickEnabled: true,
      swing: 0,
      playbackOffsetMs: 0,
    });
    engine.schedule();

    expect(testState.triggerAttackRelease).toHaveBeenCalledTimes(2);
    expect(testState.triggerAttackRelease.mock.calls[0]?.[0]).toBe("G6");
    expect(testState.triggerAttackRelease.mock.calls[1]?.[0]).toBe("C6");
  });
});

function createPreparedEngine(): PreparedSequencerEngine {
  const engine = new SequencerEngine() as PreparedSequencerEngine;
  engine.config = {
    bpm: 120,
    stepsPerBeat: 4,
    beatsPerLoop: 4,
    kit: "minimal",
    pattern:
      "0000000000000000_0000000000000000_0000000000000000_0000000000000000",
    isPatternEnabled: true,
    isClickEnabled: false,
    swing: 0,
    playbackOffsetMs: 0,
  };
  const voice = {
    triggerAttackRelease: testState.triggerAttackRelease,
    dispose: vi.fn(),
  };
  engine.clickSynth = voice;
  engine.kitVoices = {
    kick: voice,
    snare: voice,
    closedHat: voice,
    openHat: voice,
  };
  engine.nextStep = 0;

  return engine;
}

type PreparedSequencerEngine = SequencerEngine & {
  [key: string]: unknown;
} & any;
