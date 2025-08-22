import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  userEmail: string = '';
  totalIngredientes: number = 0;
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('🔵 DashboardComponent iniciado');
    this.loadUserData();
    this.loadIngredientesCount();
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
    }
    this.authSubscription = this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user;
        this.userEmail = user?.email || 'Usuario';
      },
      error: (error) => {
        console.error('Error obteniendo usuario:', error);
        const userData = this.authService.getUserData();
        if (userData) {
          this.currentUser = userData;
          this.userEmail = userData.email;
        }
      }
    });
  }
  private loadIngredientesCount() {
      this.http.get<any[]>('http://localhost:5000/api/ingredientes')
        .subscribe({
          next: (ingredientes) => {
            this.totalIngredientes = ingredientes.length;
          },
          error: (error) => {
            this.totalIngredientes = 0;
          },
          complete: () => {
            console.log('🏁 Carga de ingredientes completada');
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
