import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' or 'light'
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        // Apply theme immediately
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(newTheme);
      },
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage');
  const theme = stored ? JSON.parse(stored).state?.theme || 'dark' : 'dark';
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(theme);
}

export default useThemeStore;

