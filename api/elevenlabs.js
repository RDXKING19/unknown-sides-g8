export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY or VITE_ELEVENLABS_API_KEY environment variable is not set' });
  }

  const { text, voiceId = 'Xb7hH8MSUJpSbSDYk0k2', modelId = 'eleven_multilingual_v2', voice_settings } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).send(err);
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error proxying to ElevenLabs' });
  }
}
