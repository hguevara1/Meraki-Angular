// app/frontend/src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
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
  totalIngredientes: number = 0;
  totalSubrecetas: number = 0;
  totalTortas: number = 0;
  private authSubscription!: Subscription;

  private apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('🔵 DashboardComponent iniciado');

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserData();
    this.loadCounts();
  }

  private loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userEmail = userData.email;
    }
    this.authSubscription = this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user;
        this.userEmail = user?.email || 'Usuario';
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error obteniendo usuario:', error);
        if (error.status === 401) {
          this.authService.logout();
        }
        const userData = this.authService.getUserData();
        if (userData) {
          this.currentUser = userData;
          this.userEmail = userData.email;
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
