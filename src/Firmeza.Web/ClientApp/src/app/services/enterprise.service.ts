import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnterpriseDto, CreateEnterpriseDto, UpdateEnterpriseDto } from '../models/enterprise.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/enterprises';

  getPaged(pageNumber: number = 1, pageSize: number = 10, onlyActive?: boolean): Observable<PagedResult<EnterpriseDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (onlyActive !== undefined && onlyActive !== null) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    return this.http.get<PagedResult<EnterpriseDto>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<EnterpriseDto> {
    return this.http.get<EnterpriseDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateEnterpriseDto): Observable<EnterpriseDto> {
    return this.http.post<EnterpriseDto>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateEnterpriseDto): Observable<EnterpriseDto> {
    return this.http.put<EnterpriseDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
