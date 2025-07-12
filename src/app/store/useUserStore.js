import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(persist(
  (set) => ({
    user: null,
    username: '',
    setUserSession: (user) => set({ user }),
    setUsername: (username) => set({ username }),
    clearUserSession: () => set({ user: null, username: '' }),
  }),
  { name: 'user-store' }
));

export default useUserStore;