import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Authority, CreateAuthorityRequest } from '../../models/authority.model';

@Component({
  selector: 'app-authority-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="authority-list">
      <div class="header">
        <h2>Authorities</h2>
        <button class="btn btn-primary" (click)="toggleCreateForm()">
          ➕ Add Authority
        </button>
      </div>

      <div class="create-form" [class.visible]="showCreateForm">
        <div class="form-card">
          <h3>Add New Authority</h3>
          <form (ngSubmit)="createAuthority()">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  [(ngModel)]="newAuthority.name"
                  name="name" 
                  required>
              </div>
              <div class="form-group">
                <label for="title">Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  [(ngModel)]="newAuthority.title"
                  name="title" 
                  required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  [(ngModel)]="newAuthority.email"
                  name="email" 
                  required>
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  [(ngModel)]="newAuthority.phone"
                  name="phone">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="department">Department</label>
                <input 
                  type="text" 
                  id="department" 
                  [(ngModel)]="newAuthority.department"
                  name="department">
              </div>
              <div class="form-group">
                <label for="role">Role *</label>
                <select 
                  id="role" 
                  [(ngModel)]="newAuthority.role"
                  name="role" 
                  required>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Permissions</label>
              <div class="permissions-grid">
                @for (permission of availablePermissions; track permission.key) {
                  <label class="permission-item">
                    <input 
                      type="checkbox" 
                      [value]="permission.key"
                      [checked]="newAuthority.permissions.includes(permission.key)"
                      (change)="togglePermission(permission.key, $event)">
                    <span>{{ permission.label }}</span>
                  </label>
                }
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="toggleCreateForm()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Authority
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="authorities-grid">
        @for (authority of dataService.allAuthorities(); track authority.id) {
          <div class="authority-card" [class.inactive]="!authority.isActive">
            <div class="authority-header">
              <div class="authority-info">
                <h3>{{ authority.name }}</h3>
                <p class="title">{{ authority.title }}</p>
                @if (authority.department) {
                  <p class="department">{{ authority.department }}</p>
                }
              </div>
              <div class="authority-status">
                <span class="role" [class]="'role-' + authority.role">
                  {{ authority.role | titlecase }}
                </span>
                <span class="status" [class.active]="authority.isActive">
                  {{ authority.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <div class="contact-info">
              <div class="contact-item">
                📧
                <span class="value">{{ authority.email }}</span>
              </div>
              @if (authority.phone) {
                <div class="contact-item">
                  📞
                  <span class="value">{{ authority.phone }}</span>
                </div>
              }
            </div>

            <div class="permissions-section">
              <h4>Permissions</h4>
              <div class="permissions-list">
                @for (permission of authority.permissions; track permission) {
                  <span class="permission-tag">{{ getPermissionLabel(permission) }}</span>
                }
              </div>
            </div>

            <div class="authority-meta">
              <div class="meta-item">
                <span class="label">Created</span>
                <span class="value">{{ authority.createdDate | date:'MMM d, y' }}</span>
              </div>
              @if (authority.updatedDate !== authority.createdDate) {
                <div class="meta-item">
                  <span class="label">Updated</span>
                  <span class="value">{{ authority.updatedDate | date:'MMM d, y' }}</span>
                </div>
              }
            </div>

            <div class="authority-actions">
              <button 
                class="btn-sm" 
                [class]="authority.isActive ? 'btn-warning' : 'btn-success'"
                (click)="toggleAuthorityStatus(authority)">
                {{ authority.isActive ? '❌ Deactivate' : '✅ Activate' }}
              </button>
              <button class="btn-sm btn-secondary" (click)="editAuthority(authority)">
                ✏️ Edit
              </button>
              <button class="btn-sm btn-danger" (click)="deleteAuthority(authority.id)">
                🗑️ Delete
              </button>
            </div>
          </div>
        }
      </div>

      @if (dataService.allAuthorities().length === 0) {
        <div class="empty-state">
          <p>No authorities yet. Create your first authority to get started!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .authority-list {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h2 {
      color: var(--text-primary);
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .create-form {
      margin-bottom: 2rem;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .create-form.visible {
      max-height: 1000px;
    }

    .form-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .permission-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    }

    .permission-item:hover {
      background: var(--surface-elevated);
    }

    .authorities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
      gap: 1.5rem;
    }

    .authority-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }

    .authority-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .authority-card.inactive {
      opacity: 0.7;
      border-color: var(--text-muted);
    }

    .authority-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .authority-info h3 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1.3rem;
    }

    .authority-info .title {
      margin: 0 0 0.25rem 0;
      color: var(--primary);
      font-weight: 500;
    }

    .authority-info .department {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .authority-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .role {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-admin {
      background: var(--error-light);
      color: var(--error);
    }

    .role-manager {
      background: var(--primary-light);
      color: var(--primary);
    }

    .role-supervisor {
      background: var(--secondary-light);
      color: var(--secondary);
    }

    .role-coordinator {
      background: var(--warning-light);
      color: var(--warning);
    }

    .status {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      background: var(--error-light);
      color: var(--error);
    }

    .status.active {
      background: var(--success-light);
      color: var(--success);
    }

    .contact-info {
      margin-bottom: 1.5rem;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .contact-item .value {
      color: var(--text-secondary);
    }

    .permissions-section {
      margin-bottom: 1.5rem;
    }

    .permissions-section h4 {
      margin: 0 0 0.75rem 0;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .permission-tag {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .authority-meta {
      display: flex;
      gap: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      margin-bottom: 1rem;
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

    .authority-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex; /* Added for icon alignment */
      align-items: center; /* Added for icon alignment */
      gap: 0.5rem; /* Added for spacing between icon and text */
    }

    .btn-success {
      background: var(--success);
      color: white;
    }

    .btn-warning {
      background: var(--warning);
      color: white;
    }

    .btn-secondary {
      background: var(--surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-danger {
      background: var(--error);
      color: white;
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

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .authority-list {
        padding: 1rem;
      }

      .authorities-grid {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .permissions-grid {
        grid-template-columns: 1fr;
      }

      .authority-meta {
        flex-direction: column;
        gap: 1rem;
      }

      .authority-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AuthorityListComponent {
  public dataService = inject(DataService);

  showCreateForm = false;
  newAuthority: CreateAuthorityRequest = {
    name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    role: 'coordinator',
    permissions: []
  };

  availablePermissions = [
    { key: 'create_project', label: 'Create Project' },
    { key: 'edit_project', label: 'Edit Project' },
    { key: 'delete_project', label: 'Delete Project' },
    { key: 'manage_team', label: 'Manage Team' },
    { key: 'create_task', label: 'Create Task' },
    { key: 'edit_task', label: 'Edit Task' },
    { key: 'delete_task', label: 'Delete Task' },
    { key: 'assign_task', label: 'Assign Task' },
    { key: 'view_reports', label: 'View Reports' },
    { key: 'manage_budget', label: 'Manage Budget' },
    { key: 'approve_expenses', label: 'Approve Expenses' },
    { key: 'manage_users', label: 'Manage Users' }
  ];

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  createAuthority(): void {
    if (this.newAuthority.name && this.newAuthority.title && this.newAuthority.email) {
      this.dataService.createAuthority(this.newAuthority).then(() => {
        this.resetForm();
        this.showCreateForm = false;
      }).catch(error => {
        console.error('Failed to create authority:', error);
        alert('Failed to create authority. Please try again.');
      });
    }
  }

  togglePermission(permission: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.newAuthority.permissions = [...this.newAuthority.permissions, permission];
    } else {
      this.newAuthority.permissions = this.newAuthority.permissions.filter(p => p !== permission);
    }
  }

  toggleAuthorityStatus(authority: Authority): void {
    this.dataService.updateAuthority(authority.id, { isActive: !authority.isActive }).catch(error => {
      console.error('Failed to update authority:', error);
      alert('Failed to update authority. Please try again.');
    });
  }

  editAuthority(authority: Authority): void {
    console.log('Edit authority:', authority);
  }

  deleteAuthority(authorityId: string): void {
    if (window.confirm('Are you sure you want to delete this authority?')) {
      this.dataService.deleteAuthority(authorityId).catch(error => {
        console.error('Failed to delete authority:', error);
        alert('Failed to delete authority. Please try again.');
      });
    }
  }

  getPermissionLabel(permissionKey: string): string {
    const permission = this.availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.label : permissionKey;
  }

  private resetForm(): void {
    this.newAuthority = {
      name: '',
      title: '',
      department: '',
      email: '',
      phone: '',
      role: 'coordinator',
      permissions: []
    };
  }
}