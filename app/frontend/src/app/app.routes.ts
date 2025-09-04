import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IngredientesComponent } from './pages/ingredientes/ingredientes.component';
import { AgregarIngredienteComponent } from './pages/agregar-ingrediente/agregar-ingrediente.component';
import { EditarIngredienteComponent } from './pages/editar-ingrediente/editar-ingrediente.component';
import { SubrecetasComponent } from './pages/subrecetas/subrecetas.component';
import { AgregarSubrecetaComponent } from './pages/agregar-subreceta/agregar-subreceta.component';
import { TortasComponent } from './pages/tortas/tortas.component';
import { AgregarTortaComponent } from './pages/agregar-torta/agregar-torta.component';
import { PresupuestoTortaComponent } from './pages/presupuesto-torta/presupuesto-torta.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { ThemeToggleComponent } from './pages/theme-toggle/theme-toggle.component';
import { UnderConstructionComponent } from './pages/under-construction/under-construction.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistrarComponent },
  { path: 'theme-toggle', component: ThemeToggleComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'auth-callback',
    component: AuthCallbackComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'under-construction',
    component: UnderConstructionComponent,
    canActivate: [AuthGuard]
  },
  // Rutas solo para administradores
  {
    path: 'ingredientes',
    component: IngredientesComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'ingredientes/agregar',
    component: AgregarIngredienteComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'ingredientes/editar/:id',
    component: EditarIngredienteComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'tortas',
    component: TortasComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'tortas/nueva',
    component: AgregarTortaComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'tortas/editar/:id',
    component: AgregarTortaComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'subrecetas',
    component: SubrecetasComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'subrecetas/agregar',
    component: AgregarSubrecetaComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'subrecetas/editar/:id',
    component: AgregarSubrecetaComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'tortas/presupuesto/:id',
    component: PresupuestoTortaComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'tortas/presupuestos',
    component: PresupuestoTortaComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '**', redirectTo: '/login' }
];
