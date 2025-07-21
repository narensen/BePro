import { create } from "zustand";

const useLoadingStore = create(set => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
}));

export default useLoadingStore;