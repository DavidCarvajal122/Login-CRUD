import { Routes } from '@angular/router';
import { LoginComponent } from './features/pages/login/login.component';
import { UsersComponent } from './features/pages/users/users.component';
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
    path: '**',
    redirectTo: ''
  }
];