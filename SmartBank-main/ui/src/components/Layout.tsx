import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import ChatWidget from './ChatWidget'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Classify', path: '/classify' },
  { label: 'Document', path: '/document' },
  { label: 'Workflows', path: '/workflows' },
  { label: 'Chat', path: '/chat' },
  { label: 'Admin', path: '/admin' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const toggleChat = useChatStore((s) => s.toggle)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">SmartBank</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>{user?.username ?? 'User'}</span>
          <button onClick={handleLogout} className="btn btn-sm btn-outline">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
      <button className="chat-fab" onClick={toggleChat} title="Chat with Zara">
        💬
      </button>
      <ChatWidget />
    </div>
  )
}
