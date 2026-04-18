import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  currentTheme = signal<Theme>('system');
  isDark = signal<boolean>(false);

  constructor() {
    // Initialize theme from local storage or system preference
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      this.currentTheme.set(stored);
    }

    // Effect to update the DOM and localStorage whenever theme changes
    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem('theme', theme);

      let willBeDark = false;
      if (theme === 'system') {
        willBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        willBeDark = theme === 'dark';
      }

      this.isDark.set(willBeDark);

      if (willBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    // Listen for system theme changes if set to system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme() === 'system') {
        const willBeDark = e.matches;
        this.isDark.set(willBeDark);
        if (willBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  toggleTheme() {
    if (this.isDark()) {
      this.setTheme('light');
    } else {
      this.setTheme('dark');
    }
  }
}
