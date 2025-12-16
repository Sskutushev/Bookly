import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

// Function to get the system's preferred theme
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getSystemTheme(), // Initialize with system theme
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Set a flag to indicate that user has manually changed theme
          localStorage.setItem('theme-preference-set', 'true');
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        // Set a flag to indicate that user has manually set theme
        localStorage.setItem('theme-preference-set', 'true');
        return set({ theme });
      },
    }),
    {
      name: 'theme-storage', // name of the item in the storage (must be unique)
    }
  )
);
