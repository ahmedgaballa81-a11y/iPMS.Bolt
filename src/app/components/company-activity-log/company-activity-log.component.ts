import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { CompanyActivity, CreateCompanyActivityRequest } from '../../models/company-activity.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-company-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="company-activity-log">
      <div class="header">
        <h2>Company Activities</h2>
        <div class="header-actions">
          <div class="filter-group">
            <label for="companyFilter">Filter by Company:</label>
            <select id="companyFilter" [(ngModel)]="selectedCompanyId" (ngModelChange)="applyFilters()">
              <option value="">All Companies</option>
              @for (company of dataService.allCompanies(); track company.id) {
                <option [value]="company.id">{{ company.name }}</option>
              }
            </select>
          </div>
          <button class="btn btn-primary" (click)="openCreateForm()">
            ➕ Add Activity
          </button>
        </div>
      </div>

      <!-- Create/Edit Activity Form -->
      @if (showForm()) {
        <div class="create-edit-form">
          <div class="form-card">
            <h3>{{ editingActivity() ? 'Edit Activity' : 'Add New Activity' }}</h3>
            <form (ngSubmit)="saveActivity()">
              <div class="form-group">
                <label for="company">Company *</label>
                <select 
                  id="company" 
                  [(ngModel)]="currentActivity.companyId"
                  name="company" 
                  required
                  [disabled]="!!editingActivity()">
                  <option value="">Select Company</option>
                  @for (company of dataService.allCompanies(); track company.id) {
                    <option [value]="company.id">{{ company.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label for="title">Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  [(ngModel)]="currentActivity.title"
                  name="title" 
                  required>
              </div>
              <div class="form-group">
                <label for="description">Description *</label>
                <textarea 
                  id="description" 
                  [(ngModel)]="currentActivity.description"
                  name="description" 
                  rows="3"
                  required></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="activityType">Activity Type *</label>
                  <select 
                    id="activityType" 
                    [(ngModel)]="currentActivity.activityType"
                    name="activityType" 
                    required>
                    <option value="note">Note</option>
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="status">Status *</label>
                  <select 
                    id="status" 
                    [(ngModel)]="currentActivity.status"
                    name="status" 
                    required>
                    <option value="open">Open</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="dueDate">Due Date</label>
                <input 
                  type="date" 
                  id="dueDate" 
                  [ngModel]="currentActivity.dueDate ? (currentActivity.dueDate | date:'yyyy-MM-dd') : ''"
                  (ngModelChange)="onDueDateChange($event)"
                  name="dueDate">
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeForm()">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ editingActivity() ? 'Update Activity' : 'Create Activity' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Activity List -->
      <div class="activity-list">
        @for (activity of filteredCompanyActivities(); track activity.id) {
          <div class="activity-card" [class.completed]="activity.status === 'completed'">
            <div class="activity-header">
              <div class="activity-title-group">
                <h3>{{ activity.title }}</h3>
                <span class="activity-type">{{ activity.activityType | titlecase }}</span>
              </div>
              <div class="activity-meta">
                <span class="company-name">{{ getCompanyName(activity.companyId) }}</span>
                <span class="status" [class]="'status-' + activity.status">{{ activity.status | titlecase }}</span>
              </div>
            </div>
            <p class="description">{{ activity.description }}</p>
            <div class="activity-details">
              <div class="detail-item">
                <span class="label">Created By:</span>
                <span class="value">{{ activity.createdBy }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Created Date:</span>
                <span class="value">{{ activity.createdDate | date:'MMM d, y HH:mm' }}</span>
              </div>
              @if (activity.dueDate) {
                <div class="detail-item">
                  <span class="label">Due Date:</span>
                  <span class="value">{{ activity.dueDate | date:'MMM d, y' }}</span>
                </div>
              }
            </div>
            <div class="activity-actions">
              <button class="btn-sm btn-secondary" (click)="editActivity(activity)">✏️ Edit</button>
              <button class="btn-sm btn-danger" (click)="deleteActivity(activity.id)">🗑️ Delete</button>
            </div>
          </div>
        }
        @if (filteredCompanyActivities().length === 0) {
          <div class="empty-state">
            <p>No company activities found.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .company-activity-log {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header h2 {
      color: var(--text-primary);
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .filter-group label {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
    }
    .filter-group select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      background: var(--surface-elevated);
      color: var(--text-primary);
    }
    .create-edit-form {
      margin-bottom: 2rem;
    }
    .form-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border);
    }
    .form-card h3 {
      margin: 0 0 1.5rem 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
    }
    .form-group select:disabled {
      background-color: var(--surface-elevated);
      cursor: not-allowed;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    .btn-primary:hover {
      background: var(--primary-dark);
    }
    .btn-secondary {
      background: var(--surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: var(--background);
    }
    .activity-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    .activity-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .activity-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    .activity-card.completed {
      border-left: 4px solid var(--success);
      background: linear-gradient(to right, var(--success-light), var(--surface));
    }
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .activity-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    .activity-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.25rem;
    }
    .activity-type {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: var(--secondary-light);
      color: var(--secondary);
    }
    .activity-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .company-name {
      font-size: 0.9rem;
      color: var(--primary);
      font-weight: 500;
    }
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-open {
      background: var(--warning-light);
      color: var(--warning);
    }
    .status-completed {
      background: var(--success-light);
      color: var(--success);
    }
    .status-pending {
      background: var(--primary-light);
      color: var(--primary);
    }
    .description {
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }
    .activity-details {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      margin-bottom: 1.5rem;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    .detail-item .label {
      color: var(--text-secondary);
    }
    .detail-item .value {
      color: var(--text-primary);
      font-weight: 500;
    }
    .activity-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-danger {
      background: var(--error);
      color: white;
    }
    .btn-danger:hover {
      background: var(--error-dark);
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
      grid-column: 1 / -1;
    }
    @media (max-width: 768px) {
      .company-activity-log {
        padding: 1rem;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      .header-actions {
        justify-content: space-between;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .activity-list {
        grid-template-columns: 1fr;
      }
      .activity-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .activity-meta {
        align-items: flex-start;
      }
    }
  `]
})
export class CompanyActivityLogComponent {
  public dataService = inject(DataService);
  private authService = inject(AuthService);

  showForm = signal(false);
  editingActivity = signal<CompanyActivity | null>(null);
  selectedCompanyId: string = '';

  currentActivity: CreateCompanyActivityRequest = {
    companyId: '',
    title: '',
    description: '',
    activityType: 'note',
    status: 'open',
    dueDate: undefined
  };

  readonly filteredCompanyActivities = computed(() => {
    let activities = this.dataService.allCompanyActivities();
    if (this.selectedCompanyId) {
      activities = activities.filter(activity => activity.companyId === this.selectedCompanyId);
    }
    return activities;
  });

  openCreateForm(): void {
    this.editingActivity.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  editActivity(activity: CompanyActivity): void {
    this.editingActivity.set(activity);
    this.currentActivity = {
      companyId: activity.companyId,
      title: activity.title,
      description: activity.description,
      activityType: activity.activityType,
      status: activity.status,
      dueDate: activity.dueDate
    };
    this.showForm.set(true);
  }

  onDueDateChange(dateString: string): void {
    this.currentActivity.dueDate = dateString ? new Date(dateString) : undefined;
  }

  async saveActivity(): Promise<void> {
    if (!this.currentActivity.companyId || !this.currentActivity.title || !this.currentActivity.description) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (this.editingActivity()) {
        await this.dataService.updateCompanyActivity(this.editingActivity()!.id, this.currentActivity);
      } else {
        await this.dataService.createCompanyActivity(this.currentActivity);
      }
      this.closeForm();
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert('Failed to save activity. Please try again.');
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await this.dataService.deleteCompanyActivity(activityId);
      } catch (error) {
        console.error('Failed to delete activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingActivity.set(null);
    this.resetForm();
  }

  applyFilters(): void {
    // The computed signal `filteredCompanyActivities` automatically re-evaluates when `selectedCompanyId` changes.
  }

  getCompanyName(companyId: string): string {
    const company = this.dataService.getCompanyById(companyId);
    return company ? company.name : 'Unknown Company';
  }

  private resetForm(): void {
    this.currentActivity = {
      companyId: '',
      title: '',
      description: '',
      activityType: 'note',
      status: 'open',
      dueDate: undefined
    };
  }
}