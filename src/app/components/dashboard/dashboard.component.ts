import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Welcome back, {{ authService.user()?.name }}!</h1>
        <p class="dashboard-subtitle">Here's what's happening with your projects</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon customers">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalCustomers() }}</div>
            <div class="stat-label">Total Customers</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon projects">🗂️</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalProjects() }}</div>
            <div class="stat-label">Active Projects</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon tasks">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalTasks() }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon progress">🚀</div>
          <div class="stat-content">
            <div class="stat-number">{{ completedTasks() }}</div>
            <div class="stat-label">Completed Tasks</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="dashboard-content">
        <div class="dashboard-section">
          <h2>Recent Projects</h2>
          <div class="recent-projects">
            @for (project of recentProjects(); track project.id) {
              <div class="project-item" (click)="navigateToProject(project)">
                <div class="project-info">
                  <h3>{{ project.title }}</h3>
                  <p class="project-customer">{{ getCustomerName(project.customerId) }}</p>
                  <div class="project-meta">
                    <span class="status" [class]="'status-' + project.status">
                      {{ getStatusLabel(project.status) }}
                    </span>
                    <span class="progress">{{ project.progress }}% complete</span>
                  </div>
                </div>
                <div class="project-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="project.progress"></div>
                  </div>
                </div>
              </div>
            }
            @if (recentProjects().length === 0) {
              <div class="empty-state">
                <p>No projects yet. <a (click)="navigateToCustomers()">Create your first customer</a> to get started!</p>
              </div>
            }
          </div>
        </div>

        <div class="dashboard-section">
          <h2>Quick Actions</h2>
          <div class="quick-actions">
            <button class="action-card" (click)="navigateToCustomers()">
              <div class="action-icon">👥</div>
              <div class="action-content">
                <h3>Manage Customers</h3>
                <p>View and manage your customer base</p>
              </div>
            </button>
            <button class="action-card" (click)="navigateToAllProjects()">
              <div class="action-icon">🗂️</div>
              <div class="action-content">
                <h3>View All Projects</h3>
                <p>See all projects across customers</p>
              </div>
            </button>
            @if (authService.isAdmin()) {
              <button class="action-card" (click)="navigateToUsers()">
                <div class="action-icon">⚙️</div>
                <div class="action-content">
                  <h3>User Management</h3>
                  <p>Manage users and permissions</p>
                </div>
              </button>
            }
            <button class="action-card" (click)="navigateToLocations()">
              <div class="action-icon">📍</div>
              <div class="action-content">
                <h3>Locations</h3>
                <p>Manage work locations</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Project Status Overview -->
      <div class="dashboard-section">
        <h2>Project Status Overview</h2>
        <div class="status-overview">
          <div class="status-item">
            <div class="status-icon not-started">🕒</div>
            <div class="status-info">
              <span class="count">{{ getProjectCountByStatus('not-started') }}</span>
              <span class="label">Not Started</span>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon in-progress">🚀</div>
            <div class="status-info">
              <span class="count">{{ getProjectCountByStatus('in-progress') }}</span>
              <span class="label">In Progress</span>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon completed">✅</div>
            <div class="status-info">
              <span class="count">{{ getProjectCountByStatus('completed') }}</span>
              <span class="label">Completed</span>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon stopped">⏸️</div>
            <div class="status-info">
              <span class="count">{{ getProjectCountByStatus('stopped') }}</span>
              <span class="label">Stopped</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 600;
    }

    .dashboard-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
    }

    .stat-icon.customers {
      background: var(--primary-light);
    }

    .stat-icon.projects {
      background: var(--success-light);
    }

    .stat-icon.tasks {
      background: var(--warning-light);
    }

    .stat-icon.progress {
      background: var(--secondary-light);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .dashboard-section {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    .dashboard-section h2 {
      margin: 0 0 1.5rem 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .recent-projects {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .project-item {
      padding: 1.5rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .project-item:hover {
      background: var(--surface-elevated);
      border-color: var(--primary);
    }

    .project-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .project-customer {
      margin: 0 0 0.75rem 0;
      color: var(--primary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .project-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .status {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-not-started {
      background: var(--warning-light);
      color: var(--warning);
    }

    .status-in-progress {
      background: var(--primary-light);
      color: var(--primary);
    }

    .status-completed {
      background: var(--success-light);
      color: var(--success);
    }

    .status-stopped {
      background: var(--error-light);
      color: var(--error);
    }

    .progress {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .project-progress {
      margin-top: 0.5rem;
    }

    .progress-bar {
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s ease;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
    }

    .action-card:hover {
      background: var(--background);
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .action-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-light);
      border-radius: 8px;
    }

    .action-content h3 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .action-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.8rem;
    }

    .status-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--surface-elevated);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .status-item .status-icon {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }

    .status-item .status-icon.not-started {
      background: var(--warning-light);
    }

    .status-item .status-icon.in-progress {
      background: var(--primary-light);
    }

    .status-item .status-icon.completed {
      background: var(--success-light);
    }

    .status-item .status-icon.stopped {
      background: var(--error-light);
    }

    .status-info {
      display: flex;
      flex-direction: column;
    }

    .status-info .count {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .status-info .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .empty-state a {
      color: var(--primary);
      cursor: pointer;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-content {
        grid-template-columns: 1fr;
      }

      .status-overview {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  private dataService = inject(DataService);
  public authService = inject(AuthService);
  private navigationService = inject(NavigationService);

  readonly totalCustomers = computed(() => this.dataService.allCustomers().length);
  readonly totalProjects = computed(() => this.dataService.allProjects().filter(p => !p.isArchived).length);
  readonly totalTasks = computed(() => this.dataService.allTasks().length);
  readonly completedTasks = computed(() => this.dataService.allTasks().filter(t => t.status === 'finished').length);

  readonly recentProjects = computed(() => {
    return this.dataService.allProjects()
      .filter(p => !p.isArchived)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 5);
  });

  getUserTasks() {
    const currentUser = this.authService.user();
    if (!currentUser) return [];
    
    // Get tasks assigned to current user
    return this.dataService.getTasksByAssignedUser(currentUser.id)
      .filter(task => task.status === 'not-started' || task.status === 'in-progress')
      .slice(0, 5); // Show max 5 tasks
  }

  getCustomerName(customerId: string): string {
    const customer = this.dataService.getCustomerById(customerId);
    return customer ? customer.name : 'Unknown Customer';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'stopped': 'Stopped',
      'archived': 'Archived'
    };
    return labels[status] || status;
  }

  getProjectCountByStatus(status: string): number {
    return this.dataService.allProjects().filter(p => p.status === status).length;
  }

  navigateToProject(project: any): void {
    this.navigationService.navigateToTasks(project.customerId, project.companyId, project.id);
  }

  navigateToCustomers(): void {
    this.navigationService.navigateToCustomers();
  }

  navigateToAllProjects(): void {
    this.navigationService.navigateToAllProjects();
  }

  navigateToUsers(): void {
    this.navigationService.navigateToUsers();
  }

  navigateToLocations(): void {
    this.navigationService.navigateToLocations();
  }
}