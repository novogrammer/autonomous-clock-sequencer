import { secondsToMs } from "../clock/clock";

export type TimeSignalFlashState = "idle" | "second" | "boundary";

export function formatLocalTime(nowMs: number): string {
  const date = new Date(nowMs);
  const time = date.toLocaleTimeString("ja-JP", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${time}.${milliseconds}`;
}

export function getTimeSignalFlashState(
  nowMs: number,
): TimeSignalFlashState {
  const millisecond = Math.floor(nowMs % secondsToMs(1));
  if (millisecond >= 120) {
    return "idle";
  }

  const second = Math.floor(nowMs / secondsToMs(1));
  return second % 10 === 0 ? "boundary" : "second";
}
