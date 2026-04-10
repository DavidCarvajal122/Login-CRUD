import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../auth/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  formData: User = {
    nombre: '',
    correo: '',
    contrasena: ''
  };

  editingUserId: number | null = null;

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.clearMessages();

    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'No se pudieron cargar los usuarios';
      }
    });
  }

  onSubmit(): void {
    this.clearMessages();

    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    if (this.editingUserId !== null) {
      this.userService.updateUser(this.editingUserId, this.formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.resetForm();
          this.loadUsers();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error?.error?.message || 'No se pudo actualizar el usuario';
        }
      });
    } else {
      this.userService.createUser(this.formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.resetForm();
          this.loadUsers();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error?.error?.message || 'No se pudo crear el usuario';
        }
      });
    }
  }

  editUser(user: User): void {
    this.editingUserId = user.id ?? null;
    this.formData = {
      nombre: user.nombre,
      correo: user.correo,
      contrasena: ''
    };

    this.clearMessages();
  }

  deleteUser(id: number | undefined): void {
    if (!id) {
      return;
    }

    const confirmed = window.confirm('¿Deseas eliminar este usuario?');

    if (!confirmed) {
      return;
    }

    this.clearMessages();
    this.loading = true;

    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadUsers();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'No se pudo eliminar el usuario';
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
    this.clearMessages();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }

  private resetForm(): void {
    this.formData = {
      nombre: '',
      correo: '',
      contrasena: ''
    };

    this.editingUserId = null;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private isFormValid(): boolean {
    if (!this.formData.nombre.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return false;
    }

    if (!this.formData.correo.trim()) {
      this.errorMessage = 'El correo es obligatorio';
      return false;
    }

    if (this.editingUserId === null && !this.formData.contrasena?.trim()) {
      this.errorMessage = 'La contraseña es obligatoria';
      return false;
    }

    if (
      this.formData.contrasena &&
      this.formData.contrasena.trim().length > 0 &&
      this.formData.contrasena.trim().length < 6
    ) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }
}