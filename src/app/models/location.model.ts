export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  description?: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  description?: string;
}