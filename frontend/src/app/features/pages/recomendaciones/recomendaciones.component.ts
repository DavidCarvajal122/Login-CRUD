import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { PlanService } from '../../../core/services/plan.service';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './recomendaciones.component.html',
  styleUrls: ['./recomendaciones.component.css']
})
export class RecomendacionesComponent implements OnInit {

  // ── Dropdowns ────────────────────────────────────────
  categorias:    any[] = [];
  tiposCompania: any[] = [];

  // ── Formulario de preferencias ───────────────────────
  preferencias = {
    presupuesto_min:  '',
    presupuesto_max:  '',
    id_tipo_compania: '',
    categorias:       [] as number[],
    privacidad:       false,
    origen:           'todos'
  };

  // ── Resultados ───────────────────────────────────────
  recomendaciones: any[] = [];
  buscado        = false;
  loading        = false;
  errorMessage   = '';
  isAdmin = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private planService: PlanService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.planService.getCategorias().subscribe({ next: d => this.categorias = d });
    this.planService.getTiposCompania().subscribe({ next: d => this.tiposCompania = d });
  }

  // ── Toggle de categorías ─────────────────────────────
  toggleCategoria(id: number): void {
    const idx = this.preferencias.categorias.indexOf(id);
    if (idx === -1) {
      this.preferencias.categorias.push(id);
    } else {
      this.preferencias.categorias.splice(idx, 1);
    }
  }

  isCategoriaSeleccionada(id: number): boolean {
    return this.preferencias.categorias.includes(id);
  }

  // ── Generar recomendaciones ──────────────────────────
  generar(): void {
    this.errorMessage = '';

    if (!this.preferencias.presupuesto_min || !this.preferencias.presupuesto_max) {
      this.errorMessage = 'El rango de presupuesto es obligatorio';
      return;
    }

    if (+this.preferencias.presupuesto_max < +this.preferencias.presupuesto_min) {
      this.errorMessage = 'El presupuesto máximo debe ser mayor o igual al mínimo';
      return;
    }

    this.loading = true;
    this.buscado = false;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    const body = {
      presupuesto_min:  +this.preferencias.presupuesto_min,
      presupuesto_max:  +this.preferencias.presupuesto_max,
      id_tipo_compania: this.preferencias.id_tipo_compania || null,
      categorias:       this.preferencias.categorias,
      privacidad:       this.preferencias.privacidad,
      origen:           this.preferencias.origen
    };

    this.http
      .post<any>('https://login-crud-m5ez.onrender.com/api/recomendaciones', body, { headers })
      .subscribe({
        next: (res) => {
          console.log('Respuesta:', res);
          this.recomendaciones = res.recomendaciones;
          this.loading = false;
          this.buscado = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Error al generar recomendaciones';
          this.loading = false;
        },
      });
  }

  // ── Limpiar filtros ──────────────────────────────────
  limpiar(): void {
    this.preferencias = {
      presupuesto_min:  '',
      presupuesto_max:  '',
      id_tipo_compania: '',
      categorias:       [],
      privacidad:       false,
      origen:           'todos'
    };
    this.recomendaciones = [];
    this.buscado         = false;
    this.errorMessage    = '';
  }

  // ── Color del badge según compatibilidad ─────────────
  getBadgeClass(porcentaje: number): string {
    if (porcentaje >= 70) return 'badge-verde';
    if (porcentaje >= 40) return 'badge-amarillo';
    return 'badge-rojo';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
