export interface CompanyActivity {
  id: string;
  companyId: string;
  title: string;
  description: string;
  activityType: 'note' | 'meeting' | 'call' | 'email' | 'other';
  createdBy: string;
  createdDate: Date;
  dueDate?: Date;
  status: 'open' | 'completed' | 'pending';
}

export interface CreateCompanyActivityRequest {
  companyId: string;
  title: string;
  description: string;
  activityType: 'note' | 'meeting' | 'call' | 'email' | 'other';
  dueDate?: Date;
  status: 'open' | 'completed' | 'pending';
}