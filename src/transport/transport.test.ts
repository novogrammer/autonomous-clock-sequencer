import { describe, expect, it } from "vitest";
import { secondsToMs } from "../clock/clock";
import {
  calculatePosition,
  scheduledStepTimeMs,
} from "./transport";

describe("transport", () => {
  it("Unix epochから拍位置とstep位置を計算する", () => {
    const position = calculatePosition(
      { bpm: 120, stepsPerBeat: 4, swing: 0 },
      secondsToMs(1),
    );

    expect(position.elapsedMs).toBe(secondsToMs(1));
    expect(position.phaseBeats).toBe(2);
    expect(position.beat).toBe(2);
    expect(position.step).toBe(8);
    expect(position.stepInBeat).toBe(0);
    expect(position.stepInLoop).toBe(8);
  });

  it("デフォルトloop内のstep位置とbeat位置を計算する", () => {
    const position = calculatePosition(
      { bpm: 120, stepsPerBeat: 4, swing: 0 },
      secondsToMs(2.25),
    );

    expect(position.beat).toBe(4);
    expect(position.step).toBe(18);
    expect(position.stepInBeat).toBe(2);
    expect(position.stepInLoop).toBe(2);
    expect(position.beatInLoop).toBe(0);
  });

  it("BPM変更時もUnix epoch基準で位置を再計算する", () => {
    const nowMs = secondsToMs(1.5);
    const position = calculatePosition(
      { bpm: 60, stepsPerBeat: 4, swing: 0 },
      nowMs,
    );

    expect(position.phaseBeats).toBe(1.5);
    expect(position.beat).toBe(1);
    expect(position.step).toBe(6);
  });

  it("swing有効時に奇数stepを遅らせる", () => {
    const straightStep = scheduledStepTimeMs(
      { bpm: 120, stepsPerBeat: 4, swing: 0.5 },
      2,
    );
    const swungStep = scheduledStepTimeMs(
      { bpm: 120, stepsPerBeat: 4, swing: 0.5 },
      1,
    );

    expect(straightStep).toBe(250);
    expect(swungStep).toBe(156.25);
  });
});
