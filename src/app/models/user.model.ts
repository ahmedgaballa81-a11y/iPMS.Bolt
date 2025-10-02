export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  isLocked: boolean;
  permissions: string[];
  createdDate: Date;
  updatedDate: Date;
  lastLoginDate?: Date;
  profilePicture?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'project' | 'task' | 'step' | 'user' | 'document' | 'customer' | 'company' | 'company_activity' | 'industry' | 'activity'; // Added 'activity'
  entityId: string;
  entityName: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}