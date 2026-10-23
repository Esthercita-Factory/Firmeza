import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';

  // Signals para manejar el estado de forma reactiva en toda la app
  currentUserRole = signal<string>(localStorage.getItem('firmeza_role') || '');

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('firmeza_token', response.token);

          // Si tu API también devuelve el rol, guárdalo (ej: response.role o response.isAdmin)
          const role = response.role || 'Admin';
          localStorage.setItem('firmeza_role', role);
          this.currentUserRole.set(role);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('firmeza_token');
    localStorage.removeItem('firmeza_role');
    this.currentUserRole.set('');
  }

  getToken(): string | null {
    return localStorage.getItem('firmeza_token');
  }

  // Métodos que tus componentes están buscando:
  isAdmin(): boolean {
    const role = this.currentUserRole() || localStorage.getItem('firmeza_role');
    return role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrator';
  }

  role(): string {
    return this.currentUserRole() || localStorage.getItem('firmeza_role') || 'Guest';
  }
}
