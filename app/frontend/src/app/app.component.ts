// app.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // ← Asegúrate de importar ChangeDetectorRef
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { ThemeToggleComponent } from './pages/theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './pages/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslatePipe,
    ThemeToggleComponent,
    CommonModule,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSubscription!: Subscription;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef // ← INYECTA ChangeDetectorRef aquí
  ) {
    const lang = this.languageService.getPreferredLanguage();
    this.translate.setDefaultLang(lang);
    this.translate.use(lang).subscribe({
      next: () => console.log('Idioma cargado:', lang),
      error: (err) => console.error('Error al cargar idioma:', err)
    });
  }

  title = 'frontend';
  selectedLanguageLabel = 'Idioma';

  ngOnInit() {
    // Verificar autenticación inicial inmediatamente
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Auth inicial en AppComponent:', this.isAuthenticated);

    // Suscribirse al estado de autenticación
    this.authSubscription = this.authService.authStatus$.subscribe(
      (user) => {
        this.isAuthenticated = !!user;
        console.log('Auth actualizado en AppComponent:', this.isAuthenticated);
        this.cdr.detectChanges(); // ← Ahora cdr existe
      }
    );

    // Verificar autenticación en cada cambio de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const isAuthRoute = ['/login', '/registro'].includes(event.url);

      // Actualizar estado de autenticación
      this.isAuthenticated = this.authService.isAuthenticated();
      this.cdr.detectChanges(); // ← Ahora cdr existe

      if (!isAuthRoute && !this.isAuthenticated) {
        this.router.navigate(['/login']);
      }

      if (isAuthRoute && this.isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  changeLanguage(lang: string) {
    this.languageService.changeLanguage(lang);
    console.log('Idioma cargado:', lang);
    switch(lang) {
      case 'es': this.selectedLanguageLabel = 'Español'; break;
      case 'pt': this.selectedLanguageLabel = 'Portugués'; break;
      case 'it': this.selectedLanguageLabel = 'Italiano'; break;
      case 'en': this.selectedLanguageLabel = 'Inglés'; break;
      case 'de': this.selectedLanguageLabel = 'Alemán'; break;
      case 'fr': this.selectedLanguageLabel = 'Francés'; break;
      case 'ja': this.selectedLanguageLabel = 'Japonés'; break;
      case 'ru': this.selectedLanguageLabel = 'Ruso'; break;
      case 'zh': this.selectedLanguageLabel = 'Chino'; break;
    }
  }

  logout() {
    this.authService.logout();
  }
}
