import { Routes } from '@angular/router';
import { LoginComponent } from './features/pages/login/login.component';
import { UsersComponent } from './features/pages/users/users.component';
import { PlanesComponent } from './features/pages/planes/planes.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { RecomendacionesComponent } from './features/pages/recomendaciones/recomendaciones.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'planes',
    component: PlanesComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'recomendaciones',
    component: RecomendacionesComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];