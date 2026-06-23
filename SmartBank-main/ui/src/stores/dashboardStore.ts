import { create } from 'zustand'
import api from '../services/api'
import type { StatsResponse, CaseItem, AnalyticsResponse } from '../types'

interface DashboardState {
  stats: StatsResponse | null
  cases: CaseItem[]
  analytics: AnalyticsResponse | null
  loading: boolean
  search: string
  priorityFilter: string
  fetchStats: () => Promise<void>
  fetchCases: () => Promise<void>
  fetchAnalytics: () => Promise<void>
  setSearch: (search: string) => void
  setPriorityFilter: (filter: string) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  cases: [],
  analytics: null,
  loading: false,
  search: '',
  priorityFilter: '',

  fetchStats: async () => {
    try {
      const res = await api.get('/api/dashboard/stats')
      set({ stats: res.data })
    } catch {
      // silent fail
    }
  },

  fetchCases: async () => {
    const { search, priorityFilter } = get()
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (priorityFilter) params.priority = priorityFilter
      const res = await api.get('/api/dashboard/cases', { params })
      set({ cases: res.data.cases ?? [] })
    } catch {
      // silent fail
    }
  },

  fetchAnalytics: async () => {
    try {
      const res = await api.get('/api/dashboard/analytics')
      set({ analytics: res.data })
    } catch {
      // silent fail
    }
  },

  setSearch: (search: string) => set({ search }),
  setPriorityFilter: (filter: string) => set({ priorityFilter: filter }),
}))
