import { useEffect, useState } from 'react'
import api from '../../services/api'
import type { WorkflowItem } from '../../types'

const bpmnColors: Record<string, string> = {
  Deb03CardBlock: '#ef4444',
  Pin02Generation: '#f59e0b',
  Atm01Activation: '#8b5cf6',
  Nic06IdUpdate: '#6366f1',
  Stm04Statement: '#06b6d4',
  Ltr05Letter: '#10b981',
  Ib07InternetBanking: '#f97316',
  Mb08MobileBanking: '#14b8a6',
  MaestroOrchestrator: '#6366f1',
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])

  useEffect(() => {
    api.get('/api/workflows').then((res) => setWorkflows(res.data.workflows ?? [])).catch(() => {})
  }, [])

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          UiPath Maestro BPMN workflow definitions for banking operations orchestration.
        </p>
      </div>

      <div className="grid-4">
        {workflows.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--text-muted)' }}>No workflows found</p>
          </div>
        ) : workflows.map((w, i) => (
          <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: bpmnColors[w.process_id] || 'var(--primary)',
            }}></div>
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: (bpmnColors[w.process_id] || 'var(--primary)') + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: bpmnColors[w.process_id] || 'var(--primary)',
                  fontWeight: 700, fontSize: '0.75rem',
                }}>
                  {w.process_id?.startsWith('Maestro') ? 'M' : w.process_id?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                <code style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{w.process_id}</code>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {(w.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
