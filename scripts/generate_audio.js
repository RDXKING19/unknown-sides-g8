// scripts/generate_audio.js — Offline audio pre-generation pipeline using ElevenLabs Alice
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getAllNarration } from '../src/utils/narration.js';
import { VOICE_ID, MODEL_ID, STYLE_SETTINGS } from '../src/config/audio.config.js';

// Load .env.local then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = path.resolve(__dirname, '../public/assets/audio');
const AUDIO_MAP_FILE = path.resolve(__dirname, '../src/utils/audioMap.js');

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;

function getFilenameForText(text, index) {
  const hash = crypto.createHash('md5').update(text).digest('hex').slice(0, 10);
  const sanitized = text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 24);
  return `audio_${sanitized}_${hash}_${index}.mp3`;
}

async function main() {
  console.log('--- STARTING ELEVENLABS AUDIO GENERATION PIPELINE ---');

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const narrationList = getAllNarration();
  console.log(`Found ${narrationList.length} distinct educational narration segments.`);

  if (!API_KEY) {
    console.log('\n[INFO] No VITE_ELEVENLABS_API_KEY detected in environment or .env.local.');
    console.log('Offline pre-generation requires an ElevenLabs API key.');
    console.log('Skipping API generation. The frontend will play silently or generate dynamically if a key is provided at runtime.');
    return;
  }

  let audioMap = {};
  if (fs.existsSync(AUDIO_MAP_FILE)) {
    try {
      const existing = await import(`file://${AUDIO_MAP_FILE}?t=${Date.now()}`);
      audioMap = { ...existing.audioMap };
    } catch {
      audioMap = {};
    }
  }

  let generatedCount = 0;
  let cachedCount = 0;

  for (let i = 0; i < narrationList.length; i++) {
    const { text, style } = narrationList[i];
    const filename = getFilenameForText(text, i);
    const filePath = path.join(AUDIO_DIR, filename);
    const publicPath = `/assets/audio/${filename}`;

    if (fs.existsSync(filePath) && audioMap[text]) {
      cachedCount++;
      continue;
    }

    console.log(`[${i + 1}/${narrationList.length}] Generating: "${text.slice(0, 50)}..." (${style})`);

    const voiceSettings = STYLE_SETTINGS[style] || STYLE_SETTINGS.statement;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: voiceSettings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to generate audio (${response.status}):`, errorText);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      audioMap[text] = publicPath;
      generatedCount++;

      // Polite rate-limit delay
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error(`Error generating audio for "${text}":`, err.message);
    }
  }

  // Write updated audioMap.js
  const mapContent = `// Auto-generated audio mapping for ElevenLabs TTS pre-generated assets.
// Parity key matches exact text passed to speak().
export const audioMap = ${JSON.stringify(audioMap, null, 2)};
`;
  fs.writeFileSync(AUDIO_MAP_FILE, mapContent, 'utf-8');

  console.log(`\n✔ Generation complete!`);
  console.log(`✔ Generated: ${generatedCount} files.`);
  console.log(`✔ Existing cached: ${cachedCount} files.`);
  console.log(`✔ Updated: ${AUDIO_MAP_FILE}`);
}

main().catch(err => {
  console.error('Generation pipeline error:', err);
  process.exit(1);
});
