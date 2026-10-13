export interface EnterpriseDto {
  id: string;
  name: string;
  tradeName: string;
  type: number;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  isActive: boolean;
}

export interface CreateEnterpriseDto {
  name: string;
  tradeName: string;
  type: number;
  address: string;
  phone: string;
  email: string;
  taxId: string;
}

export interface UpdateEnterpriseDto {
  name: string;
  tradeName: string;
  type: number;
  address: string;
  phone: string;
  email: string;
  taxId: string;
}
