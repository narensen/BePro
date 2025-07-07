import { create } from 'zustand'

const useUserStore = create((set) => ({
  user: null,
  username: null,
  email: null,
  setUserSession: (user) => set({ user }),
  setUsername: (username) => set({ username }),
  setEmail: (email) => set({ email }),   // <-- this line is critical
  clearUserSession: () => set({ user: null, username: null, email: null }),
}))

export default useUserStore
