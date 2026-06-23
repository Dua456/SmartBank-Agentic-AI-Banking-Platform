import { create } from 'zustand'
import api from '../services/api'
import type { ChatMessage } from '../types'

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  loading: boolean
  sendMessage: (text: string) => Promise<void>
  toggle: () => void
  addMessage: (msg: ChatMessage) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      role: 'assistant',
      text: '👋 Assalam-o-Alaikum! I am **Zara**, your SmartBank AI assistant. How can I help you today?',
      timestamp: Date.now(),
    },
  ],
  isOpen: false,
  loading: false,

  sendMessage: async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() }
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }))

    try {
      const res = await api.post('/api/chat', { message: text })
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: res.data.text || 'Sorry, I could not process that.',
        timestamp: Date.now(),
      }
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

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  addMessage: (msg: ChatMessage) => set((s) => ({ messages: [...s.messages, msg] })),
}))
