export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  companyId?: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  companyId?: string;
}