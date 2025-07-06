import { create } from 'zustand'

const useUserStore = create((set) => ({
  user: null,
  setUserSession: (user) => set({ user }),
  clearUserSession: () => set({ user: null }),
}))

export default useUserStore
    