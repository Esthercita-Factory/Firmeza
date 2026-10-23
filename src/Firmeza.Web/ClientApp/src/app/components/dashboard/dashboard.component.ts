import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EnterpriseService } from '../../services/enterprise.service';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid px-lg-4 py-4">
      <!-- Hero Banner -->
      <div class="card card-firmeza border-0 p-4 p-lg-5 mb-4 position-relative overflow-hidden"
           style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); color: white;">
        <div class="row align-items-center position-relative" style="z-index: 2;">
          <div class="col-lg-8">
            <h1 class="fw-bold mb-2 display-6 text-white" style="letter-spacing: -0.03em;">
              Gestión Empresarial y Comercial
            </h1>
            <p class="text-white-50 fs-6 mb-4 col-xl-10 lead" style="font-weight: 400;">
              Plataforma integral para la administración de empresas y clientes con control de seguridad y seguimiento en tiempo real.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <a routerLink="/enterprises" class="btn btn-firmeza-primary">
                <i class="bi bi-buildings"></i> Gestionar Empresas
              </a>
              <a routerLink="/clients" class="btn btn-light fw-bold px-3 py-2 rounded-3 text-dark">
                <i class="bi bi-people"></i> Directorio de Clientes
              </a>
            </div>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <div class="p-3 rounded-4 d-inline-block text-start"
                 style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); min-width: 250px;">
              <div class="small text-white-50 mb-1">Perfil Activo en Sesión:</div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="profile-pill" [ngClass]="authService.isAdmin() ? 'profile-pill-admin' : 'profile-pill-user'">
                  <i class="bi" [ngClass]="authService.isAdmin() ? 'bi-shield-lock-fill' : 'bi-person-check-fill'"></i>
                  <span>{{ authService.role() }}</span>
                </span>
              </div>
              <div class="small text-white-50" style="font-size: 0.78rem;">
                {{ authService.isAdmin() ? 'Acceso total para registrar, modificar y suspender.' : 'Modo de consulta y auditoría de solo lectura.' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de Métricas y KPIs -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="stat-card">
            <div class="stat-icon stat-icon-primary">
              <i class="bi bi-buildings"></i>
            </div>
            <div>
              <div class="stat-label">Empresas</div>
              <div class="stat-value">{{ enterprisesCount() }}</div>
              <div class="small text-muted">{{ activeEnterprisesCount() }} activas • {{ inactiveEnterprisesCount() }} suspendidas</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-lg-3">
          <div class="stat-card">
            <div class="stat-icon stat-icon-success">
              <i class="bi bi-people-fill"></i>
            </div>
            <div>
              <div class="stat-label">Clientes</div>
              <div class="stat-value">{{ clientsCount() }}</div>
              <div class="small text-muted">{{ activeClientsCount() }} activos • {{ inactiveClientsCount() }} suspendidos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Módulos Operativos -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-6">
          <div class="card card-firmeza card-firmeza-hover h-100 p-4 d-flex flex-column">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="monogram-avatar avatar-color-1">
                <i class="bi bi-buildings"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-dark">Módulo de Empresas</h5>
                <small class="text-muted">Organizaciones, NIT y Tipos Jurídicos</small>
              </div>
            </div>
            <p class="text-muted small mb-4 flex-grow-1">
              Gestión completa de empresas: registro, consulta, actualización de datos y control de estado activo/suspendido.
            </p>
            <a routerLink="/enterprises" class="btn btn-firmeza-secondary w-100 justify-content-center">
              <span>Ir a Empresas</span> <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="card card-firmeza card-firmeza-hover h-100 p-4 d-flex flex-column">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="monogram-avatar avatar-color-3">
                <i class="bi bi-people-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-dark">Módulo de Clientes</h5>
                <small class="text-muted">Directorio y Afiliación Empresarial</small>
              </div>
            </div>
            <p class="text-muted small mb-4 flex-grow-1">
              Directorio de clientes con validación de unicidad de documentos y vinculación obligatoria a empresas registradas.
            </p>
            <a routerLink="/clients" class="btn btn-firmeza-secondary w-100 justify-content-center">
              <span>Ir a Clientes</span> <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  enterpriseService = inject(EnterpriseService);
  clientService = inject(ClientService);

  enterprisesCount = signal<number>(0);
  activeEnterprisesCount = signal<number>(0);
  inactiveEnterprisesCount = signal<number>(0);

  clientsCount = signal<number>(0);
  activeClientsCount = signal<number>(0);
  inactiveClientsCount = signal<number>(0);

  ngOnInit() {
    this.enterpriseService.getPaged(1, 100).subscribe(res => {
      if (res && res.data) {
        this.enterprisesCount.set(res.totalRecords);
        this.activeEnterprisesCount.set(res.data.filter(e => e.isActive).length);
        this.inactiveEnterprisesCount.set(res.data.filter(e => !e.isActive).length);
      }
    });

    this.clientService.getPaged(1, 100).subscribe(res => {
      if (res && res.data) {
        this.clientsCount.set(res.totalRecords);
        this.activeClientsCount.set(res.data.filter(c => c.isActive).length);
        this.inactiveClientsCount.set(res.data.filter(c => !c.isActive).length);
      }
    });
  }
}
