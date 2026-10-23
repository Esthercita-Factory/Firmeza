import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header>
      <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container-fluid px-lg-4">
          <!-- Logo y Marca -->
          <a class="brand-container me-4 text-decoration-none" routerLink="/dashboard">
            <div class="brand-icon-box">
              <i class="bi bi-shield-check"></i>
            </div>
            <div>
              <div class="brand-text-title">FIRMEZA</div>
              <div class="brand-text-subtitle">Gestión Empresarial</div>
            </div>
          </a>

          <!-- Botón Responsive -->
          <button class="navbar-toggler border-0 p-2 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Menú -->
          <div class="collapse navbar-collapse" id="navbarMain">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
              <li class="nav-item">
                <a class="nav-link nav-link-custom" routerLink="/dashboard" routerLinkActive="active">
                  <i class="bi bi-grid-1x2"></i> Inicio
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link nav-link-custom" routerLink="/enterprises" routerLinkActive="active">
                  <i class="bi bi-buildings"></i> Empresas
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link nav-link-custom" routerLink="/clients" routerLinkActive="active">
                  <i class="bi bi-people"></i> Clientes
                </a>
              </li>
            </ul>

            <!-- Sección de Perfil y Sesión -->
            <div class="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              <div class="dropdown">
                <button class="btn p-0 border-0 dropdown-toggle shadow-none" type="button" id="profileDropdown" data-bs-toggle="dropdown">
                  <span class="profile-pill" [ngClass]="authService.isAdmin() ? 'profile-pill-admin' : 'profile-pill-user'">
                    <i class="bi" [ngClass]="authService.isAdmin() ? 'bi-shield-lock-fill' : 'bi-person-check-fill'"></i>
                    <span>{{ authService.role() }}</span>
                  </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 p-2 mt-2" style="min-width: 200px;">
                  <li>
                    <a class="dropdown-item rounded-2 text-danger py-2 px-3 d-flex align-items-center gap-2" href="javascript:void(0)" (click)="logout()">
                      <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.toastService.show('Sesión cerrada exitosamente', 'info');
    this.router.navigate(['/login']);
  }
}
