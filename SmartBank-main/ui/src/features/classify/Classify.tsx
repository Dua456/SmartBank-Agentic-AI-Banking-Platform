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
    } catch {
      toast.error('Classification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Intent Classification</h1>
      <form onSubmit={handleSubmit} className="classify-form">
        <textarea
          rows={4}
          placeholder="Enter customer message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Classifying...' : 'Classify'}
        </button>
      </form>

      {result && (
        <div className="card result-card">
          <h3>Classification Result</h3>
          <div className="result-grid">
            <div><strong>Intent:</strong> {result.intent.label} ({Math.round(result.intent.confidence * 100)}%)</div>
            <div><strong>Channel:</strong> {result.channel}</div>
            <div><strong>Language:</strong> {result.detected_language}</div>
            <div><strong>Escalate:</strong> {result.escalate_to_human ? 'Yes' : 'No'}</div>
          </div>
          {result.entities && Object.keys(result.entities).length > 0 && (
            <>
              <h4>Entities</h4>
              <ul>
                {Object.entries(result.entities).map(([k, v]) => (
                  <li key={k}><strong>{k}:</strong> {v ?? 'N/A'}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
