import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TokenResponse, UserResponse } from '../types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (user: UserResponse) => void
  logout: () => void
  login: (username: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (access: string, refresh: string) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),

      setUser: (user: UserResponse) => set({ user }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      login: async (username: string, password: string) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        if (!res.ok) throw new Error('Invalid credentials')
        const data: TokenResponse = await res.json()
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        })
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        })
        if (meRes.ok) {
          const user: UserResponse = await meRes.json()
          set({ user })
        }
      },
    }),
    { name: 'smartbank-auth' }
  )
)
