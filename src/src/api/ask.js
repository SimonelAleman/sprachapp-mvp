export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const { prompt } = req.body || {}
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' })
      return
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' })
      return
    }

    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du bist ein strenger, aber freundlicher Deutschlehrer. Erkläre kurz, strukturiert und korrekt. Wenn dir Infos fehlen, sag es.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })

    if (!completionRes.ok) {
      const errText = await completionRes.text()
      res.status(500).json({ error: 'OpenAI error: ' + errText })
      return
    }

    const data = await completionRes.json()
    const answer = data.choices?.[0]?.message?.content ?? '(keine Antwort)'
    res.status(200).json({ answer })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
