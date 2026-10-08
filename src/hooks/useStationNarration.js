import { useCallback } from 'react';
import { narrate } from '../utils/audio.js';
import { stationEventNarration } from '../utils/narration.js';

export function useStationNarration(stationIdx, audioEnabled = true) {
  const narrateEvent = useCallback(
    (eventKey) => {
      if (!audioEnabled) return;
      const segments = stationEventNarration(stationIdx, eventKey);
      if (segments && segments.length) {
        narrate(segments, true);
      }
    },
    [stationIdx, audioEnabled]
  );

  return { narrateEvent };
}
