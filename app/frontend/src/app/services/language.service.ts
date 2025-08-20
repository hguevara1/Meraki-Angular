import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translate: TranslateService) {
    const userLanguage = navigator.language || navigator.languages[0];
    const availableLanguages = ['es', 'pt', 'it', 'en', 'fr', 'zh', 'ru', 'de', 'ja'];

    if (availableLanguages.includes(userLanguage)) {
      this.translate.setDefaultLang(userLanguage);
      this.translate.use(userLanguage);
    } else {
      this.translate.setDefaultLang('es');
      this.translate.use('es');
    }
  }

  changeLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('preferredLanguage', language); // Guardar idioma preferido en localStorage
  }

  getPreferredLanguage(): string {
    return localStorage.getItem('preferredLanguage') || this.translate.defaultLang || 'es';
  }
}
