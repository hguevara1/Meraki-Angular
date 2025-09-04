import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, RouterModule],
  template: `
    <div class="construction-container">
      <mat-card class="construction-card">
        <mat-card-content>
          <div class="content">
            <mat-icon class="icon">construction</mat-icon>
            <h2>Página en construcción</h2>
            <p>Esta sección está disponible solo para administradores.</p>
            <p>Contacta al administrador del sistema si necesitas acceso.</p>
            <button mat-raised-button color="primary" routerLink="/dashboard">
              Volver al Dashboard
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .construction-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 70vh;
      padding: 20px;
    }
    .construction-card {
      max-width: 400px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: #ff9800;
      margin-bottom: 20px;
    }
    h2 {
      color: #333;
      margin-bottom: 15px;
    }
    p {
      color: #666;
      margin-bottom: 10px;
    }
  `]
})
export class UnderConstructionComponent {}
