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
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistrarComponent },
  {path: 'theme-toggle', component: ThemeToggleComponent},
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
    component: TortasComponent,
    canActivate: [AuthGuard]
  },
  {
      path: 'tortas/nueva',
      component: AgregarTortaComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'tortas/editar/:id',
      component: AgregarTortaComponent,
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
  {
    path: 'tortas/presupuesto/:id',
    component: PresupuestoTortaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tortas/presupuestos',
    component: PresupuestoTortaComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
