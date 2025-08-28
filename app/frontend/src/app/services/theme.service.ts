import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = false;

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.darkTheme = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
    localStorage.setItem('theme', this.darkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  isDarkTheme(): boolean {
    return this.darkTheme;
  }

  private applyTheme() {
    if (this.darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
