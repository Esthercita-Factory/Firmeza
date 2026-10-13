import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ClientDto, CreateClientDto, UpdateClientDto } from '../models/client.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/clients';

  private mockClients: ClientDto[] = [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Ana María Gómez Morales',
      age: 32,
      phone: '+57 310 987 6543',
      email: 'ana.gomez@firmeza.com',
      document: '1020304050',
      enterpriseId: '11111111-1111-1111-1111-111111111111',
      isActive: true
    },
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'Carlos Eduardo Restrepo',
      age: 45,
      phone: '+57 (605) 301-8899',
      email: 'carlos.restrepo@caribelogistics.co',
      document: '71987654',
      enterpriseId: '22222222-2222-2222-2222-222222222222',
      isActive: true
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Diana Patricia Jaramillo',
      age: 29,
      phone: '+57 (604) 211-9900',
      email: 'diana.jaramillo@metalandina.com.co',
      document: '1036452189',
      enterpriseId: '33333333-3333-3333-3333-333333333333',
      isActive: true
    },
    {
      id: 'c4444444-4444-4444-4444-444444444444',
      name: 'Julián David Martínez',
      age: 51,
      phone: '+57 320 456 7890',
      email: 'jmartinez@coopagro.org',
      document: '98765432',
      enterpriseId: '44444444-4444-4444-4444-444444444444',
      isActive: true
    },
    {
      id: 'c5555555-5555-5555-5555-555555555555',
      name: 'Elena Sofía Mendoza',
      age: 38,
      phone: '+57 318 765 4321',
      email: 'emendoza@consultores.com',
      document: '52890123',
      enterpriseId: '55555555-5555-5555-5555-555555555555',
      isActive: false
    }
  ];

  getPaged(pageNumber: number = 1, pageSize: number = 10, onlyActive?: boolean): Observable<PagedResult<ClientDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (onlyActive !== undefined && onlyActive !== null) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    return this.http.get<PagedResult<ClientDto>>(this.apiUrl, { params }).pipe(
      catchError(err => {
        console.warn('Firmeza.Api offline o error, sirviendo clientes locales:', err);
        let list = [...this.mockClients];
        if (onlyActive !== undefined && onlyActive !== null) {
          list = list.filter(c => c.isActive === onlyActive);
        }
        return of({
          data: list,
          totalRecords: list.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(list.length / pageSize) || 1,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: false
        });
      })
    );
  }

  getById(id: string): Observable<ClientDto | null> {
    return this.http.get<ClientDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.mockClients.find(c => c.id === id) || null;
        return of(found);
      })
    );
  }

  create(dto: CreateClientDto): Observable<ClientDto> {
    return this.http.post<ClientDto>(this.apiUrl, dto).pipe(
      catchError(() => {
        const created: ClientDto = {
          ...dto,
          id: 'cli-' + Date.now(),
          isActive: true
        };
        this.mockClients.unshift(created);
        return of(created);
      })
    );
  }

  update(id: string, dto: UpdateClientDto): Observable<ClientDto> {
    return this.http.put<ClientDto>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError(() => {
        const index = this.mockClients.findIndex(c => c.id === id);
        if (index !== -1) {
          this.mockClients[index] = { ...this.mockClients[index], ...dto };
          return of(this.mockClients[index]);
        }
        return of({ ...dto, id, isActive: true });
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.mockClients.find(c => c.id === id);
        if (found) found.isActive = false;
        return of({ message: 'Cliente suspendido lógicamente (IsActive = false).' });
      })
    );
  }
}
