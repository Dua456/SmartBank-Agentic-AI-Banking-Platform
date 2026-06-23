import { useEffect, useState } from 'react'
import api from '../../services/api'
import type { WorkflowItem } from '../../types'

export default function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])

  useEffect(() => {
    api.get('/api/workflows').then((res) => setWorkflows(res.data.workflows ?? [])).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1>Workflows</h1>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>File</th>
                <th>Size</th>
                <th>Process ID</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w, i) => (
                <tr key={i}>
                  <td>{w.name}</td>
                  <td>{w.file}</td>
                  <td>{w.size} B</td>
                  <td><code>{w.process_id}</code></td>
                </tr>
              ))}
              {workflows.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.6 }}>No workflows found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
