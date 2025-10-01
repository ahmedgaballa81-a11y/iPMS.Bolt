export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedUserId?: string;
  createdBy: string;
  createdDate: Date;
  startDate?: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  expectedCost: number;
  actualCost: number;
  status: 'not-started' | 'in-progress' | 'finished' | 'stopped';
  priority: 'low' | 'medium' | 'high' | 'critical'; // Added 'critical'
  order: number;
  progress: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  assignedUserId?: string;
  startDate?: Date;
  expectedEndDate: Date;
  expectedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical'; // Added 'critical'
}