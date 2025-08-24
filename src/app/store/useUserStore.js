import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(persist(
  (set) => ({
    user: null,
    username: '',
    avatar_url: '',
    totalUnreadCount: 0,
    setUserSession: (user) => set({ user }),
    setUsername: (username) => set({ username }),
    setAvatarUrl: (avatar_url) => set({ avatar_url }),
    setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
    clearUserSession: () => set({ user: null, username: '', avatar_url: '', totalUnreadCount: 0 }),
  }),
  { name: 'user-store' }
));

export default useUserStore;