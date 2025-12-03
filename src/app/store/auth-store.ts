import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "../types"
import AuthService from "../lib/api/services/auth.service"

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  isHydrating: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  hydrate: () => Promise<void>
  setInitialized: (value: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      isHydrating: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
      hydrate: async () => {
        const state = get()
        if (!state.token || state.isHydrating) return

        set({ isHydrating: true })
        try {
          const authService = new AuthService()
          const userData = await authService.getCurrentUser()
          set({ user: userData, isAuthenticated: true, isInitialized: true })
        } catch (error) {
          console.error("Failed to hydrate user:", error)
          set({ user: null, isAuthenticated: false, isInitialized: true })
        } finally {
          set({ isHydrating: false })
        }
      },
      setInitialized: (value) => {
        set({ isInitialized: value })
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    },
  ),
)
