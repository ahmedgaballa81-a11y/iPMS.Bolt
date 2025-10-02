export interface Project {
  id: string;
  title: string;
  description: string;
  customerId: string;
  companyId: string;
  createdBy: string;
  createdDate: Date;
  startDate?: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  expectedCost: number;
  actualCost: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'stopped' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  isArchived: boolean;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  customerId: string;
  companyId: string;
  startDate?: Date;
  expectedEndDate: Date;
  expectedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}