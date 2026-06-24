import { useUser, UserButton } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useChatStore } from '../stores/chatStore'
import api from '../services/api'
import ChatWidget from './ChatWidget'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/classify': 'Intent Classification',
  '/document': 'Document Verification',
  '/workflows': 'BPMN Workflows',
  '/chat': 'Chat with Zara',
  '/admin': 'Admin Panel',
  '/admin/users': 'Admin — User Management',
  '/admin/audit': 'Admin — Audit Log',
}

const navItems = [
  {
    section: 'Core',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' },
      { label: 'Classify', path: '/classify', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' },
      { label: 'Document', path: '/document', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
      { label: 'Chat', path: '/chat', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Workflows', path: '/workflows', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
      { label: 'Admin', path: '/admin', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
    ],
  },
]

export default function Layout() {
  const { user } = useUser()
  const toggleChat = useChatStore((s) => s.toggle)
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (user?.id) {
      api.post('/api/auth/sync', { email: user.primaryEmailAddress?.emailAddress }).catch(() => {})
    }
  }, [user?.id, user?.primaryEmailAddress?.emailAddress])

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'SmartBank'

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    || user?.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || 'U'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <div className="sidebar-logo-text">
            <strong>SmartBank</strong>
            <span>AI Operations</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  dangerouslySetInnerHTML={{ __html: item.icon + '<span>' + item.label + '</span>' }}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}</div>
            <div className="role">Administrator</div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h2>{pageTitle}</h2>
          </div>
          <div className="topbar-actions">
            <button className="notif-btn" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notif-dot"></span>
            </button>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      <button className="chat-fab" onClick={toggleChat} title="Chat with Zara">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <ChatWidget />
    </div>
  )
}
