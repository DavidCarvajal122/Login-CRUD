import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlanService } from '../../../core/services/plan.service';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements OnInit {

  // ── Listas ──────────────────────────────────────────
  planes:        any[] = [];
  categorias:    any[] = [];
  tiposCompania: any[] = [];
  paises:        any[] = [];
  provincias:    any[] = [];
  ciudades:      any[] = [];

  // ── Formulario ──────────────────────────────────────
  formData: any = this.emptyForm();
  editingId: number | null = null;

  // ── UI ──────────────────────────────────────────────
  loading       = false;
  errorMessage  = '';
  successMessage = '';

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  // ── Carga inicial ────────────────────────────────────
  loadAll(): void {
    this.loadPlanes();
    this.planService.getCategorias().subscribe({ next: d => this.categorias = d });
    this.planService.getTiposCompania().subscribe({ next: d => this.tiposCompania = d });
    this.planService.getPaises().subscribe({ next: d => this.paises = d });
  }

  loadPlanes(): void {
    this.loading = true;
    this.planService.getPlanes().subscribe({
      next: d  => { this.planes = d; this.loading = false; },
      error: e => { this.loading = false; this.errorMessage = e?.error?.message || 'Error al cargar planes'; }
    });
  }

  // ── Cascada ubicaciones ──────────────────────────────
  onPaisChange(): void {
    this.provincias = [];
    this.ciudades   = [];
    this.formData.id_provincia = '';
    this.formData.id_ciudad    = '';
    if (this.formData.id_pais) {
      this.planService.getProvincias(+this.formData.id_pais)
        .subscribe({ next: d => this.provincias = d });
    }
  }

  onProvinciaChange(): void {
    this.ciudades = [];
    this.formData.id_ciudad = '';
    if (this.formData.id_provincia) {
      this.planService.getCiudades(+this.formData.id_provincia)
        .subscribe({ next: d => this.ciudades = d });
    }
  }

  // ── Guardar (crear o editar) ─────────────────────────
  onSubmit(): void {
    this.clearMessages();
    if (!this.isFormValid()) return;

    this.loading = true;
    const payload = {
      nombre:           this.formData.nombre,
      descripcion:      this.formData.descripcion,
      presupuesto_min:  +this.formData.presupuesto_min,
      presupuesto_max:  +this.formData.presupuesto_max,
      id_categoria:     +this.formData.id_categoria,
      id_tipo_compania: +this.formData.id_tipo_compania,
      id_ciudad:        this.formData.id_ciudad ? +this.formData.id_ciudad : null,
      privacidad:       this.formData.privacidad
    };

    const op = this.editingId !== null
      ? this.planService.updatePlan(this.editingId, payload)
      : this.planService.createPlan(payload);

    op.subscribe({
      next: r => {
        this.successMessage = r.message;
        this.resetForm();
        this.loadPlanes();
      },
      error: e => {
        this.loading = false;
        this.errorMessage = e?.error?.message || 'Error al guardar el plan';
      }
    });
  }

  // ── Editar ────────────────────────────────────────────
  editPlan(plan: any): void {
    this.clearMessages();
    this.editingId = plan.id;
    this.formData = {
      nombre:           plan.nombre,
      descripcion:      plan.descripcion,
      presupuesto_min:  plan.presupuesto_min,
      presupuesto_max:  plan.presupuesto_max,
      id_categoria:     plan.id_categoria,
      id_tipo_compania: plan.id_tipo_compania,
      id_pais:          '',
      id_provincia:     '',
      id_ciudad:        plan.id_ciudad || '',
      privacidad:       plan.privacidad === 1
    };
  }

  // ── Eliminar ──────────────────────────────────────────
  deletePlan(id: number): void {
    if (!confirm('¿Deseas eliminar este plan?')) return;
    this.clearMessages();
    this.planService.deletePlan(id).subscribe({
      next: r => { this.successMessage = r.message; this.loadPlanes(); },
      error: e => { this.errorMessage = e?.error?.message || 'Error al eliminar'; }
    });
  }

  // ── Utilidades ────────────────────────────────────────
  cancelEdit(): void { this.resetForm(); this.clearMessages(); }

  logout(): void { this.authService.logout(); this.router.navigate(['']); }

  getNombreCategoria(id: number): string {
    return this.categorias.find(c => c.id === id)?.nombre || '—';
  }

  getNombreTipo(id: number): string {
    return this.tiposCompania.find(t => t.id === id)?.nombre || '—';
  }

  // ── Validaciones ──────────────────────────────────────
  private isFormValid(): boolean {
    const { nombre, descripcion, presupuesto_min, presupuesto_max, id_categoria, id_tipo_compania } = this.formData;

    if (!nombre?.trim())       { this.errorMessage = 'El nombre es obligatorio'; return false; }
    if (!descripcion?.trim())  { this.errorMessage = 'La descripción es obligatoria'; return false; }
    if (presupuesto_min === '' || presupuesto_min == null) { this.errorMessage = 'El presupuesto mínimo es obligatorio'; return false; }
    if (presupuesto_max === '' || presupuesto_max == null) { this.errorMessage = 'El presupuesto máximo es obligatorio'; return false; }
    if (+presupuesto_min < 0)  { this.errorMessage = 'El presupuesto mínimo no puede ser negativo'; return false; }
    if (+presupuesto_max < 0)  { this.errorMessage = 'El presupuesto máximo no puede ser negativo'; return false; }
    if (+presupuesto_max < +presupuesto_min) { this.errorMessage = 'El presupuesto máximo debe ser mayor o igual al mínimo'; return false; }
    if (!id_categoria)         { this.errorMessage = 'Selecciona una categoría'; return false; }
    if (!id_tipo_compania)     { this.errorMessage = 'Selecciona un tipo de compañía'; return false; }

    return true;
  }

  private emptyForm(): any {
    return {
      nombre: '', descripcion: '',
      presupuesto_min: '', presupuesto_max: '',
      id_categoria: '', id_tipo_compania: '',
      id_pais: '', id_provincia: '', id_ciudad: '',
      privacidad: false
    };
  }

  private resetForm(): void {
    this.formData  = this.emptyForm();
    this.editingId = null;
    this.provincias = [];
    this.ciudades   = [];
    this.loading    = false;
  }

  private clearMessages(): void {
    this.errorMessage   = '';
    this.successMessage = '';
  }
}
