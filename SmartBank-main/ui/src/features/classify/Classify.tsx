import { useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import type { ClassifyResponse } from '../../types'

export default function Classify() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<ClassifyResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/api/classify', { text })
      setResult(res.data)
      toast.success('Classification completed')
    } catch {
      toast.error('Classification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Enter a customer message to detect intent, extract entities, and determine escalation requirements.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Customer Message</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Enter message in English or Urdu</label>
              <textarea
                rows={5}
                placeholder='e.g. "Mera debit card block kar dein" or "I want to generate my bank statement"'
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Classifying...' : 'Classify Intent'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="card result-card" style={{ marginTop: 0 }}>
              <div className="card-header">
                <h3>Classification Result</h3>
                <span className={`badge badge-${result.intent.code}`}>{result.intent.code}</span>
              </div>
              <div className="result-grid">
                <div className="result-field">
                  <div className="result-field-label">Intent</div>
                  <div className="result-field-value">{result.intent.label}</div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Confidence</div>
                  <div className="result-field-value">{Math.round(result.intent.confidence * 100)}%</div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Channel</div>
                  <div className="result-field-value">{result.channel}</div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Language</div>
                  <div className="result-field-value">{result.detected_language}</div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Escalate to Human</div>
                  <div className="result-field-value">
                    <span className={`badge ${result.escalate_to_human ? 'badge-High' : 'badge-Resolved'}`}>
                      {result.escalate_to_human ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {result.entities && Object.keys(result.entities).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Extracted Entities</h4>
                  <div className="result-grid">
                    {Object.entries(result.entities).map(([k, v]) => (
                      <div key={k} className="result-field">
                        <div className="result-field-label">{k}</div>
                        <div className="result-field-value">{v ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" style={{ marginBottom: 12, opacity: 0.4 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p style={{ fontSize: '0.9rem' }}>Submit a message to see classification results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
