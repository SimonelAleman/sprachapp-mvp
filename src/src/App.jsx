import React, { useEffect, useState } from 'react'

const QUIZ = [
  { q: 'Wie sagt man „hello“ auf Deutsch?', a: ['Hallo', 'Adiós', 'Merci'], correct: 0 },
  { q: 'Artikel für „Tisch“?', a: ['die', 'der', 'das'], correct: 1 },
  { q: 'Plural von „das Kind“?', a: ['die Kinder', 'die Kinderen', 'die Kinds'], correct: 0 },
]

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: 20, maxWidth: 900 }}>
      <h1>Sprachapp MVP</h1>
      <p style={{ opacity: 0.8 }}>MVP ohne Login/DB. Daten werden lokal im Browser gespeichert.</p>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('home')}>Start</button>
        <button onClick={() => setTab('quiz')}>Einstufung</button>
        <button onClick={() => setTab('lesson')}>A1 Lektion 1</button>
        <button onClick={() => setTab('ask')}>Ask Simon</button>
        <button onClick={() => setTab('tts')}>Vorlesen</button>
      </nav>

      {tab === 'home' && <Home />}
      {tab === 'quiz' && <Quiz />}
      {tab === 'lesson' && <Lesson />}
      {tab === 'ask' && <AskSimon />}
      {tab === 'tts' && <TTS />}
    </div>
  )
}

function Home() {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sprachapp') || '{}') } catch { return {} }
  })
  useEffect(() => {
    localStorage.setItem('sprachapp', JSON.stringify(state))
  }, [state])

  return (
    <section>
      <h2>Hallo 👋</h2>
      <p>Willkommen! Wähle oben eine Funktion aus.</p>
      <div className="card">
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </section>
  )
}

function Quiz() {
  const [answers, setAnswers] = useState(() => Array(QUIZ.length).fill(null))
  const [score, setScore] = useState(null)

  const submit = () => {
    let s = 0
    QUIZ.forEach((item, i) => { if (answers[i] === item.correct) s++ })
    setScore(s)
    const lvl = s >= 3 ? 'A2' : s >= 2 ? 'A1+' : 'A1'
    const state = JSON.parse(localStorage.getItem('sprachapp') || '{}')
    state.level = lvl
    state.lastScore = s
    localStorage.setItem('sprachapp', JSON.stringify(state))
    alert(`Score: ${s}/${QUIZ.length} → Einstufung: ${lvl}`)
  }

  return (
    <section>
      <h2>Einstufungstest (Mini)</h2>
      {QUIZ.map((item, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div><b>{i + 1}. {item.q}</b></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {item.a.map((opt, j) => (
              <label key={j}>
                <input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => {
                  const next = answers.slice()
                  next[i] = j
                  setAnswers(next)
                }} />
                {' '}{opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={submit}>Auswerten</button>
      {score !== null && <p>Dein Score: {score}/{QUIZ.length}</p>}
    </section>
  )
}

function Lesson() {
  return (
    <section>
      <h2>A1 – Lektion 1: Begrüßung</h2>
      <p>Dialog-Beispiel:</p>
      <div className="card">
        <p>– Hallo! Wie heißt du?</p>
        <p>– Ich heiße Ana. Und du?</p>
        <p>– Ich heiße Simon. Freut mich!</p>
      </div>
      <p>Übung: Formuliere drei eigene Begrüßungsdialoge.</p>
    </section>
  )
}

function AskSimon() {
  const [input, setInput] = useState('Erkläre mir den Unterschied zwischen „der“, „die“, „das“ für Anfänger.')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')

  const send = async () => {
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setAnswer(data.answer)
    } catch (e) {
      setAnswer('Fehler: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Ask Simon (KI)</h2>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={5} />
      <div style={{ marginTop: 8 }}>
        <button onClick={send} disabled={loading}>{loading ? 'Bitte warten…' : 'Frage senden'}</button>
      </div>
      {answer && (
        <div className="card" style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
          {answer}
        </div>
      )}
    </section>
  )
}

function TTS() {
  const [text, setText] = useState('Willkommen zur ersten Lektion!')
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState(null)

  const speak = async () => {
    setLoading(true)
    setUrl(null)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    } catch (e) {
      alert('Fehler: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Vorlesen (TTS)</h2>
      <input value={text} onChange={e => setText(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        <button onClick={speak} disabled={loading}>{loading ? 'Erzeuge Audio…' : 'Vorlesen'}</button>
      </div>
      {url && <audio controls src={url} style={{ marginTop: 12 }} />}
    </section>
  )
}
