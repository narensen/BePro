import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(persist(
  (set) => ({
    user: null,
    username: '',
    avatar_url: '',
    setUserSession: (user) => set({ user }),
    setUsername: (username) => set({ username }),
    setAvatarUrl: (avatar_url) => set({ avatar_url }),
    clearUserSession: () => set({ user: null, username: '', avatar_url: '' }),
  }),
  { name: 'user-store' }
));

export default useUserStore;