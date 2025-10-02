export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  mainAddress?: string;
  website?: string;
  activityId?: string;
  description?: string;
  customerId: string;
  isActive: boolean;

  taxRegistrationNumber?: string;

  taxAuthority?: string;

  taxCardData?: string;
  taxCardStartDate?: Date;
  taxCardEndDate?: Date;

  commercialRegisterData?: string;
  commercialRegisterDate?: Date;
  commercialExpireDate?: Date;

  importCardData?: string;
  importCardStartDate?: Date;
  importCardEndDate?: Date;

  exportCardData?: string;
  exprtCardStartDate?: Date;
  exportCardEndDate?: Date;

  createdDate: Date;
  updatedDate: Date;
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  mainAddress?: string;
  website?: string;
  activityId?: string;
  description?: string;
  customerId: string;

  taxRegistrationNumber?: string;

  taxAuthority?: string;

  taxCardData?: string;
  taxCardStartDate?: Date;
  taxCardEndDate?: Date;

  commercialRegisterData?: string;
  commercialRegisterDate?: Date;
  commercialExpireDate?: Date;

  importCardData?: string;
  importCardStartDate?: Date;
  importCardEndDate?: Date;

  exportCardData?: string;
  exprtCardStartDate?: Date;
  exportCardEndDate?: Date;
}
