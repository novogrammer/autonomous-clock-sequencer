export function nowMs(): number {
  if (typeof performance === "undefined") {
    return Date.now();
  }

  return performance.timeOrigin + performance.now();
}

export function roundedNowMs(): number {
  return Math.round(nowMs());
}
