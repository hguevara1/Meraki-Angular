import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    MatMenuModule,
    MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  selectedLanguage = 'es';
  get selectedLanguageLabel() {
    switch (this.selectedLanguage) {
      case 'es': return 'Español';
      case 'pt': return 'Portugués';
      case 'it': return 'Italiano';
      case 'en': return 'Inglés';
      default: return 'Idioma';
    }
  }

  changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    console.log('Idioma cambiado a:', lang);
    // Aquí integrarías i18n o ngx-translate
  }
}
