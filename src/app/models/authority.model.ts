export interface Authority {
  id: string;
  name: string;
  title: string;
  department?: string;
  email: string;
  phone?: string;
  role: 'manager' | 'supervisor' | 'coordinator' | 'admin';
  permissions: string[];
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

export interface CreateAuthorityRequest {
  name: string;
  title: string;
  department?: string;
  email: string;
  phone?: string;
  role: 'manager' | 'supervisor' | 'coordinator' | 'admin';
  permissions: string[];
}