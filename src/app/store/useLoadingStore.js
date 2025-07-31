import { create } from 'zustand';

const useLoadingStore = create((set) => ({
  loading: false,
  isGeneratingRoadmap: false,
  
  setLoading: (loading) => set({ loading }),
  
  setIsGeneratingRoadmap: (isGeneratingRoadmap) => set({ isGeneratingRoadmap }),
  
  clearAllLoading: () => set({ 
    loading: false, 
    isGeneratingRoadmap: false 
  }),
}));

export default useLoadingStore;