import { useState, useEffect, useCallback } from 'react';
import { narrate, stopNarration, setMuted, audioMuted } from '../utils/audio.js';

/**
 * React hook wrapper for the ElevenLabs audio narration engine.
 */
export function useAudio() {
  const [muted, setMutedState] = useState(audioMuted);

  const toggleMute = useCallback(() => {
    const next = !audioMuted;
    setMuted(next);
    setMutedState(next);
  }, []);

  const playNarration = useCallback((segments) => {
    return narrate(segments, !audioMuted);
  }, []);

  const stop = useCallback(() => {
    stopNarration();
  }, []);

  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, []);

  return {
    muted,
    toggleMute,
    playNarration,
    stopNarration: stop
  };
}
