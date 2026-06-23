import { Routes, Route, NavLink } from 'react-router-dom'

function Users() {
  return <div className="card"><h3>User Management</h3><p>Manage system users.</p></div>
}

function Audit() {
  return <div className="card"><h3>Audit Log</h3><p>View system audit trail.</p></div>
}

export default function AdminLayout() {
  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <nav className="admin-tabs">
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
        <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'active' : ''}>Audit</NavLink>
      </nav>
      <Routes>
        <Route index element={<Users />} />
        <Route path="users" element={<Users />} />
        <Route path="audit" element={<Audit />} />
      </Routes>
    </div>
  )
}
