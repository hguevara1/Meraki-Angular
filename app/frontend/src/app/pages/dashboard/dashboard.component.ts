import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DebugService } from '../../services/debug.service';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    // 1. Siempre usar localStorage primero
    const userData = this.authService.getUserData();
    if (userData) {
      this.currentUser = userData;
      this.userEmail = userData.email;
      this.userRole = userData.role;
      this.isAdmin = userData.role === 'admin';
      console.log('✅ Datos cargados desde localStorage:', this.currentUser);

      if (this.isAdmin) {
        this.loadCounts();
      }
    }

    // 2. Escuchar cambios, pero ignorar null
    this.authSubscription = this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        if (user) {
          this.currentUser = user;
          this.userEmail = user.email;
          this.userRole = user.role;
          this.isAdmin = user.role === 'admin';
          console.log('✅ Datos actualizados desde observable:', this.currentUser);

          if (this.isAdmin) {
            this.loadCounts();
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error obteniendo usuario:', error);
        if (error.status === 401) {
          this.authService.logout();
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
