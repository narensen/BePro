import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,
  username: null,
  setUserSession: (user) => set({ user }),
  setUsername: (username) => set({ username }),
  clearUserSession: () => set({ user: null, username: null }),
}));

export default useUserStore;
