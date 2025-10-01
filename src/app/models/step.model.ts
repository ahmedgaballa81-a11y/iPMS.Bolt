export interface Step {
  id: string;
  title: string;
  description: string;
  projectId: string;
  taskId: string;
  location: string;
  actionNote: string;
  createdBy: string;
  createdDate: Date;
  startDate?: Date;
  expectedDate: Date;
  actualEndDate?: Date;
  expectedCost: number;
  actualCost: number;
  status: 'not-started' | 'in-progress' | 'success' | 'failed' | 'postponed' | 'stopped';
  priority: 'low' | 'medium' | 'high' | 'critical'; // Added 'critical'
  order: number;
}

export interface CreateStepRequest {
  title: string;
  description: string;
  taskId: string;
  location: string;
  actionNote: string;
  startDate?: Date;
  expectedDate: Date;
  expectedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical'; // Added 'critical'
}