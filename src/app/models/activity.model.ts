export interface Activity {
  id: string;
  name: string;
  description?: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface CreateActivityRequest {
  name: string;
  description?: string;
}