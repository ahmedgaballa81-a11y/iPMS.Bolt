import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, CreateUserRequest, ActivityLog } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-management">
      <div class="header">
        <h2>User Management</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button 
              class="toggle-btn" 
              [class.active]="currentView() === 'users'"
              (click)="setView('users')">
              👥 Users
            </button>
            <button 
              class="toggle-btn" 
              [class.active]="currentView() === 'activity'"
              (click)="setView('activity')">
              📊 Activity Log
            </button>
          </div>
          @if (currentView() === 'users') {
            <button class="btn btn-primary" (click)="toggleCreateForm()">
              ➕ Add User
            </button>
          }
        </div>
      </div>

      @if (currentView() === 'users') {
        <!-- Create User Form -->
        <div class="create-form" [class.visible]="showCreateForm">
          <div class="form-card">
            <h3>Add New User</h3>
            <form (ngSubmit)="createUser()">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    [(ngModel)]="newUser.name"
                    name="name" 
                    required>
                </div>
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    [(ngModel)]="newUser.email"
                    name="email" 
                    required>
                </div>
              </div>
              <div class="form-group">
                <label for="role">Role *</label>
                <select 
                  id="role" 
                  [(ngModel)]="newUser.role"
                  name="role" 
                  required>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label>Permissions</label>
                <div class="permissions-grid">
                  @for (permission of availablePermissions; track permission.key) {
                    <label class="permission-item">
                      <input 
                        type="checkbox" 
                        [value]="permission.key"
                        [checked]="newUser.permissions.includes(permission.key)"
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Users List -->
        <div class="users-grid">
          @for (user of authService.allUsers(); track user.id) {
            <div class="user-card" [class.inactive]="!user.isActive || user.isLocked">
              <div class="user-header">
                <div class="user-info">
                  <h3>{{ user.name }}</h3>
                  <p class="email">{{ user.email }}</p>
                  <div class="user-badges">
                    <span class="role" [class]="'role-' + user.role">
                      {{ user.role | titlecase }}
                    </span>
                    <span class="status" [class.active]="user.isActive && !user.isLocked">
                      {{ getUserStatus(user) }}
                    </span>
                  </div>
                </div>
                <div class="user-avatar">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
              </div>

              <div class="user-details">
                <div class="detail-row">
                  <span class="label">Created:</span>
                  <span class="value">{{ user.createdDate | date:'MMM d, y' }}</span>
                </div>
                @if (user.lastLoginDate) {
                  <div class="detail-row">
                    <span class="label">Last Login:</span>
                    <span class="value">{{ user.lastLoginDate | date:'MMM d, y HH:mm' }}</span>
                  </div>
                }
                <div class="detail-row">
                  <span class="label">Permissions:</span>
                  <span class="value">{{ user.permissions.length }} granted</span>
                </div>
              </div>

              <div class="permissions-section">
                <h4>Permissions</h4>
                <div class="permissions-list">
                  @for (permission of user.permissions; track permission) {
                    <span class="permission-tag">{{ getPermissionLabel(permission) }}</span>
                  }
                  @if (user.permissions.length === 0) {
                    <span class="no-permissions">No permissions granted</span>
                  }
                </div>
              </div>

              <div class="user-actions">
                @if (user.isLocked) {
                  <button class="btn-sm btn-success" (click)="unlockUser(user.id)">
                    🔓 Unlock
                  </button>
                } @else {
                  <button class="btn-sm btn-warning" (click)="lockUser(user.id)">
                    🔒 Lock
                  </button>
                }
                <button class="btn-sm btn-secondary" (click)="editUser(user)">
                  ✏️ Edit
                </button>
                <button class="btn-sm btn-info" (click)="managePermissions(user)">
                  🛡️ Permissions
                </button>
                <button class="btn-sm btn-danger" (click)="deleteUser(user.id)">
                  🗑️ Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (currentView() === 'activity') {
        <!-- Activity Log Filters -->
        <div class="activity-filters">
          <div class="filter-row">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                [(ngModel)]="startDateFilter"
                name="startDate">
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input 
                type="date" 
                id="endDate" 
                [(ngModel)]="endDateFilter"
                name="endDate">
            </div>
            <div class="form-group">
              <label for="userFilter">User</label>
              <select 
                id="userFilter" 
                [(ngModel)]="userFilter"
                name="userFilter">
                <option value="">All Users</option>
                @for (user of authService.allUsers(); track user.id) {
                  <option [value]="user.id">{{ user.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <button class="btn btn-primary" (click)="applyFilters()">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Activity Log -->
        <div class="activity-log">
          @for (activity of filteredActivities(); track activity.id) {
            <div class="activity-item">
              <div class="activity-icon">
                {{ getActivityIcon(activity.action) }}
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <span class="user-name">{{ activity.userName }}</span>
                  <span class="action">{{ activity.action }}</span>
                  <span class="entity">{{ activity.entityType }}</span>
                  <span class="entity-name">{{ activity.entityName }}</span>
                </div>
                <div class="activity-details">{{ activity.details }}</div>
                <div class="activity-meta">
                  <span class="timestamp">{{ activity.timestamp | date:'MMM d, y HH:mm:ss' }}</span>
                  @if (activity.ipAddress) {
                    <span class="ip">IP: {{ activity.ipAddress }}</span>
                  }
                </div>
              </div>
            </div>
          }
          
          @if (filteredActivities().length === 0) {
            <div class="empty-state">
              <p>No activity logs found for the selected criteria.</p>
            </div>
          }
        </div>
      }

      <!-- Permission Management Modal -->
      @if (selectedUser) {
        <div class="modal-overlay" (click)="closePermissionModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>Manage Permissions - {{ selectedUser.name }}</h3>
            
            <div class="permissions-management">
              @for (permission of availablePermissions; track permission.key) {
                <label class="permission-item">
                  <input 
                    type="checkbox" 
                    [checked]="selectedUser.permissions.includes(permission.key)"
                    (change)="updateUserPermission(permission.key, $event)">
                  <span>{{ permission.label }}</span>
                </label>
              }
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closePermissionModal()">
                Cancel
              </button>
              <button class="btn btn-primary" (click)="savePermissions()">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-management {
      padding: 2rem;
      max-width: 1400px;
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .toggle-btn.active {
      background: var(--primary);
      color: white;
    }
    .toggle-btn:hover:not(.active) {
      background: var(--background);
      color: var(--text-primary);
    }
    .create-form {
      margin-bottom: 2rem;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }
    .create-form.visible {
      max-height: 800px;
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
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .user-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .user-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    .user-card.inactive {
      opacity: 0.7;
      border-color: var(--text-muted);
    }
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .user-info h3 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1.3rem;
    }
    .user-info .email {
      margin: 0 0 0.75rem 0;
      color: var(--primary);
      font-size: 0.9rem;
    }
    .user-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
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
    .role-user {
      background: var(--success-light);
      color: var(--success);
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
    .user-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .user-details {
      margin-bottom: 1.5rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .detail-row .label {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .detail-row .value {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.9rem;
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
    .no-permissions {
      color: var(--text-secondary);
      font-style: italic;
      font-size: 0.9rem;
    }
    .user-actions {
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    .btn-info {
      background: var(--primary);
      color: white;
    }
    .btn-danger {
      background: var(--error);
      color: white;
    }
    .activity-filters {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }
    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }
    .activity-log {
      background: var(--surface);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      max-height: 600px;
      overflow-y: auto;
    }
    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .activity-content {
      flex: 1;
    }
    .activity-header {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .user-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    .action {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.2rem 0.5rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .entity {
      background: var(--secondary-light);
      color: var(--secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .entity-name {
      color: var(--text-secondary);
      font-style: italic;
    }
    .activity-details {
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .activity-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      width: 100%;
      max-width: 600px;
      margin: 2rem;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-content h3 {
      margin: 0 0 1.5rem 0;
      color: var(--text-primary);
    }
    .permissions-management {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
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
      .user-management {
        padding: 1rem;
      }
      .users-grid {
        grid-template-columns: 1fr;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .filter-row {
        grid-template-columns: 1fr;
      }
      .user-actions {
        flex-direction: column;
      }
      .activity-header {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  public authService = inject(AuthService);

  @Input() initialView: 'users' | 'activity' = 'users';

  currentView = signal<'users' | 'activity'>('users');
  showCreateForm = false;
  selectedUser: User | null = null;
  startDateFilter = '';
  endDateFilter = '';
  userFilter = '';

  newUser: CreateUserRequest = {
    name: '',
    email: '',
    role: 'user',
    permissions: []
  };

  availablePermissions = [
    { key: 'create_project', label: 'Create Project' },
    { key: 'edit_project', label: 'Edit Project' },
    { key: 'delete_project', label: 'Delete Project' },
    { key: 'view_projects', label: 'View Projects' },
    { key: 'create_task', label: 'Create Task' },
    { key: 'edit_task', label: 'Edit Task' },
    { key: 'delete_task', label: 'Delete Task' },
    { key: 'create_step', label: 'Create Step' },
    { key: 'edit_step', label: 'Edit Step' },
    { key: 'delete_step', label: 'Delete Step' },
    { key: 'manage_users', label: 'Manage Users' },
    { key: 'view_reports', label: 'View Reports' },
    { key: 'manage_documents', label: 'Manage Documents' }
  ];

  filteredActivities = signal<ActivityLog[]>([]);

  constructor() {
    this.filteredActivities.set(this.authService.allActivityLogs());
  }

  ngOnInit(): void {
    this.currentView.set(this.initialView);
    if (this.initialView === 'activity') {
      this.applyFilters();
    }
  }

  setView(view: 'users' | 'activity'): void {
    this.currentView.set(view);
    if (view === 'activity') {
      this.applyFilters();
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  createUser(): void {
    if (this.newUser.name && this.newUser.email) {
      try {
        this.authService.createUser(this.newUser);
        this.resetForm();
        this.showCreateForm = false;
      } catch (error) {
        window.alert('Failed to create user: ' + (error as Error).message);
      }
    }
  }

  togglePermission(permission: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.newUser.permissions = [...this.newUser.permissions, permission];
    } else {
      this.newUser.permissions = this.newUser.permissions.filter(p => p !== permission);
    }
  }

  getUserStatus(user: User): string {
    if (user.isLocked) return 'Locked';
    if (!user.isActive) return 'Inactive';
    return 'Active';
  }

  lockUser(userId: string): void {
    if (window.confirm('Are you sure you want to lock this user?')) {
      try {
        this.authService.lockUser(userId);
      } catch (error) {
        window.alert('Failed to lock user: ' + (error as Error).message);
      }
    }
  }

  unlockUser(userId: string): void {
    if (window.confirm('Are you sure you want to unlock this user?')) {
      try {
        this.authService.unlockUser(userId);
      } catch (error) {
        window.alert('Failed to unlock user: ' + (error as Error).message);
      }
    }
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
    // Implement edit functionality
  }

  managePermissions(user: User): void {
    this.selectedUser = { ...user };
  }

  updateUserPermission(permission: string, event: Event): void {
    if (!this.selectedUser) return;

    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedUser.permissions = [...this.selectedUser.permissions, permission];
    } else {
      this.selectedUser.permissions = this.selectedUser.permissions.filter(p => p !== permission);
    }
  }

  savePermissions(): void {
    if (!this.selectedUser) return;

    try {
      this.authService.updateUser(this.selectedUser.id, {
        permissions: this.selectedUser.permissions
      });
      this.closePermissionModal();
    } catch (error) {
      window.alert('Failed to update permissions: ' + (error as Error).message);
    }
  }

  closePermissionModal(): void {
    this.selectedUser = null;
  }

  deleteUser(userId: string): void {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        this.authService.deleteUser(userId);
      } catch (error) {
        window.alert('Failed to delete user: ' + (error as Error).message);
      }
    }
  }

  applyFilters(): void {
    let activities = this.authService.allActivityLogs();

    if (this.startDateFilter && this.endDateFilter) {
      const startDate = new Date(this.startDateFilter);
      const endDate = new Date(this.endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      activities = activities.filter(log =>
        log.timestamp >= startDate && log.timestamp <= endDate
      );
    }

    if (this.userFilter) {
      activities = activities.filter(log => log.userId === this.userFilter);
    }

    this.filteredActivities.set(activities);
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      'login': '➡️',
      'logout': '⬅️',
      'create': '➕',
      'update': '✏️',
      'delete': '🗑️',
      'lock': '🔒',
      'unlock': '🔓',
      'grant_permissions': '✅',
      'revoke_permissions': '❌',
      'register': '👤',
      'password_reset': '🔑',
      'archive': '🗄️',
      'unarchive': '📤'
    };
    return icons[action] || '📊';
  }

  getPermissionLabel(permissionKey: string): string {
    const permission = this.availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.label : permissionKey;
  }

  private resetForm(): void {
    this.newUser = {
      name: '',
      email: '',
      role: 'user',
      permissions: []
    };
  }
}