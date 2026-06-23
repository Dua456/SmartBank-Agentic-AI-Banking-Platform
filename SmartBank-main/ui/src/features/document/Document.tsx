import { useState, useRef } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import type { DocumentVerifyResponse } from '../../types'

export default function Document() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DocumentVerifyResponse | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await api.post('/api/document/verify', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      toast.success('Document verified')
    } catch {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Document Verification</h1>
      <form onSubmit={handleUpload} className="doc-form">
        <div className="file-input">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
          <button type="button" className="btn btn-outline" onClick={() => inputRef.current?.click()}>
            Choose File
          </button>
          {file && <span className="file-name">{file.name}</span>}
        </div>
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Verifying...' : 'Verify Document'}
        </button>
      </form>

      {result && (
        <div className="card result-card">
          <h3>Verification Result</h3>
          <div className="result-grid">
            <div><strong>Type:</strong> {result.document_type}</div>
            <div><strong>Risk Score:</strong> {result.risk_score}</div>
            <div><strong>Risk Level:</strong> <span className={`badge badge-${result.risk_level}`}>{result.risk_level}</span></div>
            <div><strong>Decision:</strong> {result.decision}</div>
          </div>
          {result.fraud_indicators.length > 0 && (
            <>
              <h4>Fraud Indicators</h4>
              <ul className="fraud-list">
                {result.fraud_indicators.map((ind, i) => <li key={i}>{ind}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
