import { useEffect, useMemo, useState } from "react";
import type { Phase0UrlState } from "../url/phase0Url";
import { replaceUrlFromState } from "../url/phase0Url";

export function useMetronomeUrlSync(state: Phase0UrlState): string {
  const urlState = useMemo(
    () => ({
      bpm: state.bpm,
      stepsPerBeat: state.stepsPerBeat,
      swing: state.swing,
      startAt: state.startAt,
    }),
    [state.bpm, state.stepsPerBeat, state.startAt, state.swing],
  );
  const [href, setHref] = useState(() => window.location.href);

  useEffect(() => {
    replaceUrlFromState(urlState);
    setHref(window.location.href);
  }, [urlState]);

  return href;
}
