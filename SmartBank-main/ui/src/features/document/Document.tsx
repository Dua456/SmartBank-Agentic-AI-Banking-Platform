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
      toast.success('Document verified successfully')
    } catch {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Upload a CNIC, Passport, Driving Licence, or Utility Bill for OCR extraction and fraud analysis.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Upload Document</h3>
          </div>
          <form onSubmit={handleUpload}>
            <div
              className="file-input"
              onClick={() => inputRef.current?.click()}
              style={{ marginBottom: 16 }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--primary)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file ? file.name : 'Choose a file'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF, PNG, JPG up to 10MB'}
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? 'Verifying...' : 'Verify Document'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="card result-card" style={{ marginTop: 0 }}>
              <div className="card-header">
                <h3>Verification Result</h3>
                <span className={`badge badge-${result.risk_level}-risk`}>
                  {result.risk_level === 'low' ? 'Approved' : result.risk_level === 'medium' ? 'Review' : 'Rejected'}
                </span>
              </div>
              <div className="result-grid">
                <div className="result-field">
                  <div className="result-field-label">Document Type</div>
                  <div className="result-field-value">{result.document_type}</div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Risk Score</div>
                  <div className="result-field-value">{result.risk_score}/100</div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Risk Level</div>
                  <div className="result-field-value">
                    <span className={`badge badge-${result.risk_level}-risk`}>{result.risk_level}</span>
                  </div>
                </div>
                <div className="result-field">
                  <div className="result-field-label">Decision</div>
                  <div className="result-field-value">{result.decision}</div>
                </div>
              </div>

              {result.fraud_indicators.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Fraud Indicators</h4>
                  <ul className="fraud-list">
                    {result.fraud_indicators.map((ind, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--danger)' }}>⚠</span> {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(result.extracted_fields).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Extracted Fields</h4>
                  <div className="result-grid">
                    {Object.entries(result.extracted_fields).map(([k, v]) => (
                      <div key={k} className="result-field">
                        <div className="result-field-label">{k}</div>
                        <div className="result-field-value">{String(v)}</div>
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <p style={{ fontSize: '0.9rem' }}>Upload a document to verify</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
