import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { EnterpriseService } from '../../services/enterprise.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ClientDto, CreateClientDto, UpdateClientDto } from '../../models/client.model';
import { EnterpriseDto } from '../../models/enterprise.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid px-lg-4 py-4">
      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-bold" style="font-size: 0.72rem;">
              CARTERA COMERCIAL (SPA)
            </span>
            <span class="badge bg-light text-muted border font-monospace" style="font-size: 0.72rem;">REST: /api/clients</span>
          </div>
          <h2 class="fw-bold mb-1 text-dark" style="letter-spacing: -0.02em;">
            Directorio de Clientes y Afiliaciones
          </h2>
          <p class="text-muted mb-0 small">
            Gestión de clientes validados y vinculación mandatoria a entidades empresariales.
          </p>
        </div>

        <div class="d-flex align-items-center gap-2">
          @if (authService.isAdmin()) {
            <button class="btn btn-firmeza-primary shadow-sm" (click)="openCreateModal()">
              <i class="bi bi-person-plus-fill"></i> Registrar Cliente
            </button>
          }
          <button class="btn btn-firmeza-secondary" (click)="loadClients(1)" title="Actualizar">
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
              {{ authService.isAdmin() ? 'Acceso Total' : 'Solo Lectura (Auditoría)' }}
            </span>
          </div>
          <small class="text-muted">
            {{ authService.isAdmin() ? 'Permisos totales para registrar y suspender clientes en Firmeza.Api.' : 'Modo de auditoría activo para examinar fichas de clientes y sus empresas asociadas.' }}
          </small>
        </div>
      </div>

      <!-- Tarjetas de Métricas KPI -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-primary" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-people-fill"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Total Clientes</div>
              <div class="stat-value fs-4">{{ totalRecords() }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-success" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-person-check-fill"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Clientes Activos</div>
              <div class="stat-value fs-4 text-success">{{ activeCount() }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-danger" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-person-x-fill"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Suspendidos</div>
              <div class="stat-value fs-4 text-danger">{{ suspendedCount() }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card py-3">
            <div class="stat-icon stat-icon-warning" style="width: 44px; height: 44px; font-size: 1.25rem;">
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div>
              <div class="stat-label" style="font-size: 0.72rem;">Promedio de Edad</div>
              <div class="stat-value fs-4 text-warning">{{ avgAge() }} años</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="card card-firmeza p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control form-control-firmeza border-start-0 ps-0"
                     placeholder="Buscar por nombre, documento o correo..."
                     [(ngModel)]="searchQuery" (keyup)="applyFilters()">
              @if (searchQuery) {
                <button class="btn btn-outline-secondary border" type="button" (click)="searchQuery = ''; applyFilters()">
                  <i class="bi bi-x-lg"></i>
                </button>
              }
            </div>
          </div>

          <!-- Filtro por Empresa Asociada -->
          <div class="col-12 col-md-3">
            <select class="form-select form-select-firmeza" [(ngModel)]="enterpriseFilter" (change)="applyFilters()">
              <option value="">Todas las Empresas Vinculadas</option>
              @for (ent of enterprises(); track ent.id) {
                <option [value]="ent.id">{{ ent.name }} ({{ ent.taxId }})</option>
              }
            </select>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select form-select-firmeza" [(ngModel)]="statusFilter" (change)="loadClients(1)">
              <option value="">Todos los Estados</option>
              <option value="true">Solo Activos</option>
              <option value="false">Solo Suspendidos</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select class="form-select form-select-firmeza" [(ngModel)]="pageSize" (change)="loadClients(1)">
              <option [ngValue]="5">5 por página</option>
              <option [ngValue]="10">10 por página</option>
              <option [ngValue]="25">25 por página</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla de Clientes -->
      <div class="card card-firmeza overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-firmeza align-middle">
            <thead>
              <tr>
                <th class="ps-4">Cliente / Nombre Completo</th>
                <th>Documento</th>
                <th>Empresa Asociada</th>
                <th>Edad</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th class="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                    Consultando Firmeza.Api...
                  </td>
                </tr>
              } @else if (filteredClients().length === 0) {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-people fs-1 d-block text-secondary mb-2"></i>
                    No se encontraron clientes registrados con los filtros aplicados.
                  </td>
                </tr>
              } @else {
                @for (item of filteredClients(); track item.id; let i = $index) {
                  <tr>
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-3">
                        <div class="monogram-avatar" [ngClass]="'avatar-color-' + ((i % 6) + 1)">
                          {{ getInitials(item.name) }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark fs-6">{{ item.name }}</div>
                          <div class="text-muted small">{{ item.age }} años</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="code-pill">
                        <i class="bi bi-person-vcard text-muted"></i>
                        <span>{{ item.document }}</span>
                        <button class="code-copy-btn" (click)="copyText(item.document, 'Documento')" title="Copiar Documento">
                          <i class="bi bi-copy"></i>
                        </button>
                      </span>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark small">{{ getEnterpriseName(item.enterpriseId) }}</div>
                      <span class="badge bg-light text-muted border font-monospace" style="font-size: 0.7rem;">
                        {{ getEnterpriseTaxId(item.enterpriseId) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border">{{ item.age }} años</span>
                    </td>
                    <td>
                      <div><a [href]="'mailto:' + item.email" class="text-decoration-none small text-dark"><i class="bi bi-envelope text-primary me-1"></i>{{ item.email }}</a></div>
                      <div><a [href]="'tel:' + item.phone" class="text-decoration-none small text-muted"><i class="bi bi-telephone me-1"></i>{{ item.phone }}</a></div>
                    </td>
                    <td>
                      @if (item.isActive) {
                        <span class="status-pill status-pill-active"><span class="status-dot-pulse"></span>Activo</span>
                      } @else {
                        <span class="status-pill status-pill-suspended"><i class="bi bi-slash-circle me-1"></i>Suspendido</span>
                      }
                    </td>
                    <td class="text-end pe-4">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-sm btn-outline-secondary" (click)="openDetailModal(item)" title="Ver Ficha">
                          <i class="bi bi-eye"></i>
                        </button>
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
            Mostrando {{ filteredClients().length }} de {{ totalRecords() }} registros
          </span>
          <nav>
            <ul class="pagination pagination-sm mb-0 gap-1">
              <li class="page-item" [class.disabled]="currentPage() === 1">
                <button class="page-link" (click)="loadClients(currentPage() - 1)"><i class="bi bi-chevron-left"></i></button>
              </li>
              <li class="page-item active">
                <span class="page-link">{{ currentPage() }}</span>
              </li>
              <li class="page-item" [class.disabled]="currentPage() >= totalPages()">
                <button class="page-link" (click)="loadClients(currentPage() + 1)"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- MODAL: Crear Cliente -->
    @if (showCreateModal()) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header modal-header-gradient">
              <h5 class="modal-title fw-bold mb-0"><i class="bi bi-person-plus-fill me-2"></i> Registrar Cliente (POST /api/clients)</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showCreateModal.set(false)"></button>
            </div>
            <form (ngSubmit)="handleCreate()">
              <div class="modal-body p-4">
                <div class="row g-3 mb-4">
                  <div class="col-md-7">
                    <label class="form-label form-label-firmeza">Nombres y Apellidos <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="createDto.name" name="name" required>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label form-label-firmeza">Edad (Años) <span class="text-danger">*</span></label>
                    <input type="number" class="form-control form-control-firmeza" [(ngModel)]="createDto.age" name="age" required min="0" max="150">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Documento de Identidad <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza font-monospace" [(ngModel)]="createDto.document" name="document" required minlength="5" maxlength="50">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Empresa Asociada <span class="text-danger">*</span></label>
                    <select class="form-select form-select-firmeza" [(ngModel)]="createDto.enterpriseId" name="enterpriseId" required>
                      <option value="">Seleccione una empresa...</option>
                      @for (ent of enterprises(); track ent.id) {
                        <option [value]="ent.id">{{ ent.name }} ({{ ent.taxId }})</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Correo Electrónico <span class="text-danger">*</span></label>
                    <input type="email" class="form-control form-control-firmeza" [(ngModel)]="createDto.email" name="email" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Teléfono de Contacto <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="createDto.phone" name="phone" required minlength="7" maxlength="50">
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light px-4 py-3">
                <button type="button" class="btn btn-secondary rounded-3" (click)="showCreateModal.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-firmeza-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: Editar Cliente -->
    @if (showEditModal() && selectedClient) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header bg-dark text-white p-3 px-4">
              <h5 class="modal-title fw-bold mb-0">Actualizar Datos de Cliente (PUT /api/clients/{{ selectedClient.id }})</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showEditModal.set(false)"></button>
            </div>
            <form (ngSubmit)="handleUpdate()">
              <div class="modal-body p-4">
                <div class="row g-3">
                  <div class="col-md-7">
                    <label class="form-label form-label-firmeza">Nombres y Apellidos <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="editDto.name" name="name" required>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label form-label-firmeza">Edad <span class="text-danger">*</span></label>
                    <input type="number" class="form-control form-control-firmeza" [(ngModel)]="editDto.age" name="age" required min="0" max="150">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Documento <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza font-monospace" [(ngModel)]="editDto.document" name="document" required minlength="5" maxlength="50">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Empresa Asociada <span class="text-danger">*</span></label>
                    <select class="form-select form-select-firmeza" [(ngModel)]="editDto.enterpriseId" name="enterpriseId" required>
                      <option value="">Seleccione una empresa...</option>
                      @for (ent of enterprises(); track ent.id) {
                        <option [value]="ent.id">{{ ent.name }} ({{ ent.taxId }})</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Correo <span class="text-danger">*</span></label>
                    <input type="email" class="form-control form-control-firmeza" [(ngModel)]="editDto.email" name="email" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-firmeza">Teléfono <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-firmeza" [(ngModel)]="editDto.phone" name="phone" required minlength="7" maxlength="50">
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

    <!-- MODAL: Ficha Integral de Cliente -->
    @if (showDetailModal() && selectedClient) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header bg-dark text-white p-3 px-4">
              <h5 class="modal-title fw-bold mb-0">Ficha Integral del Cliente</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showDetailModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-4 bg-light">
                <div class="monogram-avatar monogram-lg avatar-color-3">
                  {{ getInitials(selectedClient.name) }}
                </div>
                <div>
                  <h5 class="fw-bold mb-0 text-dark">{{ selectedClient.name }}</h5>
                  <div class="text-muted small">{{ selectedClient.age }} años • Persona Natural</div>
                  <div class="mt-2">
                    @if (selectedClient.isActive) {
                      <span class="status-pill status-pill-active"><span class="status-dot-pulse"></span>Activo en Sistema</span>
                    } @else {
                      <span class="status-pill status-pill-suspended">Suspendido (Baja Lógica)</span>
                    }
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-12">
                  <div class="p-3 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">EMPRESA ASOCIADA</small>
                    <div class="fw-bold text-dark fs-6 mt-1">{{ getEnterpriseName(selectedClient.enterpriseId) }}</div>
                    <small class="text-muted font-monospace">{{ getEnterpriseTaxId(selectedClient.enterpriseId) }}</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">DOCUMENTO</small>
                    <span class="code-pill mt-1">{{ selectedClient.document }}</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">EDAD REGISTRADA</small>
                    <strong class="text-dark d-block mt-1 small">{{ selectedClient.age }} años</strong>
                  </div>
                </div>
                <div class="col-12">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">CORREO ELECTRÓNICO</small>
                    <span class="text-primary fw-semibold small">{{ selectedClient.email }}</span>
                  </div>
                </div>
                <div class="col-12">
                  <div class="p-2 rounded-3 border bg-white">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">TELÉFONO</small>
                    <span class="text-dark small">{{ selectedClient.phone }}</span>
                  </div>
                </div>
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
    @if (showSuspendModal() && selectedClient) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-content-firmeza">
            <div class="modal-header modal-header-danger">
              <h5 class="modal-title fw-bold mb-0">Suspender Cliente (Baja Lógica)</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showSuspendModal.set(false)"></button>
            </div>
            <div class="modal-body text-center p-4">
              <div class="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3">
                <i class="bi bi-person-x fs-1"></i>
              </div>
              <h5 class="fw-bold mb-2">¿Confirmas la suspensión en Firmeza.Api?</h5>
              <strong class="text-danger fs-5 d-block mb-3">{{ selectedClient.name }}</strong>
              <div class="alert alert-light border text-start small text-muted mb-0">
                <i class="bi bi-info-circle text-primary me-1"></i>
                Se ejecutará <code>DELETE /api/clients/{{ selectedClient.id }}</code> que establece <code>IsActive = false</code> preservando todo el historial comercial.
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
export class ClientsComponent implements OnInit {
  clientService = inject(ClientService);
  enterpriseService = inject(EnterpriseService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);

  clients = signal<ClientDto[]>([]);
  filteredClients = signal<ClientDto[]>([]);
  enterprises = signal<EnterpriseDto[]>([]);
  enterprisesMap: Record<string, EnterpriseDto> = {};

  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);
  activeCount = signal<number>(0);
  suspendedCount = signal<number>(0);
  avgAge = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  searchQuery = '';
  enterpriseFilter = '';
  statusFilter = '';
  pageSize = 10;

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailModal = signal(false);
  showSuspendModal = signal(false);
  selectedClient: ClientDto | null = null;

  createDto: CreateClientDto = {
    name: '',
    age: 28,
    phone: '',
    email: '',
    document: '',
    enterpriseId: ''
  };

  editDto: UpdateClientDto = {
    name: '',
    age: 28,
    phone: '',
    email: '',
    document: '',
    enterpriseId: ''
  };

  ngOnInit() {
    this.enterpriseService.getPaged(1, 100).subscribe(res => {
      if (res && res.data) {
        this.enterprises.set(res.data);
        res.data.forEach(e => {
          this.enterprisesMap[e.id] = e;
        });
      }

      this.route.queryParams.subscribe(params => {
        if (params['enterpriseId']) {
          this.enterpriseFilter = params['enterpriseId'];
        }
        this.loadClients(1);
      });
    });
  }

  loadClients(page: number = 1) {
    this.loading.set(true);
    this.currentPage.set(page);

    const onlyActive = this.statusFilter === 'true' ? true : this.statusFilter === 'false' ? false : undefined;

    this.clientService.getPaged(page, this.pageSize, onlyActive).subscribe(res => {
      this.loading.set(false);
      if (res && res.data) {
        this.clients.set(res.data);
        this.totalRecords.set(res.totalRecords);
        this.totalPages.set(res.totalPages || 1);
        this.activeCount.set(res.data.filter(c => c.isActive).length);
        this.suspendedCount.set(res.data.filter(c => !c.isActive).length);
        if (res.data.length > 0) {
          const avg = Math.round(res.data.reduce((acc, c) => acc + (c.age || 0), 0) / res.data.length);
          this.avgAge.set(avg);
        }
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    const entId = this.enterpriseFilter;

    let result = this.clients().filter(item => {
      const matchQ = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.document && item.document.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q));

      const matchEnt = !entId || item.enterpriseId === entId;
      return matchQ && matchEnt;
    });

    this.filteredClients.set(result);
  }

  getInitials(name: string): string {
    if (!name) return 'CL';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getEnterpriseName(id: string): string {
    return this.enterprisesMap[id]?.name || 'Empresa General';
  }

  getEnterpriseTaxId(id: string): string {
    return this.enterprisesMap[id]?.taxId ? `NIT: ${this.enterprisesMap[id].taxId}` : 'NIT No disp.';
  }

  copyText(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    this.toastService.show(`${label} copiado al portapapeles: ${text}`, 'info');
  }

  openCreateModal() {
    this.createDto = {
      name: '',
      age: 28,
      phone: '',
      email: '',
      document: '',
      enterpriseId: this.enterprises().length > 0 ? this.enterprises()[0].id : ''
    };
    this.showCreateModal.set(true);
  }

  handleCreate() {
    if (!this.createDto.enterpriseId) {
      this.toastService.show('Debe asociar obligatoriamente una empresa', 'warning');
      return;
    }

    this.clientService.create(this.createDto).subscribe(() => {
      this.showCreateModal.set(false);
      this.toastService.show('Cliente registrado exitosamente en Firmeza.Api', 'success');
      this.loadClients(1);
    });
  }

  openEditModal(item: ClientDto) {
    this.selectedClient = item;
    this.editDto = {
      name: item.name,
      age: item.age,
      phone: item.phone,
      email: item.email,
      document: item.document,
      enterpriseId: item.enterpriseId
    };
    this.showEditModal.set(true);
  }

  handleUpdate() {
    if (!this.selectedClient) return;
    this.clientService.update(this.selectedClient.id, this.editDto).subscribe(() => {
      this.showEditModal.set(false);
      this.toastService.show('Datos del cliente actualizados exitosamente', 'success');
      this.loadClients(this.currentPage());
    });
  }

  openDetailModal(item: ClientDto) {
    this.selectedClient = item;
    this.showDetailModal.set(true);
  }

  openSuspendModal(item: ClientDto) {
    this.selectedClient = item;
    this.showSuspendModal.set(true);
  }

  handleSuspend() {
    if (!this.selectedClient) return;
    this.clientService.delete(this.selectedClient.id).subscribe(() => {
      this.showSuspendModal.set(false);
      this.toastService.show('Cliente suspendido lógicamente (IsActive = false)', 'warning');
      this.loadClients(this.currentPage());
    });
  }
}
