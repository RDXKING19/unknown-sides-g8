export const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
export const MODEL_ID = 'eleven_multilingual_v2';

export const STYLE_SETTINGS = {
  statement: {
    stability: 0.50,
    similarity_boost: 0.75,
    style: 0.00,
    use_speaker_boost: true
  },
  question: {
    stability: 0.40,
    similarity_boost: 0.70,
    style: 0.15,
    use_speaker_boost: true
  },
  encouragement: {
    stability: 0.45,
    similarity_boost: 0.80,
    style: 0.20,
    use_speaker_boost: true
  },
  emphasis: {
    stability: 0.60,
    similarity_boost: 0.85,
    style: 0.05,
    use_speaker_boost: true
  },
  thinking: {
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.10,
    use_speaker_boost: true
  },
  celebration: {
    stability: 0.35,
    similarity_boost: 0.80,
    style: 0.30,
    use_speaker_boost: true
  },
  instruction: {
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.00,
    use_speaker_boost: true
  }
};
