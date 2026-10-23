import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientDto, CreateClientDto, UpdateClientDto } from '../models/client.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);

  // Corregido al puerto 8081 que mapea tu Docker Compose hacia la API
  private apiUrl = 'http://localhost:8081/api/clients';

  getPaged(pageNumber: number = 1, pageSize: number = 10, onlyActive?: boolean): Observable<PagedResult<ClientDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (onlyActive !== undefined && onlyActive !== null) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    return this.http.get<PagedResult<ClientDto>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ClientDto> {
    return this.http.get<ClientDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateClientDto): Observable<ClientDto> {
    return this.http.post<ClientDto>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateClientDto): Observable<ClientDto> {
    return this.http.put<ClientDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
