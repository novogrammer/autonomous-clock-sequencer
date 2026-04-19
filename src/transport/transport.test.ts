import { describe, expect, it } from "vitest";
import { secondsToMs } from "../clock/clock";
import {
  calculatePosition,
  scheduledStepTimeMs,
} from "./transport";

const startAt = secondsToMs(100);

describe("transport", () => {
  it("startAtから拍位置とstep位置を計算する", () => {
    const position = calculatePosition(
      { bpm: 120, stepsPerBeat: 4, swing: 0, startAt },
      startAt + secondsToMs(1),
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
      { bpm: 120, stepsPerBeat: 4, swing: 0, startAt },
      startAt + secondsToMs(2.25),
    );

    expect(position.beat).toBe(4);
    expect(position.step).toBe(18);
    expect(position.stepInBeat).toBe(2);
    expect(position.stepInLoop).toBe(2);
    expect(position.beatInLoop).toBe(0);
  });

  it("BPM変更時もstartAtを変えずに位置を再計算する", () => {
    const nowMs = startAt + secondsToMs(1.5);
    const position = calculatePosition(
      { bpm: 60, stepsPerBeat: 4, swing: 0, startAt },
      nowMs,
    );

    expect(position.phaseBeats).toBe(1.5);
    expect(position.beat).toBe(1);
    expect(position.step).toBe(6);
  });

  it("swing有効時に奇数stepを遅らせる", () => {
    const straightStep = scheduledStepTimeMs(
      { bpm: 120, stepsPerBeat: 4, swing: 0.5, startAt },
      2,
    );
    const swungStep = scheduledStepTimeMs(
      { bpm: 120, stepsPerBeat: 4, swing: 0.5, startAt },
      1,
    );

    expect(straightStep).toBe(startAt + 250);
    expect(swungStep).toBe(startAt + 156.25);
  });
});
