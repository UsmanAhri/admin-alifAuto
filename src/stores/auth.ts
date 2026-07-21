import { defineStore } from 'pinia'
import { api, getStoredToken, setStoredToken } from '@/boot/api'
import type { Role, User } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getStoredToken() as string | null,
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    role: (state): Role | null => state.user?.role ?? null,
  },
  actions: {
    async login(login: string, password: string): Promise<void> {
      const { data } = await api.post('/admin/auth/login', { login, password })
      this.token = data.token
      this.user = data.user
      setStoredToken(data.token)
    },
    async fetchMe(): Promise<void> {
      const { data } = await api.get('/admin/auth/me')
      this.user = data.data
    },
    async logout(): Promise<void> {
      try {
        await api.post('/admin/auth/logout')
      } finally {
        this.clear()
      }
    },
    clear(): void {
      this.token = null
      this.user = null
      setStoredToken(null)
    },
  },
})
