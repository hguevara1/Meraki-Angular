import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { ThemeToggleComponent } from './pages/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslatePipe,
    ThemeToggleComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
      private translate: TranslateService,
      private languageService: LanguageService,
      private router: Router,
      private authService: AuthService
      ) {
      const lang = this.languageService.getPreferredLanguage();
          this.translate.setDefaultLang(lang);
          this.translate.use(lang).subscribe({
            next: () => console.log('Idioma cargado:', lang),
            error: (err) => console.error('Error al cargar idioma:', err)
          });
      }
  title = 'frontend';
  selectedLanguageLabel = 'Idioma'; // Valor inicial

  ngOnInit() {
      // Verificar autenticación en cada cambio de ruta
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const isAuthRoute = ['/login', '/registro'].includes(event.url);

        if (!isAuthRoute && !this.authService.isAuthenticated()) {
          this.router.navigate(['/login']);
        }

        if (isAuthRoute && this.authService.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
        }
      });
  }
  changeLanguage(lang: string) {
    this.languageService.changeLanguage(lang);
    console.log('Idioma cargado:', lang);
    // Actualiza la etiqueta del idioma seleccionado
    switch(lang) {
      case 'es': this.selectedLanguageLabel = 'Español'; break;
      case 'pt': this.selectedLanguageLabel = 'Portugués'; break;
      case 'it': this.selectedLanguageLabel = 'Italiano'; break;
      case 'en': this.selectedLanguageLabel = 'Inglés'; break;
      case 'de': this.selectedLanguageLabel = 'Aleman'; break;
      case 'fr': this.selectedLanguageLabel = 'Frances'; break;
      case 'ja': this.selectedLanguageLabel = 'Japones'; break;
      case 'ru': this.selectedLanguageLabel = 'Ruso'; break;
      case 'zh': this.selectedLanguageLabel = 'Chino'; break;
    }
  }
}
