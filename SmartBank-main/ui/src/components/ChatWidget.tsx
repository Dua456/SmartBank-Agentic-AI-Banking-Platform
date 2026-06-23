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
        <strong>Zara — AI Assistant</strong>
        <button onClick={toggle} className="btn-close">&times;</button>
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
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  )
}
