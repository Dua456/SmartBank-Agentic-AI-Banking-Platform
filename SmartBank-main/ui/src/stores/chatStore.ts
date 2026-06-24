import { create } from 'zustand'
import api from '../services/api'
import type { ChatMessage } from '../types'

interface ChatState {
  messages: ChatMessage[]
  sessionId: string
  sessions: string[]
  isOpen: boolean
  loading: boolean
  sendMessage: (text: string) => Promise<void>
  toggle: () => void
  addMessage: (msg: ChatMessage) => void
  loadSession: (sessionId: string) => Promise<void>
  loadSessions: () => Promise<void>
  newSession: () => void
  deleteSession: (sessionId: string) => Promise<void>
}

function genSessionId(): string {
  return 'chat_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  text: 'Assalam-o-Alaikum! I am **Zara**, your SmartBank AI assistant. How can I help you today?',
  timestamp: Date.now(),
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [WELCOME],
  sessionId: genSessionId(),
  sessions: [],
  isOpen: false,
  loading: false,

  sendMessage: async (text: string) => {
    if (!text.trim()) return
    const { sessionId } = get()
    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() }
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }))

    try {
      await api.post('/api/chat/save', {
        session_id: sessionId, role: 'user', text: text.trim(),
      })
      const res = await api.post('/api/chat', { message: text })
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: res.data.text || 'Sorry, I could not process that.',
        timestamp: Date.now(),
        language: res.data.language,
        module: res.data.module,
      }
      await api.post('/api/chat/save', {
        session_id: sessionId, role: 'assistant', text: assistantMsg.text,
        language: assistantMsg.language, module: assistantMsg.module,
      }).catch(() => {})
      set((s) => ({ messages: [...s.messages, assistantMsg], loading: false }))
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        text: 'Sorry, an error occurred. Please try again.',
        timestamp: Date.now(),
      }
      set((s) => ({ messages: [...s.messages, errorMsg], loading: false }))
    }
  },

  loadSessions: async () => {
    try {
      const res = await api.get('/api/chat/history')
      set({ sessions: res.data.sessions ?? [] })
    } catch { /* silent */ }
  },

  loadSession: async (sessionId: string) => {
    try {
      const res = await api.get(`/api/chat/history/${sessionId}`)
      const msgs: ChatMessage[] = (res.data.messages ?? []).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        text: m.text,
        timestamp: new Date(m.created_at).getTime(),
        id: m.id,
        language: m.language,
        module: m.module,
      }))
      set({ messages: msgs.length > 0 ? msgs : [WELCOME], sessionId })
    } catch { /* silent */ }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await api.delete(`/api/chat/history/${sessionId}`)
      const { sessions } = get()
      set({ sessions: sessions.filter((s) => s !== sessionId) })
    } catch { /* silent */ }
  },

  newSession: () => {
    set({ messages: [WELCOME], sessionId: genSessionId() })
  },

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  addMessage: (msg: ChatMessage) => set((s) => ({ messages: [...s.messages, msg] })),
}))
