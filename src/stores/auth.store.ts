import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: token !== null,
        }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)