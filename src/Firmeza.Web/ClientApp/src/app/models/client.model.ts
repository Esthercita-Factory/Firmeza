export interface ClientDto {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  document: string;
  enterpriseId: string;
  isActive: boolean;
}

export interface CreateClientDto {
  name: string;
  age: number;
  phone: string;
  email: string;
  document: string;
  enterpriseId: string;
}

export interface UpdateClientDto {
  name: string;
  age: number;
  phone: string;
  email: string;
  document: string;
  enterpriseId: string;
}
