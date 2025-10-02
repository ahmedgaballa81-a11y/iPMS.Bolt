export interface Industry {
  id: string;
  name: string;
  description?: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface CreateIndustryRequest {
  name: string;
  description?: string;
}