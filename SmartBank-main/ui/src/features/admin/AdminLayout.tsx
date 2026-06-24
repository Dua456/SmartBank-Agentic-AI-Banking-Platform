import { useEffect, useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import api from '../../services/api'
import type { AdminUser, AdminAuditEntry, AuditStats } from '../../types'
import Loading from '../../components/Loading'

function Users() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      const res = await api.get('/api/admin/users', { params })
      setUsers(res.data.users ?? [])
      setTotal(res.data.total ?? 0)
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [search])

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>User Management</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{total} registered users</div>
          </div>
          <input
            type="text" placeholder="Search users..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: 240 }}
          />
        </div>
      </div>
      {loading ? <Loading /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Cases</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.case_count}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Audit() {
  const [logs, setLogs] = useState<AdminAuditEntry[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, page_size: 20 }
      if (actionFilter) params.action = actionFilter
      const [logsRes, statsRes] = await Promise.all([
        api.get('/api/admin/audit/logs', { params }),
        api.get('/api/admin/audit/stats'),
      ])
      setLogs(logsRes.data.logs ?? [])
      setTotal(logsRes.data.total ?? 0)
      setStats(statsRes.data)
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [page, actionFilter])

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>Audit Log</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {stats ? `${stats.total_entries} entries · Integrity: ${stats.integrity_valid ? 'Valid' : 'Broken'}` : ''}
            </div>
          </div>
          <input
            type="text" placeholder="Filter by action..."
            value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            className="input"
            style={{ width: 200 }}
          />
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          {Object.entries(stats.by_action).map(([action, count]) => (
            <div key={action} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setActionFilter(action); setPage(1) }}>
              <div className="stat-label">{action}</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>{count}</div>
            </div>
          ))}
          {stats.last_entry_hash && (
            <div className="stat-card" style={{ gridColumn: 'span 2' }}>
              <div className="stat-label">Last Entry Hash</div>
              <div style={{ fontSize: '0.7rem', wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: 4 }}>
                {stats.last_entry_hash}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? <Loading /> : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Resource</th>
                  <th>Details</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No audit entries found</td></tr>
                ) : logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{l.id}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(l.timestamp).toLocaleString()}</td>
                    <td><span className="badge badge-pending">{l.action}</span></td>
                    <td>{l.actor}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{l.resource}</td>
                    <td style={{ fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>{l.details}</td>
                    <td style={{ fontSize: '0.65rem', fontFamily: 'monospace', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.hash}>{l.hash?.slice(0, 12)}..</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminLayout() {
  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <nav className="admin-tabs">
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
        <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'active' : ''}>Audit Log</NavLink>
      </nav>
      <Routes>
        <Route index element={<Users />} />
        <Route path="users" element={<Users />} />
        <Route path="audit" element={<Audit />} />
      </Routes>
    </div>
  )
}
