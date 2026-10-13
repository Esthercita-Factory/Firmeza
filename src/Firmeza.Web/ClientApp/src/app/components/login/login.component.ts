import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row justify-content-center align-items-center py-5">
      <div class="col-12 col-md-9 col-lg-6 col-xl-5">
        <div class="card card-firmeza border-0 shadow-lg p-4 p-md-5">
          <div class="text-center mb-4">
            <div class="brand-icon-box mx-auto mb-3" style="width: 56px; height: 56px; border-radius: 14px; font-size: 1.75rem;">
              <i class="bi bi-shield-check"></i>
            </div>
            <h3 class="fw-bold mb-1 text-dark" style="letter-spacing: -0.02em;">Acceso Corporativo</h3>
            <p class="text-muted small mb-0">Cliente SPA Angular • Consumiendo Firmeza.Api</p>
          </div>

          <!-- Selector Rápido de 1 Clic -->
          <div class="p-3 rounded-4 mb-4" style="background: #f8fafc; border: 1px dashed #cbd5e1;">
            <div class="small fw-bold text-muted text-uppercase mb-2 text-center" style="font-size: 0.72rem; letter-spacing: 0.05em;">
              <i class="bi bi-lightning-charge-fill text-warning"></i> Acceso Rápido por Perfil:
            </div>
            <div class="d-grid gap-2">
              <button type="button" class="btn btn-sm btn-outline-warning text-dark fw-bold py-2 d-flex align-items-center justify-content-between px-3 rounded-3"
                      (click)="fillCredentials('admin@firmeza.com', 'adminSecretPassword123', 'Administrator')">
                <span class="d-flex align-items-center gap-2">
                  <i class="bi bi-shield-lock-fill text-warning"></i>
                  <span>Administrador</span>
                </span>
                <span class="badge bg-warning text-dark small">Acceso Total</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline-success text-dark fw-bold py-2 d-flex align-items-center justify-content-between px-3 rounded-3"
                      (click)="fillCredentials('auditor@firmeza.com', 'auditSecretPassword123', 'CorporateUser')">
                <span class="d-flex align-items-center gap-2">
                  <i class="bi bi-person-check-fill text-success"></i>
                  <span>Usuario Corporativo</span>
                </span>
                <span class="badge bg-success text-white small">Solo Lectura</span>
              </button>
            </div>
          </div>

          <!-- Formulario de Login -->
          <form (ngSubmit)="handleLogin()">
            <div class="mb-3">
              <label class="form-label form-label-firmeza">
                <i class="bi bi-envelope me-1 text-muted"></i> Correo Electrónico
              </label>
              <input type="email" class="form-control form-control-firmeza" [(ngModel)]="email" name="email" required>
            </div>

            <div class="mb-4">
              <label class="form-label form-label-firmeza">
                <i class="bi bi-lock me-1 text-muted"></i> Contraseña
              </label>
              <div class="input-group">
                <input [type]="showPassword ? 'text' : 'password'" class="form-control form-control-firmeza border-end-0" [(ngModel)]="password" name="password" required>
                <button class="btn btn-outline-secondary border-start-0 border" type="button" (click)="showPassword = !showPassword" style="border-color: var(--fm-border) !important;">
                  <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-firmeza-primary w-100 justify-content-center py-2 fw-bold" [disabled]="loading()">
              <i class="bi bi-box-arrow-in-right"></i>
              <span>{{ loading() ? 'Autenticando en Firmeza.Api...' : 'Iniciar Sesión (JWT)' }}</span>
            </button>
          </form>

          <div class="mt-4 pt-3 border-top text-center text-muted" style="font-size: 0.76rem;">
            <i class="bi bi-lock-fill text-success me-1"></i>
            <span>POST /api/auth/login • Token Bearer</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  email = 'admin@firmeza.com';
  password = 'adminSecretPassword123';
  showPassword = false;
  loading = signal(false);

  fillCredentials(e: string, p: string, role: string) {
    this.email = e;
    this.password = p;
    this.toastService.show(`Credenciales cargadas para ${role}. Haz clic en Iniciar Sesión.`, 'info');
  }

  handleLogin() {
    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe(res => {
      this.loading.set(false);
      if (res && res.token) {
        this.toastService.show(`Bienvenido ${res.email} (${res.role})`, 'success');
        this.router.navigate(['/enterprises']);
      } else {
        this.toastService.show('Error al iniciar sesión', 'danger');
      }
    });
  }
}
