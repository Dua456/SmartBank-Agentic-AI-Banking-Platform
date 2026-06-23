import { useEffect } from 'react'
import { useDashboardStore } from '../../stores/dashboardStore'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { wsService } from '../../services/websocket'

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { stats, cases, analytics, loading, fetchStats, fetchCases, fetchAnalytics } =
    useDashboardStore()

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
    <div className="page">
      <h1>Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><span>Total</span><strong>{stats.total_cases}</strong></div>
          <div className="stat-card resolved"><span>Resolved</span><strong>{stats.resolved}</strong></div>
          <div className="stat-card pending"><span>Pending</span><strong>{stats.pending}</strong></div>
          <div className="stat-card review"><span>Human Review</span><strong>{stats.human_review}</strong></div>
          <div className="stat-card"><span>Automation</span><strong>{stats.automation_rate}%</strong></div>
          <div className="stat-card"><span>SLA</span><strong>{stats.sla_compliance}%</strong></div>
        </div>
      )}

      {analytics && (
        <div className="chart-grid">
          <div className="card">
            <h3>By Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3>By Priority</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3>By Channel</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {channelData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Recent Cases</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Channel</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td>{c.customer_name}</td>
                  <td>{c.type}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                  <td>{c.channel}</td>
                  <td>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
