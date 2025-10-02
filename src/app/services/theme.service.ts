import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<Theme>('system');
  private systemPrefersDark = signal(false);

  readonly theme = this.currentTheme.asReadonly();
  readonly isDark = signal(false);

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
    }

    // Listen for system theme changes
    this.setupSystemThemeListener();

    // Apply theme changes
    effect(() => {
      this.applyTheme();
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
  }

  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPrefersDark.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (e) => {
      this.systemPrefersDark.set(e.matches);
    });
  }

  private applyTheme(): void {
    const theme = this.currentTheme();
    const systemDark = this.systemPrefersDark();

    let shouldBeDark = false;

    switch (theme) {
      case 'dark':
        shouldBeDark = true;
        break;
      case 'light':
        shouldBeDark = false;
        break;
      case 'system':
        shouldBeDark = systemDark;
        break;
    }

    this.isDark.set(shouldBeDark);

    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }
}