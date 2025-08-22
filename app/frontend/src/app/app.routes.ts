import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IngredientesComponent } from './pages/ingredientes/ingredientes.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistrarComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  // Nuevas rutas que crearás después
  {
    path: 'ingredientes',
    component: IngredientesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tortas',
    loadComponent: () => import('./pages/tortas/tortas.component').then(m => m.TortasComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'subrecetas',
    loadComponent: () => import('./pages/subrecetas/subrecetas.component').then(m => m.SubrecetasComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
