import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EnterpriseService } from '../../services/enterprise.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { EnterpriseDto, CreateEnterpriseDto, UpdateEnterpriseDto } from '../../models/enterprise.model';

@Component({
  selector: 'app-enterprises',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid px-lg-4 py-4">
      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-bold" style="font-size: 0.72rem;">
              MÓDULO ORGANIZACIONAL (SPA)
            </span>
            <span class="badge bg-light text-muted border font-monospace" style="font-size: 0.72rem;">REST: /api/enterprises</span>
          </div>
          <h2 class="fw-bold mb-1 text-dark" style="letter-spacing: -0.02em;">
            Directorio y Registro de Empresas
          </h2>
          <p class="text-muted mb-0 small">
            Supervisión legal, identificadores tributarios (NIT) y control de estado operativo.
          </p>
        </div>

        <div class="d-flex align-items-center gap-2">
          @if (authService.isAdmin()) {
            <button class="btn btn-firmeza-primary shadow-sm" (click)="openCreateModal()">
              <i class="bi bi-plus-circle-fill"></i> Registrar Empresa
            </button>
          }
          <button class="btn btn-firmeza-secondary" (click)="loadEnterprises(1)" title="Actualizar">
            <i class="bi bi-arrow-clockwise"></i> Recargar
          </button>
        </div>
      </div>

      <!-- Banner de Permisos según Perfil -->
      <div class="alert border-0 shadow-sm d-flex align-items-center gap-3 mb-4 rounded-4"
           [style.background]="authService.isAdmin() ? '#fffbeb' : '#ecfdf5'"
           [style.borderLeft]="authService.isAdmin() ? '4px solid #f59e0b !important' : '4px solid #10b981 !important'">
        <div class="p-2 rounded-3 text-dark flex-shrink-0" [ngClass]="authService.isAdmin() ? 'bg-warning' : 'bg-success text-white'">
          <i class="bi" [ngClass]="authService.isAdmin() ? 'bi-shield-lock-fill' : 'bi-person-check-fill'"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold text-dark">Perfil Activo: {{ authService.role() }}</span>
            <span class="badge" [ngClass]="authService.isAdmin() ? 'bg-warning text-dark' : 'bg-success text-white'">
              {{ authService.isAdmin() ? 'Acceso Total (Crear, Editar, Suspender)' : 'Solo Lectura (Auditoría)' }}
            </span>
          </div>
          <small class="text-muted">
            {{ authService.isAdmin() ? 'Permisos totales para gestionar empresas bajo el principio de baja lógica.' : 'Modo de consulta habilitado para inspeccionar registros corporativos sin capacidad de alteración destructiva.' }}
          </small>
        </div>
      </div>

      <!-- Tarjetas de Métricas KPI -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-primary" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-buildings"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Total Registros</div>
              <div class="stat-value fs-4">{{ totalRecords() }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-success" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-check2-circle"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Activas / Vigentes</div>
              <div class="stat-value fs-4 text-success">{{ activeCount() }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-danger" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-slash-circle"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Suspendidas (Baja Lógica)</div>
              <div class="stat-value fs-4 text-danger">{{ suspendedCount() }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-warning" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-briefcase"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Tipos Societarios</div>
              <div class="stat-value fs-4 text-warning">6 Figuras</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="card card-firmeza p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control form-control-firmeza border-start-0 ps-0"
                     placeholder="Buscar por Razón Social, Nombre Comercial, NIT o Correo..."
                     [(ngModel)]="searchQuery" (keyup)="applyFilters()">
              @if (searchQuery) {
                <button class="btn btn-outline-secondary border" type="button" (click)="searchQuery = ''; applyFilters()">
                  <i class="bi bi-x-lg"></i>
                </button>
              }
            </div>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select form-select-firmeza" [(ngModel)]="statusFilter" (change)="loadEnterprises(1)">
              <option value="">Todos los Estados</option>
              <option value="true">Solo Activas</option>
              <option value="false">Solo Suspendidas</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select class="form-select form-select-firmeza" [(ngModel)]="typeFilter" (change)="applyFilters()">
              <option value="">Todos los Tipos</option>
              <option value="1">Persona Natural</option>
              <option value="2">Corporación (S.A.)</option>
              <option value="3">S.A.S. / Ltda.</option>
              <option value="4">Sociedad Colectiva</option>
              <option value="5">Sin Ánimo de Lucro</option>
              <option value="6">Cooperativa</option>
            </select>
          </div>

          <div class="col-12 col-md-2">
            <select class="form-select form-select-firmeza" [(ngModel)]="pageSize" (change)="loadEnterprises(1)">
              <option [ngValue]="5">5 por página</option>
              <option [ngValue]="10">10 por página</option>
              <option [ngValue]="25">25 por página</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla de Empresas -->
      <div class="card card-firmeza overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-firmeza align-middle">
            <thead>
              <tr>
                <th class="ps-4">Empresa / Razón Social</th>
                <th>NIT / TaxId</th>
                <th>Tipo Societario</th>
                <th>Contacto Directo</th>
                <th>Estado</th>
                <th class="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                    Consultando Firmeza.Api...
                  </td>
                </tr>
              } @else if (filteredEnterprises().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block text-secondary mb-2"></i>
                    No se encontraron registros de empresas con los filtros aplicados.
                  </td>
                </tr>
              } @else {
                @for (item of filteredEnterprises(); track item.id; let i = $index) {
                  <tr>
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-3">
                        <div class="monogram-avatar" [ngClass]="'avatar-color-' + ((i % 6) + 1)">
                          {{ item.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark fs-6">{{ item.name }}</div>
                          <div class="text-muted small">{{ item.tradeName || 'Sin nombre comercial' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="code-pill">
                        <i class="bi bi-upc-scan text-muted"></i>
                        <span>{{ item.taxId }}</span>
                        <button class="code-copy-btn" (click)="copyText(item.taxId, 'NIT')" title="Copiar NIT">
                          <i class="bi bi-copy"></i>
                        </button>
                      </span>
                    </td>
                    <td>
                      <span class="badge border px-2 py-1" [ngClass]="getTypeBadgeClass(item.type)">
                        {{ getTypeName(item.type) }}
                      </span>
                    </td>
                    <td>
                      <div><a [href]="'mailto:' + item.email" class="text-decoration-none small text-dark"><i class="bi bi-envelope text-primary me-1"></i>{{ item.email }}</a></div>
                      <div><a [href]="'tel:' + item.phone" class="text-decoration-none small text-muted"><i class="bi bi-telephone me-1"></i>{{ item.phone }}</a></div>
                    </td>
                    <td>
                      @if (item.isActive) {
                        <span class="status-pill status-pill-active"><span class="status-dot-pulse"></span>Activa</span>
                      } @else {
                        <span class="status-pill status-pill-suspended"><i class="bi bi-slash-circle me-1"></i>Suspendida</span>
                      }
                    </td>
                    <td class="text-end pe-4">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-sm btn-outline-secondary" (click)="openDetailModal(item)" title="Ver Detalle">
                          <i class="bi bi-eye"></i>
                        </button>
                        <a [routerLink]="['/clients']" [queryParams]="{ enterpriseId: item.id }" class="btn btn-sm btn-outline-success" title="Ver clientes asociados">
                          <i class="bi bi-people"></i>
                        </a>
                        @if (authService.isAdmin()) {
                          <button class="btn btn-sm btn-outline-primary" (click)="openEditModal(item)" title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" (click)="openSuspendModal(item)" title="Suspender (Baja Lógica)" [disabled]="!item.isActive">
                            <i class="bi bi-slash-circle"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center flex-wrap gap-2 px-4 py-3">
          <span class="small text-muted">
            Mostrando {{ filteredEnterprises().length }} de {{ totalRecords() }} registros
          </span>
          <nav>
            <ul class="pagination pagination-sm mb-0 gap-1">
              <li class="page-item" [class.disabled]="currentPage() === 1">
                <button class="page-link" (click)="loadEnterprises(currentPage() - 1)"><i class="bi bi-chevron-left"></i></button>
              </li>
              <li class="page-item active">
                <span class="page-link">{{ currentPage() }}</span>
              </li>
              <li class="page-item" [class.disabled]="currentPage() >= totalPages()">
                <button class="page-link" (click)="loadEnterprises(currentPage() + 1)"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- MODAL: Crear Empresa -->
    @if (showCreateModal()) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header modal-header-gradient">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-building-add fs-4"></i>
                <h5 class="modal-title fw-bold mb-0">Registrar Nueva Empresa (API REST)</h5>
              </div>
              <button type="button" class="btn-close btn-close-white" (click)="showCreateModal.set(false)"></button>
            </div>
            <form (ngSubmit)="handleCreate()">
              <div class="modal-body p-4">
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Razón Social <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="createDto.name" name="name" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Nombre Comercial <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="createDto.tradeName" name="tradeName" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">NIT / TaxId <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza font-monospace" [(ngModel)]="createDto.taxId" name="taxId" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Figura Jurídica <span class="text-danger">*</span></label>
                    <select class="form-select form-select-firmeza" [(ngModel)]="createDto.type" name="type" required>
                      <option [ngValue]="1">Persona Natural</option>
                      <option [ngValue]="2">Corporación (S.A.)</option>
                      <option [ngValue]="3">S.A.S. / Ltda.</option>
                      <option [ngValue]="4">Sociedad Colectiva</option>
                      <option [ngValue]="5">Sin Ánimo de Lucro</option>
                      <option [ngValue]="6">Cooperativa</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Correo Corporativo <span class="text-danger">*</span></label>
                    <input type="email" class="form-control form-control-firmeza" [(ngModel)]="createDto.email" name="email" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Teléfono <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="createDto.phone" name="phone" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label form-label-firmeza">Dirección Principal <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="createDto.address" name="address" required>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light px-4 py-3">
                <button type="button" class="btn btn-secondary rounded-3" (click)="showCreateModal.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-firmeza-primary">Guardar en Firmeza.Api</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: Editar Empresa -->
    @if (showEditModal() && selectedEnterprise) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header bg-dark text-white p-3 px-4">
              <h5 class="modal-title fw-bold mb-0">Actualizar Datos de Empresa (PUT /api/enterprises/{{ selectedEnterprise.id }})</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showEditModal.set(false)"></button>
            </div>
            <form (ngSubmit)="handleUpdate()">
              <div class="modal-body p-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Razón Social <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="editDto.name" name="name" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Nombre Comercial <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="editDto.tradeName" name="tradeName" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">NIT / TaxId <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza font-monospace" [(ngModel)]="editDto.taxId" name="taxId" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Figura Jurídica <span class="text-danger">*</span></label>
                    <select class="form-select form-select-firmeza" [(ngModel)]="editDto.type" name="type" required>
                      <option [ngValue]="1">Persona Natural</option>
                      <option [ngValue]="2">Corporación (S.A.)</option>
                      <option [ngValue]="3">S.A.S. / Ltda.</option>
                      <option [ngValue]="4">Sociedad Colectiva</option>
                      <option [ngValue]="5">Sin Ánimo de Lucro</option>
                      <option [ngValue]="6">Cooperativa</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Correo Corporativo <span class="text-danger">*</span></label>
                    <input type="email" class="form-control form-control-firmeza" [(ngModel)]="editDto.email" name="email" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Teléfono <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="editDto.phone" name="phone" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label form-label-firmeza">Dirección Principal <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="editDto.address" name="address" required>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light px-4 py-3">
                <button type="button" class="btn btn-secondary rounded-3" (click)="showEditModal.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary rounded-3">Actualizar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: Ficha Integral de Empresa -->
    @if (showDetailModal() && selectedEnterprise) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header bg-dark text-white p-3 px-4">
              <h5 class="modal-title fw-bold mb-0">Ficha Corporativa</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showDetailModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-4 bg-light">
                <div class="monogram-avatar monogram-lg avatar-color-1">
                  {{ selectedEnterprise.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h5 class="fw-bold mb-0 text-dark">{{ selectedEnterprise.name }}</h5>
                  <div class="text-muted small">{{ selectedEnterprise.tradeName }}</div>
                  <div class="mt-2">
                    @if (selectedEnterprise.isActive) {
                      <span class="status-pill status-pill-active"><span class="status-dot-pulse"></span>Activa</span>
                    } @else {
                      <span class="status-pill status-pill-suspended">Suspendida (Baja Lógica)</span>
                    }
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-6">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">NIT</small>
                    <span class="code-pill mt-1">{{ selectedEnterprise.taxId }}</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">FIGURA JURÍDICA</small>
                    <strong class="text-dark d-block mt-1 small">{{ getTypeName(selectedEnterprise.type) }}</strong>
                  </div>
                </div>
                <div class="col-12">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">CORREO</small>
                    <span class="text-primary fw-semibold small">{{ selectedEnterprise.email }}</span>
                  </div>
                </div>
                <div class="col-12">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">DIRECCIÓN</small>
                    <span class="text-dark small">{{ selectedEnterprise.address }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top">
                <a [routerLink]="['/clients']" [queryParams]="{ enterpriseId: selectedEnterprise.id }" (click)="showDetailModal.set(false)"
                   class="btn btn-outline-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-people-fill"></i>
                  <span>Ver Clientes Vinculados a esta Empresa</span>
                </a>
              </div>
            </div>
            <div class="modal-footer bg-light px-4 py-2">
              <button type="button" class="btn btn-secondary w-100 rounded-3" (click)="showDetailModal.set(false)">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: Confirmar Suspensión (Baja Lógica) -->
    @if (showSuspendModal() && selectedEnterprise) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header modal-header-danger">
              <h5 class="modal-title fw-bold mb-0">Suspender Empresa (Baja Lógica)</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showSuspendModal.set(false)"></button>
            </div>
            <div class="modal-body text-center p-4">
              <div class="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3">
                <i class="bi bi-archive fs-1"></i>
              </div>
              <h5 class="fw-bold mb-2">¿Confirmas la suspensión en Firmeza.Api?</h5>
              <strong class="text-danger fs-5 d-block mb-3">{{ selectedEnterprise.name }}</strong>
              <div class="alert alert-light border text-start small text-muted mb-0">
                <i class="bi bi-info-circle text-primary me-1"></i>
                Se ejecutará <code>DELETE /api/enterprises/{{ selectedEnterprise.id }}</code> que establece <code>IsActive = false</code> sin eliminar físicamente registros históricos.
              </div>
            </div>
            <div class="modal-footer bg-light justify-content-between px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-3" (click)="showSuspendModal.set(false)">Cancelar</button>
              <button type="button" class="btn btn-danger fw-bold rounded-3" (click)="handleSuspend()">
                Confirmar Suspensión
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class EnterprisesComponent implements OnInit {
  enterpriseService = inject(EnterpriseService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  enterprises = signal<EnterpriseDto[]>([]);
  filteredEnterprises = signal<EnterpriseDto[]>([]);
  loading = signal<boolean>(false);

  totalRecords = signal<number>(0);
  activeCount = signal<number>(0);
  suspendedCount = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  pageSize = 10;

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailModal = signal(false);
  showSuspendModal = signal(false);
  selectedEnterprise: EnterpriseDto | null = null;

  createDto: CreateEnterpriseDto = {
    name: '',
    tradeName: '',
    taxId: '',
    type: 3,
    email: '',
    phone: '',
    address: ''
  };

  editDto: UpdateEnterpriseDto = {
    name: '',
    tradeName: '',
    taxId: '',
    type: 3,
    email: '',
    phone: '',
    address: ''
  };

  ngOnInit() {
    this.loadEnterprises(1);
  }

  loadEnterprises(page: number = 1) {
    this.loading.set(true);
    this.currentPage.set(page);

    const onlyActive = this.statusFilter === 'true' ? true : this.statusFilter === 'false' ? false : undefined;

    this.enterpriseService.getPaged(page, this.pageSize, onlyActive).subscribe(res => {
      this.loading.set(false);
      if (res && res.data) {
        this.enterprises.set(res.data);
        this.totalRecords.set(res.totalRecords);
        this.totalPages.set(res.totalPages || 1);
        this.activeCount.set(res.data.filter(e => e.isActive).length);
        this.suspendedCount.set(res.data.filter(e => !e.isActive).length);
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    const type = this.typeFilter;

    let result = this.enterprises().filter(item => {
      const matchQ = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.tradeName && item.tradeName.toLowerCase().includes(q)) ||
        (item.taxId && item.taxId.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q));

      const matchType = !type || item.type.toString() === type;
      return matchQ && matchType;
    });

    this.filteredEnterprises.set(result);
  }

  copyText(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    this.toastService.show(`${label} copiado al portapapeles: ${text}`, 'info');
  }

  getTypeName(type: number): string {
    const map: Record<number, string> = {
      1: 'Persona Natural',
      2: 'Corporación (S.A.)',
      3: 'S.A.S. / Ltda.',
      4: 'Sociedad Colectiva',
      5: 'Sin Ánimo de Lucro',
      6: 'Cooperativa'
    };
    return map[type] || 'General';
  }

  getTypeBadgeClass(type: number): string {
    const map: Record<number, string> = {
      1: 'bg-info-subtle text-info border-info-subtle',
      2: 'bg-primary-subtle text-primary border-primary-subtle',
      3: 'bg-indigo-subtle text-primary border-primary-subtle',
      4: 'bg-warning-subtle text-warning border-warning-subtle',
      5: 'bg-secondary-subtle text-secondary border-secondary-subtle',
      6: 'bg-success-subtle text-success border-success-subtle'
    };
    return map[type] || 'bg-light text-dark';
  }

  openCreateModal() {
    this.createDto = {
      name: '',
      tradeName: '',
      taxId: '',
      type: 3,
      email: '',
      phone: '',
      address: ''
    };
    this.showCreateModal.set(true);
  }

  handleCreate() {
    this.enterpriseService.create(this.createDto).subscribe(res => {
      this.showCreateModal.set(false);
      this.toastService.show('Empresa creada exitosamente en Firmeza.Api', 'success');
      this.loadEnterprises(1);
    });
  }

  openEditModal(item: EnterpriseDto) {
    this.selectedEnterprise = item;
    this.editDto = {
      name: item.name,
      tradeName: item.tradeName,
      taxId: item.taxId,
      type: item.type,
      email: item.email,
      phone: item.phone,
      address: item.address
    };
    this.showEditModal.set(true);
  }

  handleUpdate() {
    if (!this.selectedEnterprise) return;
    this.enterpriseService.update(this.selectedEnterprise.id, this.editDto).subscribe(() => {
      this.showEditModal.set(false);
      this.toastService.show('Empresa actualizada exitosamente', 'success');
      this.loadEnterprises(this.currentPage());
    });
  }

  openDetailModal(item: EnterpriseDto) {
    this.selectedEnterprise = item;
    this.showDetailModal.set(true);
  }

  openSuspendModal(item: EnterpriseDto) {
    this.selectedEnterprise = item;
    this.showSuspendModal.set(true);
  }

  handleSuspend() {
    if (!this.selectedEnterprise) return;
    this.enterpriseService.delete(this.selectedEnterprise.id).subscribe(() => {
      this.showSuspendModal.set(false);
      this.toastService.show('Empresa suspendida lógicamente (IsActive = false)', 'warning');
      this.loadEnterprises(this.currentPage());
    });
  }
}
