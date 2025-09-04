import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DebugService } from '../../services/debug.service';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ThemeToggleComponent,
    HeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  userEmail: string = '';
  userRole: string = '';
  totalIngredientes: number = 0;
  totalSubrecetas: number = 0;
  totalTortas: number = 0;
  isAdmin: boolean = false;
  private authSubscription!: Subscription;

  private apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private debugService: DebugService
  ) {}

  ngOnInit() {
      console.log('🔵 DashboardComponent iniciado');

      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadUserData();
  }

  private loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userEmail = userData.email;
      this.userRole = userData.role;
      this.isAdmin = userData.role === 'admin';
      console.log('✅ isAdmin actualizado desde localStorage:', this.isAdmin);
    }

    this.authSubscription = this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        if (user) { // ← ¡IMPORTANTE! Solo actualizar si user no es null
          this.currentUser = user;
          this.userEmail = user.email;
          this.userRole = user.role;
          this.isAdmin = user.role === 'admin';
          console.log('✅ isAdmin actualizado desde observable:', this.isAdmin);

          // Solo cargar datos si es administrador
          if (this.isAdmin) {
            this.loadCounts();
          }
        } else {
          console.log('ℹ️ Observable emitió null, ignorando...');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error obteniendo usuario:', error);
        if (error.status === 401) {
          this.authService.logout();
        }
        // Mantener los datos de localStorage si hay error
        const userData = this.authService.getUserData();
        if (userData) {
          this.currentUser = userData;
          this.userEmail = userData.email;
          this.userRole = userData.role;
          this.isAdmin = userData.role === 'admin';
        }
      }
    });
  }

  private loadCounts() {
    this.loadIngredientesCount();
    this.loadSubrecetasCount();
    this.loadTortasCount();
  }

  private loadIngredientesCount() {
    this.http.get<any[]>(`${environment.apiUrl}/ingredientes`)
      .subscribe({
        next: (ingredientes) => {
          this.totalIngredientes = ingredientes.length;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error cargando ingredientes:', error);
          this.totalIngredientes = 0;
          if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  private loadSubrecetasCount() {
    this.http.get<any[]>(`${environment.apiUrl}/subrecetas`)
      .subscribe({
        next: (subrecetas) => {
          this.totalSubrecetas = subrecetas.length;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error cargando subrecetas:', error);
          this.totalSubrecetas = 0;
          if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  private loadTortasCount() {
    this.http.get<any[]>(`${environment.apiUrl}/tortas`)
      .subscribe({
        next: (tortas) => {
          this.totalTortas = tortas.length;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error cargando tortas:', error);
          this.totalTortas = 0;
          if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
