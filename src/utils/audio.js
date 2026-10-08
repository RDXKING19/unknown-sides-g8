/* =========================================================================
   AUDIO ENGINE (ElevenLabs "Alice" pipeline)
   Voice: Alice (Clear, Engaging Educator) — Voice ID: Xb7hH8MSUJpSbSDYk0k2
   Model: eleven_multilingual_v2

   Strict Rule: No browser Web Speech API fallback under any circumstance.
   If audio is missing or unconfigured, playback silently skips/continues.
   ========================================================================= */
import { audioMap } from './audioMap.js';
import { VOICE_ID, MODEL_ID, STYLE_SETTINGS } from '../config/audio.config.js';

export { VOICE_ID, MODEL_ID, STYLE_SETTINGS };

const API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ELEVENLABS_API_KEY) || '';

/* ------------------------------------------------------------------ state */
export let audioMuted = false;
let currentAudioElement = null;
let currentQueue = 0;
const dynamicCache = new Map(); // "style::text" -> Promise<blobUrl | null>
const warmCache = new Map(); // url -> preloaded <audio>

/* ---------------------------------------------------------- URL resolution */
async function fetchDynamic(text, style) {
  const cfg = STYLE_SETTINGS[style] || STYLE_SETTINGS.statement;
  const voice_settings = {
    stability: cfg.stability,
    similarity_boost: cfg.similarity_boost,
    style: cfg.style,
    use_speaker_boost: cfg.use_speaker_boost
  };
  try {
    let res;
    if (API_KEY) {
      res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
            'xi-api-key': API_KEY
          },
          body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings })
        }
      );
    } else {
      res = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: VOICE_ID, modelId: MODEL_ID, voice_settings })
      });
    }
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/** Resolve the audio URL for a line: static map first, then live ElevenLabs. */
export function getAudioUrl(text, style = 'statement') {
  if (!text) return Promise.resolve(null);
  if (audioMap[text]) {
    warmStatic(audioMap[text]);
    return Promise.resolve(audioMap[text]);
  }
  const key = `${style}::${text}`;
  if (!dynamicCache.has(key)) dynamicCache.set(key, fetchDynamic(text, style));
  return dynamicCache.get(key);
}

function warmStatic(url) {
  if (typeof Audio === 'undefined' || warmCache.has(url)) return;
  try {
    const a = new Audio();
    a.preload = 'auto';
    a.src = url;
    warmCache.set(url, a);
  } catch {
    // Ignore warm cache errors
  }
}

/* --------------------------------------------------------------- playback */
function playUrl(url) {
  return new Promise(resolve => {
    if (typeof Audio === 'undefined' || !url) return resolve(false);
    let audio;
    try {
      audio = warmCache.get(url) || new Audio(url);
      audio.currentTime = 0;
    } catch {
      return resolve(false);
    }
    currentAudioElement = audio;
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    const p = audio.play();
    if (p && p.catch) p.catch(() => resolve(false));
  });
}

export function setMuted(m) {
  audioMuted = m;
  if (m) stopNarration();
}

let sfxCtx = null;

/**
 * Tactile UI click sound synthesized with Web Audio API.
 * Plays whenever an option or button is selected across any phase.
 */
export function playClickSound() {
  if (audioMuted) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sfxCtx) {
      sfxCtx = new AudioContextClass();
    }
    if (sfxCtx.state === 'suspended') {
      sfxCtx.resume();
    }

    const now = sfxCtx.currentTime;

    // Body tone: warm resonant tactile pop (600Hz -> 160Hz)
    const osc = sfxCtx.createOscillator();
    const gain = sfxCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(sfxCtx.destination);

    osc.start(now);
    osc.stop(now + 0.045);

    // High snap tone: crisp tactile mechanical transient (1400Hz -> 480Hz)
    const tickOsc = sfxCtx.createOscillator();
    const tickGain = sfxCtx.createGain();

    tickOsc.type = 'triangle';
    tickOsc.frequency.setValueAtTime(1400, now);
    tickOsc.frequency.exponentialRampToValueAtTime(480, now + 0.02);

    tickGain.gain.setValueAtTime(0.22, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    tickOsc.connect(tickGain);
    tickGain.connect(sfxCtx.destination);

    tickOsc.start(now);
    tickOsc.stop(now + 0.025);
  } catch {
    // Fail silently without interrupting UI interaction
  }
}

export function stopNarration() {
  currentQueue++;
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
    } catch {
      // Ignore
    }
    currentAudioElement = null;
  }
}

/**
 * Play an array of segments sequentially.
 * Eagerly preloads segment i+1 while playing segment i.
 * No browser speech synthesis fallback is ever invoked.
 */
export async function narrate(segments, autoplay = true) {
  if (!autoplay || audioMuted) return;
  stopNarration();
  const myQueue = ++currentQueue;
  const list = (Array.isArray(segments) ? segments : [segments]).filter(s => s && s.text);
  if (!list.length) return;

  let pending = getAudioUrl(list[0].text, list[0].style);
  for (let i = 0; i < list.length; i++) {
    if (myQueue !== currentQueue || audioMuted) return;
    const urlPromise = pending;
    pending = list[i + 1] ? getAudioUrl(list[i + 1].text, list[i + 1].style) : null;
    const url = await urlPromise;
    if (myQueue !== currentQueue || audioMuted) return;
    if (url) {
      await playUrl(url);
    }
  }
}

/* ---------------------------------------------------- segment helper API */
export const say = text => ({ text, style: 'statement' });
export const ask = text => ({ text, style: 'question' });
export const cheer = text => ({ text, style: 'celebration' });
export const emphasize = text => ({ text, style: 'emphasis' });
export const think = text => ({ text, style: 'thinking' });
export const celebrate = text => ({ text, style: 'celebration' });
export const instruct = text => ({ text, style: 'instruction' });
