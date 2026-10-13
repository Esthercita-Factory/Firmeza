import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  show(text: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') {
    const id = ++this.counter;
    this.toasts.update(current => [...current, { id, text, type }]);
    setTimeout(() => {
      this.remove(id);
    }, 4500);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
