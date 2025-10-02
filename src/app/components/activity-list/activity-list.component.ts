import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Activity, CreateActivityRequest } from '../../models/activity.model';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="activity-list-page">
      <div class="header">
        <h2>Activities</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              [class.active]="viewMode() === 'cards'"
              (click)="setViewMode('cards')"
            >
              📝 Cards
            </button>
            <button
              class="toggle-btn"
              [class.active]="viewMode() === 'table'"
              (click)="setViewMode('table')"
            >
              📋 Table
            </button>
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
                <label for="name">Activity Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  [(ngModel)]="currentActivity.name"
                  name="name" 
                  required>
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <textarea 
                  id="description" 
                  [(ngModel)]="currentActivity.description"
                  name="description" 
                  rows="3"></textarea>
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

      <!-- Cards View -->
      @if (viewMode() === 'cards') {
        <div class="activities-grid">
          @for (activity of dataService.allActivities(); track activity.id) {
            <div class="activity-card">
              <div class="activity-header">
                <h3>{{ activity.name }}</h3>
                <div class="activity-actions">
                  <button class="btn-icon" (click)="editActivity(activity)" title="Edit">
                    ✏️
                  </button>
                  <button class="btn-icon delete" (click)="deleteActivity(activity.id)" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
              @if (activity.description) {
                <p class="description">{{ activity.description }}</p>
              } @else {
                <p class="description text-muted">No description provided.</p>
              }
              <div class="activity-meta">
                <div class="meta-item">
                  <span class="label">Created:</span>
                  <span class="value">{{ activity.createdDate | date:'MMM d, y' }}</span>
                </div>
                @if (activity.updatedDate && activity.updatedDate !== activity.createdDate) {
                  <div class="meta-item">
                    <span class="label">Updated:</span>
                    <span class="value">{{ activity.updatedDate | date:'MMM d, y' }}</span>
                  </div>
                }
              </div>
            </div>
          }
          @if (dataService.allActivities().length === 0) {
            <div class="empty-state">
              <p>No activities defined yet. Add your first activity!</p>
            </div>
          }
        </div>
      }

      <!-- Table View -->
      @if (viewMode() === 'table') {
        <div class="table-container">
          <table class="activities-table">
            <thead>
              <tr>
                <th>Activity Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (activity of dataService.allActivities(); track activity.id) {
                <tr class="activity-row">
                  <td class="activity-info-cell">
                    <div class="activity-name-table">{{ activity.name }}</div>
                  </td>
                  <td>
                    @if (activity.description) {
                      <div class="activity-desc-table">{{ activity.description }}</div>
                    } @else {
                      <div class="activity-desc-table text-muted">No description provided.</div>
                    }
                  </td>
                  <td>{{ activity.createdDate | date:'MMM d, y' }}</td>
                  <td>
                    @if (activity.updatedDate && activity.updatedDate !== activity.createdDate) {
                      {{ activity.updatedDate | date:'MMM d, y' }}
                    } @else {
                      -
                    }
                  </td>
                  <td class="actions-cell">
                    <button class="btn-icon-small" (click)="editActivity(activity)" title="Edit">
                      ✏️
                    </button>
                    <button class="btn-icon-small delete" (click)="deleteActivity(activity.id)" title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (dataService.allActivities().length === 0) {
          <div class="empty-state">
            <p>No activities defined yet. Add your first activity!</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .activity-list-page {
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
    .view-toggle {
      display: flex;
      background: var(--surface-elevated);
      border-radius: 8px;
      padding: 2px;
      border: 1px solid var(--border);
    }
    .toggle-btn {
      background: none;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;
      display: flex; /* Added for icon alignment */
      align-items: center; /* Added for icon alignment */
      gap: 0.5rem; /* Added for spacing between icon and text */
    }
    .toggle-btn.active {
      background: var(--primary);
      color: white;
    }
    .toggle-btn:hover:not(.active) {
      background: var(--background);
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
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
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
      display: flex; /* Added for icon alignment */
      align-items: center; /* Added for icon alignment */
      gap: 0.5rem; /* Added for spacing between icon and text */
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
    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .activity-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
      position: relative;
    }
    .activity-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary);
    }
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .activity-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }
    .activity-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .activity-card:hover .activity-actions {
      opacity: 1;
    }
    .btn-icon {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 6px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
    .btn-icon:hover {
      background: var(--primary);
      color: white;
    }
    .btn-icon.delete:hover {
      background: var(--error);
    }
    .description {
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }
    .text-muted {
      font-style: italic;
      color: var(--text-muted);
    }
    .activity-meta {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-item .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-item .value {
      font-weight: 500;
      color: var(--text-primary);
      margin-top: 0.25rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
      grid-column: 1 / -1; /* Span across all columns */
    }
    /* Table View Styles */
    .table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }
    .activities-table {
      width: 100%;
      border-collapse: collapse;
    }
    .activities-table th {
      background: var(--surface-elevated);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }
    .activities-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .activity-row {
      transition: background-color 0.2s;
    }
    .activity-row:hover {
      background: var(--surface-elevated);
    }
    .activity-info-cell {
      min-width: 150px;
    }
    .activity-name-table {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .activity-desc-table {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .actions-cell {
      white-space: nowrap;
    }
    .btn-icon-small {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 4px;
      width: 28px;
      height: 28px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.25rem;
      font-size: 0.8rem;
    }
    .btn-icon-small:hover {
      background: var(--primary);
      color: white;
    }
    .btn-icon-small.delete:hover {
      background: var(--error);
    }
    @media (max-width: 768px) {
      .activity-list-page {
        padding: 1rem;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      .header-actions {
        justify-content: space-between;
      }
      .activities-grid {
        grid-template-columns: 1fr;
      }
      .activity-actions {
        opacity: 1;
      }
      .table-container {
        overflow-x: auto;
      }
      .activities-table {
        min-width: 700px; /* Ensure table is scrollable on small screens */
      }
    }
  `]
})
export class ActivityListComponent {
  public dataService = inject(DataService);

  showForm = signal(false);
  editingActivity = signal<Activity | null>(null);
  viewMode = signal<'cards' | 'table'>('cards'); // New signal for view mode

  currentActivity: CreateActivityRequest = {
    name: '',
    description: ''
  };

  openCreateForm(): void {
    this.editingActivity.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  editActivity(activity: Activity): void {
    this.editingActivity.set(activity);
    this.currentActivity = {
      name: activity.name,
      description: activity.description
    };
    this.showForm.set(true);
  }

  async saveActivity(): Promise<void> {
    if (!this.currentActivity.name) {
      alert('Activity name is required.');
      return;
    }

    try {
      if (this.editingActivity()) {
        await this.dataService.updateActivity(this.editingActivity()!.id, this.currentActivity);
      } else {
        await this.dataService.createActivity(this.currentActivity);
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
        await this.dataService.deleteActivity(activityId);
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

  private resetForm(): void {
    this.currentActivity = {
      name: '',
      description: ''
    };
  }

  // New method to set view mode
  setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode.set(mode);
  }
}