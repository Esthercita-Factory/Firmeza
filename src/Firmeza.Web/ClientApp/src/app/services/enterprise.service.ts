import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { EnterpriseDto, CreateEnterpriseDto, UpdateEnterpriseDto } from '../models/enterprise.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/enterprises';

  private mockEnterprises: EnterpriseDto[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Firmeza Soluciones Globales S.A.S.',
      tradeName: 'Firmeza Tech',
      taxId: '901.458.789-1',
      type: 3,
      email: 'contacto@firmeza.com',
      phone: '+57 (601) 345-6789',
      address: 'Calle 100 # 19A-40, Piso 8, Bogotá',
      isActive: true
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Corporación Logística del Caribe S.A.',
      tradeName: 'Caribe Logistics',
      taxId: '800.123.456-7',
      type: 2,
      email: 'operaciones@caribelogistics.co',
      phone: '+57 (605) 320-1122',
      address: 'Vía 40 # 73-290, Barranquilla',
      isActive: true
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Industrias Metalmecánicas Andinas Ltda.',
      tradeName: 'MetalAndina',
      taxId: '890.987.654-3',
      type: 3,
      email: 'gerencia@metalandina.com.co',
      phone: '+57 (604) 444-5566',
      address: 'Carrera 50 # 25-10, Medellín',
      isActive: true
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Cooperativa Agropecuaria Central',
      tradeName: 'CoopAgro',
      taxId: '860.001.234-9',
      type: 6,
      email: 'afiliaciones@coopagro.org',
      phone: '+57 (607) 678-9012',
      address: 'Km 5 Vía al Mar, Bucaramanga',
      isActive: true
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Servicios Consultores Gómez & Asociados',
      tradeName: 'Gómez Consultores',
      taxId: '71.234.567-8',
      type: 1,
      email: 'dgomez@consultores.com',
      phone: '+57 315 890 1234',
      address: 'Avenida 6N # 28N-50, Cali',
      isActive: false
    }
  ];

  getPaged(pageNumber: number = 1, pageSize: number = 10, onlyActive?: boolean): Observable<PagedResult<EnterpriseDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (onlyActive !== undefined && onlyActive !== null) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    return this.http.get<PagedResult<EnterpriseDto>>(this.apiUrl, { params }).pipe(
      catchError(err => {
        console.warn('Firmeza.Api offline o error, sirviendo datos locales:', err);
        let list = [...this.mockEnterprises];
        if (onlyActive !== undefined && onlyActive !== null) {
          list = list.filter(e => e.isActive === onlyActive);
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

  getById(id: string): Observable<EnterpriseDto | null> {
    return this.http.get<EnterpriseDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.mockEnterprises.find(e => e.id === id) || null;
        return of(found);
      })
    );
  }

  create(dto: CreateEnterpriseDto): Observable<EnterpriseDto> {
    return this.http.post<EnterpriseDto>(this.apiUrl, dto).pipe(
      catchError(() => {
        const created: EnterpriseDto = {
          ...dto,
          id: 'ent-' + Date.now(),
          isActive: true
        };
        this.mockEnterprises.unshift(created);
        return of(created);
      })
    );
  }

  update(id: string, dto: UpdateEnterpriseDto): Observable<EnterpriseDto> {
    return this.http.put<EnterpriseDto>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError(() => {
        const index = this.mockEnterprises.findIndex(e => e.id === id);
        if (index !== -1) {
          this.mockEnterprises[index] = { ...this.mockEnterprises[index], ...dto };
          return of(this.mockEnterprises[index]);
        }
        return of({ ...dto, id, isActive: true });
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.mockEnterprises.find(e => e.id === id);
        if (found) found.isActive = false;
        return of({ message: 'Empresa suspendida lógicamente (IsActive = false).' });
      })
    );
  }
}
