import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../auth/models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    correo: '',
    contrasena: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/users']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['authRequired']) {
        this.errorMessage = 'Debes iniciar sesión para acceder a esta sección';
      }
    });
  }

  onSubmit(): void {
    this.clearMessages();

    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveUser(response.user);

        this.successMessage = response.message;
        this.loading = false;

        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'Ocurrió un error al iniciar sesión';
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private isFormValid(): boolean {
    if (!this.credentials.correo.trim()) {
      this.errorMessage = 'El correo es obligatorio';
      return false;
    }

    if (!this.credentials.contrasena.trim()) {
      this.errorMessage = 'La contraseña es obligatoria';
      return false;
    }

    if (this.credentials.contrasena.trim().length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }
}