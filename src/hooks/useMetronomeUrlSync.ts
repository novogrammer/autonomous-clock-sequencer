import { useEffect, useMemo, useState } from "react";
import { useMetronomeStore } from "../state/metronomeStore";
import type { Phase0UrlState } from "../url/phase0Url";
import { replaceUrlFromState } from "../url/phase0Url";

export function useMetronomeUrlSync(state: Phase0UrlState): string {
  const urlState = useMemo(
    () => ({
      bpm: state.bpm,
      stepsPerBeat: state.stepsPerBeat,
      swing: state.swing,
    }),
    [state.bpm, state.stepsPerBeat, state.swing],
  );
  const hydrateFromUrl = useMetronomeStore((store) => store.hydrateFromUrl);
  const [href, setHref] = useState(() => window.location.href);

  useEffect(() => {
    replaceUrlFromState(urlState);
    setHref(window.location.href);
  }, [urlState]);

  useEffect(() => {
    function handlePopState() {
      hydrateFromUrl(window.location.search);
      setHref(window.location.href);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hydrateFromUrl]);

  return href;
}
