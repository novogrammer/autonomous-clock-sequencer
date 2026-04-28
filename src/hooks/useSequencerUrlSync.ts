import { useEffect, useMemo, useState } from "react";
import { useSequencerStore } from "../state/sequencerStore";
import type { SequencerUrlState } from "../url/sequencerUrl";
import { replaceUrlFromState } from "../url/sequencerUrl";

export function useSequencerUrlSync(state: SequencerUrlState): string {
  const urlState = useMemo(
    () => ({
      bpm: state.bpm,
      stepsPerBeat: state.stepsPerBeat,
      beatsPerLoop: state.beatsPerLoop,
      kit: state.kit,
      pattern: state.pattern,
      swing: state.swing,
    }),
    [
      state.bpm,
      state.stepsPerBeat,
      state.beatsPerLoop,
      state.kit,
      state.pattern,
      state.swing,
    ],
  );
  const hydrateFromUrl = useSequencerStore((store) => store.hydrateFromUrl);
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
