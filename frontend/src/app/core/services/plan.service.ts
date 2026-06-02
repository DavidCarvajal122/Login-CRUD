import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private base = 'https://login-crud-m5ez.onrender.com/api';
  //private base = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // ── Planes ──────────────────────────────────────────
  getPlanes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/planes`, { headers: this.headers() });
  }
  createPlan(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/planes`, data, { headers: this.headers() });
  }
  updatePlan(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/planes/${id}`, data, { headers: this.headers() });
  }
  deletePlan(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/planes/${id}`, { headers: this.headers() });
  }

  // ── Categorías ──────────────────────────────────────
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/categorias`);
  }
  createCategoria(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/categorias`, data, { headers: this.headers() });
  }
  updateCategoria(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/categorias/${id}`, data, { headers: this.headers() });
  }
  deleteCategoria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/categorias/${id}`, { headers: this.headers() });
  }

  // ── Tipos Compañía ──────────────────────────────────
  getTiposCompania(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/tipos-compania`);
  }

  // ── Ubicaciones (cascada) ───────────────────────────
  getPaises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/ubicaciones/paises`);
  }
  getProvincias(paisId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/ubicaciones/provincias/${paisId}`);
  }
  getCiudades(provinciaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/ubicaciones/ciudades/${provinciaId}`);
  }
}
