import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast show align-items-center border-0 text-white shadow-lg mb-2"
             [ngClass]="{
               'bg-success': toast.type === 'success',
               'bg-danger': toast.type === 'danger',
               'bg-warning text-dark': toast.type === 'warning',
               'bg-primary': toast.type === 'info'
             }" role="alert">
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
              <i class="bi" [ngClass]="{
                'bi-check-circle-fill': toast.type === 'success',
                'bi-x-circle-fill': toast.type === 'danger',
                'bi-exclamation-triangle-fill': toast.type === 'warning',
                'bi-info-circle-fill': toast.type === 'info'
              }"></i>
              <span>{{ toast.text }}</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="toastService.remove(toast.id)"></button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
