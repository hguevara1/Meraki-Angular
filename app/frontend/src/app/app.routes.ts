import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IngredientesComponent } from './pages/ingredientes/ingredientes.component';
import { AgregarIngredienteComponent } from './pages/agregar-ingrediente/agregar-ingrediente.component';
import { EditarIngredienteComponent } from './pages/editar-ingrediente/editar-ingrediente.component';
import { SubrecetasComponent } from './pages/subrecetas/subrecetas.component';
import { AgregarSubrecetaComponent } from './pages/agregar-subreceta/agregar-subreceta.component';
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
    path: 'ingredientes/agregar',
    component: AgregarIngredienteComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ingredientes/editar/:id',
    component: EditarIngredienteComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tortas',
    loadComponent: () => import('./pages/tortas/tortas.component').then(m => m.TortasComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'subrecetas',
    component: SubrecetasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'subrecetas/agregar',
    component: AgregarSubrecetaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'subrecetas/editar/:id',
    component: AgregarSubrecetaComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
