import { useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import Loading from './Loading'

export default function ChatWidget() {
  const { messages, isOpen, loading, sendMessage, toggle } = useChatStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = inputRef.current?.value
    if (val) {
      sendMessage(val)
      inputRef.current!.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
          <strong>Zara — AI Assistant</strong>
        </div>
        <button onClick={toggle} className="btn-close">✕</button>
      </div>
      <div className="chat-body" ref={listRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-msg chat-msg-assistant"><Loading /></div>}
      </div>
      <form onSubmit={handleSubmit} className="chat-footer">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
