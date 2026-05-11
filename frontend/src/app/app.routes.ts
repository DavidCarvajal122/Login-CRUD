import { Routes } from '@angular/router';
import { LoginComponent } from './features/pages/login/login.component';
import { UsersComponent } from './features/pages/users/users.component';
import { PlanesComponent } from './features/pages/planes/planes.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'planes',
    component: PlanesComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];