import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { NavigationService } from '../../services/navigation.service';
import { AuthService } from '../../services/auth.service';
import { Task, CreateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task-list">
      <div class="header">
        <div class="breadcrumb">
          <button class="breadcrumb-item" (click)="navigateToCustomers()">
            ⬅️ Customers
          </button>
          <span class="breadcrumb-separator">/</span>
          <button class="breadcrumb-item" (click)="navigateToProjects()">
            {{ currentCustomer()?.name }}
          </button>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ currentProject()?.title }} Tasks</span>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button 
              class="toggle-btn" 
              [class.active]="viewMode() === 'cards'"
              (click)="setViewMode('cards')">
              🗂️ Cards
            </button>
            <button 
              class="toggle-btn" 
              [class.active]="viewMode() === 'table'"
              (click)="setViewMode('table')">
              📋 Table
            </button>
          </div>
          <button class="btn btn-primary" (click)="toggleCreateForm()">
            ➕ Add Task
          </button>
        </div>
      </div>

      <!-- Status Overview -->
      <div class="status-overview">
        <div class="status-card">
          <div class="status-icon not-started">🕒</div>
          <div class="status-info">
            <span class="count">{{ getTaskCountByStatus('not-started') }}</span>
            <span class="label">Not Started</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon in-progress">🚀</div>
          <div class="status-info">
            <span class="count">{{ getTaskCountByStatus('in-progress') }}</span>
            <span class="label">In Progress</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon finished">✅</div>
          <div class="status-info">
            <span class="count">{{ getTaskCountByStatus('finished') }}</span>
            <span class="label">Finished</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon stopped">⏸️</div>
          <div class="status-info">
            <span class="count">{{ getTaskCountByStatus('stopped') }}</span>
            <span class="label">Stopped</span>
          </div>
        </div>
      </div>

      <div class="create-form" [class.visible]="showCreateForm">
        <div class="form-card">
          <h3>Add New Task</h3>
          <form (ngSubmit)="createTask()">
            <div class="form-group">
              <label for="title">Title *</label>
              <input 
                type="text" 
                id="title" 
                [(ngModel)]="newTask.title"
                name="title" 
                required>
            </div>
            <div class="form-group">
              <label for="description">Description *</label>
              <textarea 
                id="description" 
                [(ngModel)]="newTask.description"
                name="description" 
                required
                rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="priority">Priority *</label>
                <select 
                  id="priority" 
                  [(ngModel)]="newTask.priority"
                  name="priority" 
                  required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div class="form-group">
                <label for="expectedCost">Expected Cost *</label>
                <input 
                  type="number" 
                  id="expectedCost" 
                  [(ngModel)]="newTask.expectedCost"
                  name="expectedCost" 
                  min="0"
                  step="50"
                  required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Start Date</label>
                <input 
                  type="date" 
                  id="startDate" 
                  [(ngModel)]="startDateString"
                  name="startDate">
              </div>
              <div class="form-group">
                <label for="expectedEndDate">Expected End Date *</label>
                <input 
                  type="date" 
                  id="expectedEndDate" 
                  [(ngModel)]="expectedEndDateString"
                  name="expectedEndDate" 
                  required>
              </div>
            </div>
            <div class="form-group">
              <label for="assignedUser">Assign to User</label>
              <select 
                id="assignedUser" 
                [(ngModel)]="newTask.assignedUserId"
                name="assignedUser">
                <option value="">Unassigned</option>
                @for (user of availableUsers(); track user.id) {
                  <option [value]="user.id">{{ user.name }}</option>
                }
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="toggleCreateForm()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Cards View -->
      @if (viewMode() === 'cards') {
        <div class="tasks-container" 
             (dragover)="onDragOver($event)" 
             (drop)="onDrop($event)">
          @for (task of currentTasks(); track task.id; let index = $index) {
            <div class="task-card" 
                 draggable="true"
                 (dragstart)="onDragStart($event, task, index)"
                 (dragend)="onDragEnd($event)"
                 (click)="selectTask(task)">
              <div class="drag-handle">⋮</div>
              
              <div class="task-header">
                <div class="task-title-group">
                  <h3>{{ task.title }}</h3>
                  <span class="priority" [class]="'priority-' + task.priority">
                    {{ task.priority | titlecase }}
                  </span>
                </div>
                <div class="task-status">
                  <span class="status" [class]="'status-' + task.status">
                    {{ getStatusLabel(task.status) }}
                  </span>
                </div>
              </div>

              <p class="description">{{ task.description }}</p>

              <div class="task-stats">
                <div class="stat">
                  <span class="label">Steps</span>
                  <span class="value">{{ getStepCount(task.id) }}</span>
                </div>
                <div class="stat">
                  <span class="label">Progress</span>
                  <span class="value">{{ task.progress }}%</span>
                </div>
                <div class="progress-section">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="task.progress"></div>
                  </div>
                </div>
              </div>

              <div class="task-details">
                <div class="detail-grid">
                  @if (task.startDate) {
                    <div class="detail-item">
                      <span class="label">Start Date</span>
                      <span class="value">{{ task.startDate | date:'MMM d, y' }}</span>
                    </div>
                  }
                  <div class="detail-item">
                    <span class="label">Expected End</span>
                    <span class="value">{{ task.expectedEndDate | date:'MMM d, y' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Expected Cost</span>
                    <span class="value">$ {{ task.expectedCost | number }}</span>
                  </div>
                  @if (task.actualCost > 0) {
                    <div class="detail-item">
                      <span class="label">Actual Cost</span>
                      <span class="value">$ {{ task.actualCost | number }}</span>
                    </div>
                  }
                  @if (task.actualEndDate) {
                    <div class="detail-item">
                      <span class="label">Finished</span>
                      <span class="value">{{ task.actualEndDate | date:'MMM d, y' }}</span>
                    </div>
                  }
                  <div class="detail-item">
                    <span class="label">Assigned To</span>
                    <span class="value">{{ getAssignedUserName(task.assignedUserId) }}</span>
                  </div>
                </div>
              </div>

              <div class="task-actions">
                <button 
                  class="btn-icon" 
                  (click)="toggleTaskStatus(task, $event)"
                  [title]="task.status === 'finished' ? 'Mark as Not Started' : 'Mark as Finished'">
                  {{ task.status === 'finished' ? '🔄' : '✅' }}
                </button>
                <button 
                  class="btn-icon" 
                  (click)="editTask(task, $event)"
                  title="Edit">
                  ✏️
                </button>
                <button 
                  class="btn-icon delete" 
                  (click)="deleteTask(task.id, $event)"
                  title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Table View -->
      @if (viewMode() === 'table') {
        <div class="table-container">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Assigned To</th>
                <th>Start Date</th>
                <th>Expected End</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Steps</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (task of currentTasks(); track task.id; let index = $index) {
                <tr class="task-row" 
                    draggable="true"
                    (dragstart)="onDragStart($event, task, index)"
                    (dragend)="onDragEnd($event)"
                    (click)="selectTask(task)">
                  <td class="order-cell">
                    <div class="order-controls">
                      <span class="drag-handle">⋮</span>
                      <span class="order-number">{{ index + 1 }}</span>
                    </div>
                  </td>
                  <td class="task-info">
                    <div class="task-title">{{ task.title }}</div>
                    <div class="task-desc">{{ task.description }}</div>
                  </td>
                  <td>
                    <span class="priority" [class]="'priority-' + task.priority">
                      {{ task.priority | titlecase }}
                    </span>
                  </td>
                  <td>
                    <span class="status" [class]="'status-' + task.status">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="progress-cell">
                      <div class="progress-bar-small">
                        <div class="progress-fill" [style.width.%]="task.progress"></div>
                      </div>
                      <span class="progress-text">{{ task.progress }}%</span>
                    </div>
                  </td>
                  <td>{{ getAssignedUserName(task.assignedUserId) }}</td>
                  <td>{{ task.startDate ? (task.startDate | date:'MMM d, y') : '-' }}</td>
                  <td>{{ task.expectedEndDate | date:'MMM d, y' }}</td>
                  <td>$ {{ task.expectedCost | number }}</td>
                  <td>$ {{ task.actualCost | number }}</td>
                  <td>{{ getStepCount(task.id) }}</td>
                  <td class="actions-cell">
                    <button 
                      class="btn-icon-small" 
                      (click)="toggleTaskStatus(task, $event)"
                      [title]="task.status === 'finished' ? 'Mark as Not Started' : 'Mark as Finished'">
                      {{ task.status === 'finished' ? '🔄' : '✅' }}
                    </button>
                    <button 
                      class="btn-icon-small" 
                      (click)="editTask(task, $event)"
                      title="Edit">
                      ✏️
                    </button>
                    <button 
                      class="btn-icon-small delete" 
                      (click)="deleteTask(task.id, $event)"
                      title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (currentTasks().length === 0) {
        <div class="empty-state">
          <p>No tasks yet. Create your first task to get started!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .task-list {
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
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
    }
    .breadcrumb-item {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      text-decoration: none;
      font-size: inherit;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .breadcrumb-item:hover {
      text-decoration: underline;
    }
    .breadcrumb-separator {
      color: var(--text-secondary);
    }
    .breadcrumb-current {
      color: var(--text-primary);
      font-weight: 600;
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
    .status-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .status-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s;
    }
    .status-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .status-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-icon.not-started {
      background: var(--warning-light);
    }
    .status-icon.in-progress {
      background: var(--primary-light);
    }
    .status-icon.finished {
      background: var(--success-light);
    }
    .status-icon.stopped {
      background: var(--error-light);
    }
    .status-info {
      display: flex;
      flex-direction: column;
    }
    .status-info .count {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }
    .status-info .label {
      color: var(--text-secondary);
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
    .form-group textarea,
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
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
    }
    .tasks-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
      gap: 1.5rem;
    }
    .task-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary);
    }
    .task-card.dragging {
      opacity: 0.5;
      transform: rotate(5deg);
    }
    .drag-handle {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      color: var(--text-muted);
      cursor: grab;
      font-size: 1.2rem;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .drag-handle:hover {
      background: var(--surface-elevated);
      color: var(--text-secondary);
    }
    .drag-handle:active {
      cursor: grabbing;
    }
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      margin-top: 1rem;
    }
    .task-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    .task-title-group h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.2rem;
    }
    .priority {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .priority-high {
      background: var(--error-light);
      color: var(--error);
    }
    .priority-medium {
      background: var(--warning-light);
      color: var(--warning);
    }
    .priority-low {
      background: var(--success-light);
      color: var(--success);
    }
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
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
    .status-finished {
      background: var(--success-light);
      color: var(--success);
    }
    .status-stopped {
      background: var(--error-light);
      color: var(--error);
    }
    .description {
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }
    .task-stats {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .task-stats .stat {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      margin-right: 2rem;
    }
    .stat .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat .value {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .progress-section {
      margin-top: 0.75rem;
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
    .task-details {
      margin-top: 1rem;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    .detail-item .label {
      color: var(--text-secondary);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-item .value {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
    .task-actions {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .task-card:hover .task-actions {
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
    /* Table Styles */
    .table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }
    .tasks-table {
      width: 100%;
      border-collapse: collapse;
    }
    .tasks-table th {
      background: var(--surface-elevated);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }
    .tasks-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .task-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .task-row:hover {
      background: var(--surface-elevated);
    }
    .task-row.dragging {
      opacity: 0.5;
    }
    .order-cell {
      width: 80px;
    }
    .order-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .order-controls .drag-handle {
      position: static;
      font-size: 1rem;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .order-number {
      font-weight: 600;
      color: var(--text-primary);
    }
    .task-info {
      min-width: 200px;
    }
    .task-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .task-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .progress-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 100px;
    }
    .progress-bar-small {
      flex: 1;
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
      min-width: 35px;
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
      .task-list {
        padding: 1rem;
      }
      .tasks-container {
        grid-template-columns: 1fr;
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
      .task-actions {
        opacity: 1;
      }
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .status-overview {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
      .table-container {
        overflow-x: auto;
      }
      .tasks-table {
        min-width: 900px;
      }
    }
  `]
})
export class TaskListComponent {
  private dataService = inject(DataService);
  private navigationService = inject(NavigationService);
  private authService = inject(AuthService);

  showCreateForm = false;
  viewMode = signal<'cards' | 'table'>('cards');
  startDateString = new Date().toISOString().split('T')[0];
  expectedEndDateString = new Date().toISOString().split('T')[0];
  draggedTask: Task | null = null;
  draggedIndex: number = -1;

  newTask: CreateTaskRequest = {
    title: '',
    description: '',
    projectId: '',
    startDate: undefined,
    expectedEndDate: new Date(),
    expectedCost: 0,
    priority: 'medium'
  };

  readonly currentCustomer = computed(() => {
    const state = this.navigationService.currentState();
    return state.selectedCustomerId
      ? this.dataService.getCustomerById(state.selectedCustomerId)
      : undefined;
  });

  readonly currentProject = computed(() => {
    const state = this.navigationService.currentState();
    return state.selectedProjectId
      ? this.dataService.getProjectById(state.selectedProjectId)
      : undefined;
  });

  readonly currentTasks = computed(() => {
    const state = this.navigationService.currentState();
    return state.selectedProjectId
      ? this.dataService.getTasksByProject(state.selectedProjectId)
      : [];
  });

  readonly availableUsers = computed(() => this.authService.allUsers());

  setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode.set(mode);
  }

  getTaskCountByStatus(status: string): number {
    return this.currentTasks().filter(t => t.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'finished': 'Finished',
      'stopped': 'Stopped'
    };
    return labels[status] || status;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    } else {
      const state = this.navigationService.currentState();
      if (state.selectedProjectId) {
        this.newTask.projectId = state.selectedProjectId;
      }
    }
  }

  createTask(): void {
    if (this.newTask.title && this.newTask.description && this.expectedEndDateString) {
      this.newTask.expectedEndDate = new Date(this.expectedEndDateString);
      if (this.startDateString) {
        this.newTask.startDate = new Date(this.startDateString);
      }
      this.dataService.createTask(this.newTask).then(() => {
        this.resetForm();
        this.showCreateForm = false;
      }).catch(error => {
        console.error('Failed to create task:', error);
        alert('Failed to create task. Please try again.');
      });
    }
  }

  selectTask(task: Task): void {
    const state = this.navigationService.currentState();
    if (state.selectedCustomerId && state.selectedCompanyId && state.selectedProjectId) {
      this.navigationService.navigateToSteps(
        state.selectedCustomerId,
        state.selectedCompanyId,
        state.selectedProjectId,
        task.id
      );
    }
  }

  toggleTaskStatus(task: Task, event: Event): void {
    event.stopPropagation();
    const newStatus = task.status === 'finished' ? 'not-started' : 'finished';
    const updates: Partial<Task> = {
      status: newStatus,
      progress: newStatus === 'finished' ? 100 : 0
    };

    if (newStatus === 'finished') {
      updates.actualEndDate = new Date();
    } else {
      updates.actualEndDate = undefined;
    }

    this.dataService.updateTask(task.id, updates).catch(error => {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    });
  }

  editTask(task: Task, event: Event): void {
    event.stopPropagation();
    console.log('Edit task:', task);
  }

  deleteTask(taskId: string, event: Event): void {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      this.dataService.deleteTask(taskId).catch(error => {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      });
    }
  }

  getStepCount(taskId: string): number {
    return this.dataService.getStepsByTask(taskId).length;
  }

  // Drag and Drop functionality
  onDragStart(event: DragEvent, task: Task, index: number): void {
    this.draggedTask = task;
    this.draggedIndex = index;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }

    // Add dragging class
    setTimeout(() => {
      (event.target as HTMLElement).classList.add('dragging');
    }, 0);
  }

  onDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).classList.remove('dragging');
    this.draggedTask = null;
    this.draggedIndex = -1;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (!this.draggedTask) return;

    const target = (event.target as HTMLElement).closest('.task-card, .task-row');
    if (!target) return;

    const targetIndex = Array.from(target.parentElement!.children).indexOf(target);

    if (targetIndex !== -1 && targetIndex !== this.draggedIndex) {
      this.dataService.updateTaskOrder(this.draggedTask.id, targetIndex);
    }
  }

  navigateToCustomers(): void {
    this.navigationService.navigateToCustomers();
  }

  navigateToProjects(): void {
    const state = this.navigationService.currentState();
    if (state.selectedCustomerId && state.selectedCompanyId) {
      this.navigationService.navigateToProjects(state.selectedCustomerId, state.selectedCompanyId);
    }
  }

  navigateToTasks(): void {
    const state = this.navigationService.currentState();
    if (state.selectedCustomerId && state.selectedCompanyId) {
      this.navigationService.navigateToProjects(
        state.selectedCustomerId,
        state.selectedCompanyId
      );
    }
  }

  private resetForm(): void {
    this.newTask = {
      title: '',
      description: '',
      projectId: '',
      assignedUserId: undefined,
      startDate: undefined,
      expectedEndDate: new Date(),
      expectedCost: 0,
      priority: 'medium'
    };
    this.startDateString = '';
    this.expectedEndDateString = '';
  }

  getAssignedUserName(userId: string | undefined): string {
    if (!userId) return 'Unassigned';
    const user = this.availableUsers().find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  }
}