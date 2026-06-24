import { useEffect, useState } from 'react'
import { useDashboardStore } from '../../stores/dashboardStore'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { wsService } from '../../services/websocket'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const activityData = [
  { time: '2m ago', title: 'Card Block Request Resolved', desc: 'DEB03 — Ali Ahmed', dot: '#10b981' },
  { time: '5m ago', title: 'PIN Reset Initiated', desc: 'PIN02 — Fatima Khan — In Progress', dot: '#f59e0b' },
  { time: '12m ago', title: 'New Customer Registration', desc: 'Account opened for Usman Malik', dot: '#6366f1' },
  { time: '18m ago', title: 'CNIC Update — Human Review', desc: 'NIC06 — Bilal Hassan — Manager approval pending', dot: '#ef4444' },
  { time: '25m ago', title: 'ATM Card Activated', desc: 'ATM01 — Sana Tariq — Completed', dot: '#10b981' },
  { time: '32m ago', title: 'Internet Banking Reset', desc: 'IB07 — Tariq Mehmood — Pending', dot: '#f59e0b' },
]

export default function Dashboard() {
  const { stats, cases, analytics, loading, fetchStats, fetchCases, fetchAnalytics } =
    useDashboardStore()
  const [timeRange, setTimeRange] = useState('today')

  useEffect(() => {
    fetchStats()
    fetchCases()
    fetchAnalytics()
    const socket = wsService.connect()
    socket?.on('dashboard_update', () => {
      fetchStats()
      fetchCases()
      fetchAnalytics()
    })
    return () => { wsService.disconnect() }
  }, [])

  const statusData = analytics ? Object.entries(analytics.by_status).map(([k, v]) => ({ name: k, value: v })) : []
  const priorityData = analytics ? Object.entries(analytics.by_priority).map(([k, v]) => ({ name: k, value: v })) : []
  const channelData = analytics ? Object.entries(analytics.by_channel).map(([k, v]) => ({ name: k, value: v })) : []

  return (
    <div>
      {/* KPI Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Cases</div>
            <div className="stat-value">{stats.total_cases}</div>
            <div className="stat-trend up">+12% vs yesterday</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-trend up">{stats.automation_rate}% auto-resolved</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-trend down">Needs attention</div>
          </div>
          <div className="stat-card review">
            <div className="stat-label">Human Review</div>
            <div className="stat-value">{stats.human_review}</div>
            <div className="stat-trend down">Requires action</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Resolution</div>
            <div className="stat-value">{stats.avg_resolution_time}</div>
            <div className="stat-trend up">Within SLA</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">SLA Compliance</div>
            <div className="stat-value">{stats.sla_compliance}%</div>
            <div className="stat-trend up">On track</div>
          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="chart-grid">
          <div className="card">
            <h3>By Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3>By Priority</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 16, marginBottom: 24 }}>
        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <span className="text-muted text-sm">Live</span>
          </div>
          <div className="activity-feed">
            {activityData.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" style={{ background: a.dot }}></div>
                <div className="activity-content">
                  <div className="activity-title">{a.title}</div>
                  <div className="activity-desc">{a.desc}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cases Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <h3>Recent Cases</h3>
            <a href="/dashboard" className="text-sm" style={{ color: 'var(--primary)' }}>View All →</a>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.customer_name}</td>
                    <td><span className={`badge badge-${c.type.replace(/ /g, '_')}`}>{c.type}</span></td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No cases yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
