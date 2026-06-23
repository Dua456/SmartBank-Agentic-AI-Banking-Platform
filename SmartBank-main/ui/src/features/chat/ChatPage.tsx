import { useRef, useEffect } from 'react'
import { useChatStore } from '../../stores/chatStore'
import Loading from '../../components/Loading'

export default function ChatPage() {
  const { messages, loading, sendMessage } = useChatStore()
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

  return (
    <div className="page chat-page">
      <h1>Chat with Zara</h1>
      <div className="chat-container">
        <div className="chat-msgs" ref={listRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
              <div className="chat-bubble-text">{msg.text}</div>
              <div className="chat-bubble-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
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
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Send</button>
        </form>
      </div>
    </div>
  )
}
