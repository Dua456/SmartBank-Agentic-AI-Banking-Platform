import { useRef, useEffect, useState } from 'react'
import { useChatStore } from '../../stores/chatStore'
import Loading from '../../components/Loading'

export default function ChatPage() {
  const { messages, sessions, loading, sendMessage, loadSession, loadSessions, newSession, deleteSession, sessionId } = useChatStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    loadSessions()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = inputRef.current?.value
    if (val) {
      sendMessage(val)
      inputRef.current!.value = ''
    }
  }

  const handleNewSession = () => {
    newSession()
    loadSessions()
  }

  const handleLoadSession = (sid: string) => {
    loadSession(sid)
    setShowHistory(false)
  }

  const handleDeleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteSession(sid)
  }

  return (
    <div className="page chat-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Chat with Zara</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Close History' : 'History'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleNewSession}>
            + New Chat
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {showHistory && (
          <div className="card" style={{ width: 220, flexShrink: 0, maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Chat Sessions</h3>
            {sessions.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No saved sessions</p>
            ) : sessions.map((sid) => (
              <div
                key={sid}
                onClick={() => handleLoadSession(sid)}
                style={{
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
                  background: sid === sessionId ? 'var(--primary)' : 'transparent',
                  color: sid === sessionId ? '#fff' : 'var(--text)',
                  marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{sid}</span>
                <button
                  onClick={(e) => handleDeleteSession(sid, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: sid === sessionId ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', padding: '2px 4px' }}
                  title="Delete session"
                >&times;</button>
              </div>
            ))}
          </div>
        )}

        <div className="chat-container" style={{ flex: 1 }}>
          <div className="chat-msgs" ref={listRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
                <div className="chat-bubble-text">{msg.text}</div>
                <div className="chat-bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                  {msg.module && <span style={{ marginLeft: 8, opacity: 0.7 }}>({msg.module})</span>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-assistant">
                <Loading />
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="chat-input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message in English or Urdu..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}
