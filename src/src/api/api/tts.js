export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const { text } = req.body || {}
    if (!text) {
      res.status(400).json({ error: 'Missing text' })
      return
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
    if (!apiKey) {
      res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY on server' })
      return
    }

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.4, similarity_boost: 0.7 }
      })
    })

    if (!ttsRes.ok) {
      const errText = await ttsRes.text()
      res.status(500).json({ error: 'ElevenLabs error: ' + errText })
      return
    }

    const arrayBuffer = await ttsRes.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.status(200).send(Buffer.from(arrayBuffer))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
