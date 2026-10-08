// scripts/clean_audio.js — Cleans orphaned audio files in public/assets/audio
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = path.resolve(__dirname, '../public/assets/audio');
const AUDIO_MAP_FILE = path.resolve(__dirname, '../src/utils/audioMap.js');

async function main() {
  console.log('--- STARTING AUDIO CLEANUP PIPELINE ---');

  if (!fs.existsSync(AUDIO_DIR)) {
    console.log('Audio directory does not exist, nothing to clean.');
    return;
  }

  let audioMap = {};
  if (fs.existsSync(AUDIO_MAP_FILE)) {
    try {
      const module = await import(`file://${AUDIO_MAP_FILE}?t=${Date.now()}`);
      audioMap = module.audioMap || {};
    } catch (err) {
      console.warn('Could not read audioMap.js:', err.message);
    }
  }

  const validPaths = new Set(Object.values(audioMap).map(p => path.basename(p)));
  const files = fs.readdirSync(AUDIO_DIR);

  let removedCount = 0;
  let keptCount = 0;

  for (const file of files) {
    if (file === '.gitkeep') continue;
    if (file.endsWith('.mp3')) {
      if (!validPaths.has(file)) {
        fs.unlinkSync(path.join(AUDIO_DIR, file));
        console.log(`Deleted orphaned audio file: ${file}`);
        removedCount++;
      } else {
        keptCount++;
      }
    }
  }

  console.log(`\n✔ Audio cleanup complete.`);
  console.log(`✔ Kept active files: ${keptCount}`);
  console.log(`✔ Removed orphaned files: ${removedCount}`);
}

main().catch(err => {
  console.error('Audio cleanup error:', err);
  process.exit(1);
});
