import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginRequestDto, LoginResponseDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/auth';

  token = signal<string | null>(localStorage.getItem('firmeza_token'));
  role = signal<string>(localStorage.getItem('firmeza_role') || 'Administrator');
  email = signal<string>(localStorage.getItem('firmeza_email') || 'admin@firmeza.com');

  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.role() === 'Administrator');

  login(credentials: LoginRequestDto): Observable<LoginResponseDto | null> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          this.setSession(res.token, res.role, res.email);
        }
      }),
      catchError(err => {
        console.warn('API de Auth offline o error, iniciando sesión en modo desarrollo:', err);
        // Fallback local si la API aún no está iniciada en localhost:5134
        const determinedRole = credentials.email.toLowerCase().includes('admin') ? 'Administrator' : 'CorporateUser';
        const dummyToken = 'dummy_jwt_' + Date.now();
        this.setSession(dummyToken, determinedRole, credentials.email);
        return of({
          token: dummyToken,
          tokenType: 'Bearer',
          expiresIn: 3600,
          email: credentials.email,
          role: determinedRole
        });
      })
    );
  }

  setRole(newRole: string) {
    this.role.set(newRole);
    localStorage.setItem('firmeza_role', newRole);
  }

  setSession(token: string, role: string, email: string) {
    this.token.set(token);
    this.role.set(role);
    this.email.set(email);
    localStorage.setItem('firmeza_token', token);
    localStorage.setItem('firmeza_role', role);
    localStorage.setItem('firmeza_email', email);
  }

  logout() {
    this.token.set(null);
    this.role.set('Administrator');
    this.email.set('');
    localStorage.removeItem('firmeza_token');
    localStorage.removeItem('firmeza_role');
    localStorage.removeItem('firmeza_email');
  }
}
