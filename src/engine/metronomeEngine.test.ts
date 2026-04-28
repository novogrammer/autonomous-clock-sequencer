import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduledStepTimeMs } from "../transport/transport";
import { MetronomeEngine } from "./metronomeEngine";

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

describe("MetronomeEngine.update", () => {
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
      swing: 0,
      playbackOffsetMs: 0,
    });
    engine.schedule();

    expect(testState.triggerAttackRelease).toHaveBeenCalledTimes(2);
    expect(testState.triggerAttackRelease.mock.calls[0]?.[0]).toBe("C6");
  });

  it("swing変更後は奇数stepの発音時刻を新設定で再計算する", () => {
    testState.mockedNowMs = 130;
    const engine = createPreparedEngine();

    engine.update({
      bpm: 120,
      stepsPerBeat: 4,
      swing: 0.5,
      playbackOffsetMs: 0,
    });
    engine.schedule();

    const expectedToneTime =
      10 +
      (scheduledStepTimeMs({ bpm: 120, stepsPerBeat: 4, swing: 0.5 }, 1) - 130) /
        1000;

    expect(testState.triggerAttackRelease).toHaveBeenCalledTimes(2);
    expect(testState.triggerAttackRelease.mock.calls[0]?.[2]).toBeCloseTo(
      expectedToneTime,
      5,
    );
  });
});

function createPreparedEngine(): PreparedMetronomeEngine {
  const engine = new MetronomeEngine() as PreparedMetronomeEngine;
  engine.config = {
    bpm: 120,
    stepsPerBeat: 4,
    swing: 0,
    playbackOffsetMs: 0,
  };
  engine.synth = {
    triggerAttackRelease: testState.triggerAttackRelease,
    dispose: vi.fn(),
  };
  engine.nextStep = 0;

  return engine;
}

type PreparedMetronomeEngine = MetronomeEngine & {
  [key: string]: unknown;
} & any;
