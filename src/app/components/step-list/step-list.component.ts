import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { NavigationService } from '../../services/navigation.service';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Step, CreateStepRequest } from '../../models/step.model';

@Component({
  selector: 'app-step-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-list">
      <div class="header">
        <div class="breadcrumb">
          <button class="breadcrumb-item" (click)="navigateToCustomers()">
            Customers
          </button>
          <span class="breadcrumb-separator">/</span>
          <button class="breadcrumb-item" (click)="navigateToProjects()">
            {{ currentCustomer()?.name }}
          </button>
          <span class="breadcrumb-separator">/</span>
          <button class="breadcrumb-item" (click)="navigateToTasks()">
            {{ currentProject()?.title }}
          </button>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ currentTask()?.title }} Steps</span>
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
            ➕ Add Step
          </button>
        </div>
      </div>

      <!-- Status Overview -->
      <div class="status-overview">
        <div class="status-card">
          <div class="status-icon not-started">🕒</div>
          <div class="status-info">
            <span class="count">{{ getStepCountByStatus('not-started') }}</span>
            <span class="label">Not Started</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon in-progress">🚀</div>
          <div class="status-info">
            <span class="count">{{ getStepCountByStatus('in-progress') }}</span>
            <span class="label">In Progress</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon success">✅</div>
          <div class="status-info">
            <span class="count">{{ getStepCountByStatus('success') }}</span>
            <span class="label">Success</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon failed">❌</div>
          <div class="status-info">
            <span class="count">{{ getStepCountByStatus('failed') }}</span>
            <span class="label">Failed</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon postponed">⏸️</div>
          <div class="status-info">
            <span class="count">{{ getStepCountByStatus('postponed') }}</span>
            <span class="label">Postponed</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon stopped">⚠️</div>
          <div class="status-info">
            <span class="count">{{ getStepCountByStatus('stopped') }}</span>
            <span class="label">Stopped</span>
          </div>
        </div>
      </div>

      <div class="create-form" [class.visible]="showCreateForm">
        <div class="form-card">
          <h3>Add New Step</h3>
          <form (ngSubmit)="createStep()">
            <div class="form-group">
              <label for="title">Title *</label>
              <input 
                type="text" 
                id="title" 
                [(ngModel)]="newStep.title"
                name="title" 
                required>
            </div>
            <div class="form-group">
              <label for="description">Description *</label>
              <textarea 
                id="description" 
                [(ngModel)]="newStep.description"
                name="description" 
                required
                rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="location">Location *</label>
                <select 
                  id="location" 
                  [(ngModel)]="newStep.location"
                  name="location"
                  required>
                  <option value="">Select Location</option>
                  @for (location of availableLocations(); track location.id) {
                    <option [value]="location.name">{{ location.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label for="priority">Priority *</label>
                <select 
                  id="priority" 
                  [(ngModel)]="newStep.priority"
                  name="priority" 
                  required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="expectedCost">Expected Cost *</label>
                <input 
                  type="number" 
                  id="expectedCost" 
                  [(ngModel)]="newStep.expectedCost"
                  name="expectedCost" 
                  min="0"
                  step="25"
                  required>
              </div>
              <div class="form-group">
                <label for="expectedDate">Expected Date *</label>
                <input 
                  type="date" 
                  id="expectedDate" 
                  [(ngModel)]="expectedDateString"
                  name="expectedDate" 
                  required>
              </div>
            </div>
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                [(ngModel)]="startDateString"
                name="startDate">
            </div>
            <div class="form-group">
              <label for="actionNote">Action Note</label>
              <textarea 
                id="actionNote" 
                [(ngModel)]="newStep.actionNote"
                name="actionNote"
                rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="toggleCreateForm()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Step
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Cards View -->
      @if (viewMode() === 'cards') {
        <div class="steps-container"
             (dragover)="onDragOver($event)" 
             (drop)="onDrop($event)">
          @for (step of currentSteps(); track step.id; let index = $index) {
            <div class="step-item" 
                 [class.completed]="step.status === 'success'"
                 [class.failed]="step.status === 'failed'"
                 draggable="true"
                 (dragstart)="onDragStart($event, step, index)"
                 (dragend)="onDragEnd($event)">
              <div class="drag-handle">☰</div>
              
              <div class="step-number">
                @if (step.status === 'success') {
                  <span class="checkmark">✅</span>
                } @else if (step.status === 'failed') {
                  <span class="failed-mark">❌</span>
                } @else {
                  <span class="number">{{ index + 1 }}</span>
                }
              </div>
              
              <div class="step-content">
                <div class="step-header">
                  <div class="step-title-group">
                    <h4>{{ step.title }}</h4>
                    <span class="priority" [class]="'priority-' + step.priority">
                      {{ step.priority | titlecase }}
                    </span>
                  </div>
                  <div class="step-status">
                    <span class="status" [class]="'status-' + step.status">
                      {{ getStatusLabel(step.status) }}
                    </span>
                  </div>
                </div>
                
                <p class="description">{{ step.description }}</p>
                
                @if (step.actionNote) {
                  <div class="action-note">
                    <strong>Action Note:</strong> {{ step.actionNote }}
                  </div>
                }
                
                <div class="step-details">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="label">📍 Location</span>
                      <span class="value">{{ step.location }}</span>
                    </div>
                    @if (step.startDate) {
                      <div class="detail-item">
                        <span class="label">🗓️ Start Date</span>
                        <span class="value">{{ step.startDate | date:'MMM d, y' }}</span>
                      </div>
                    }
                    <div class="detail-item">
                      <span class="label">🗓️ Expected</span>
                      <span class="value">{{ step.expectedDate | date:'MMM d, y' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">💰 Expected Cost</span>
                      <span class="value">$ {{ step.expectedCost | number }}</span>
                    </div>
                    @if (step.actualCost > 0) {
                      <div class="detail-item">
                        <span class="label">💸 Actual Cost</span>
                        <span class="value">$ {{ step.actualCost | number }}</span>
                      </div>
                    }
                    @if (step.actualEndDate) {
                      <div class="detail-item">
                        <span class="label">✅ Finished</span>
                        <span class="value">{{ step.actualEndDate | date:'MMM d, y' }}</span>
                      </div>
                    }
                    <div class="detail-item">
                      <span class="label">👤 Created By</span>
                      <span class="value">{{ step.createdBy }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="step-actions">
                  <select 
                    class="status-select"
                    [value]="step.status"
                    (change)="updateStepStatus(step, $event)">
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="postponed">Postponed</option>
                    <option value="stopped">Stopped</option>
                  </select>
                  <button class="btn-sm btn-secondary" (click)="editStep(step)">
                    ✏️ Edit
                  </button>
                  <button class="btn-sm btn-danger" (click)="deleteStep(step.id)">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Table View -->
      @if (viewMode() === 'table') {
        <div class="table-container">
          <table class="steps-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Step</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>Expected Date</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (step of currentSteps(); track step.id; let index = $index) {
                <tr class="step-row"
                    draggable="true"
                    (dragstart)="onDragStart($event, step, index)"
                    (dragend)="onDragEnd($event)"
                    [class.completed]="step.status === 'success'"
                    [class.failed]="step.status === 'failed'">
                  <td class="order-cell">
                    <div class="order-controls">
                      <span class="drag-handle">☰</span>
                      <span class="order-number">{{ index + 1 }}</span>
                    </div>
                  </td>
                  <td class="step-info">
                    <div class="step-title">{{ step.title }}</div>
                    <div class="step-desc">{{ step.description }}</div>
                  </td>
                  <td>
                    <span class="priority" [class]="'priority-' + step.priority">
                      {{ step.priority | titlecase }}
                    </span>
                  </td>
                  <td>
                    <span class="status" [class]="'status-' + step.status">
                      {{ getStatusLabel(step.status) }}
                    </span>
                  </td>
                  <td>{{ step.location }}</td>
                  <td>{{ step.startDate ? (step.startDate | date:'MMM d, y') : '-' }}</td>
                  <td>{{ step.expectedDate | date:'MMM d, y' }}</td>
                  <td>$ {{ step.expectedCost | number }}</td>
                  <td>$ {{ step.actualCost | number }}</td>
                  <td class="actions-cell">
                    <select 
                      class="status-select-small"
                      [value]="step.status"
                      (change)="updateStepStatus(step, $event)">
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="postponed">Postponed</option>
                      <option value="stopped">Stopped</option>
                    </select>
                    <button 
                      class="btn-icon-small" 
                      (click)="editStep(step)"
                      title="Edit">
                      ✏️
                    </button>
                    <button 
                      class="btn-icon-small delete" 
                      (click)="deleteStep(step.id)"
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

      @if (currentSteps().length === 0) {
        <div class="empty-state">
          <p>No steps yet. Break down this task into actionable steps!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-list {
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
      font-size: 0.9rem;
    }
    .breadcrumb-item {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      text-decoration: none;
      font-size: inherit;
      padding: 0;
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
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
      font-size: 1.8rem;
      width: 50px;
      height: 50px;
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
    .status-icon.success {
      background: var(--success-light);
    }
    .status-icon.failed {
      background: var(--error-light);
    }
    .status-icon.postponed {
      background: var(--secondary-light);
    }
    .status-icon.stopped {
      background: var(--surface-elevated);
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
    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .step-item {
      display: flex;
      gap: 1.5rem;
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
      position: relative;
    }
    .step-item:hover {
      box-shadow: var(--shadow-md);
    }
    .step-item.completed {
      border-left: 4px solid var(--success);
      background: linear-gradient(to right, var(--success-light), var(--surface));
    }
    .step-item.failed {
      border-left: 4px solid var(--error);
      background: linear-gradient(to right, var(--error-light), var(--surface));
    }
    .step-item.dragging {
      opacity: 0.5;
      transform: rotate(2deg);
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
    .step-number {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      background: var(--primary);
      color: white;
      margin-top: 1rem;
    }
    .step-item.completed .step-number {
      background: var(--success);
    }
    .step-item.failed .step-number {
      background: var(--error);
    }
    .step-number .checkmark,
    .step-number .failed-mark {
      font-size: 1.2rem;
    }
    .step-content {
      flex: 1;
    }
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .step-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    .step-header h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.3rem;
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
    .status-success {
      background: var(--success-light);
      color: var(--success);
    }
    .status-failed {
      background: var(--error-light);
      color: var(--error);
    }
    .status-postponed {
      background: var(--secondary-light);
      color: var(--secondary);
    }
    .status-stopped {
      background: var(--surface-elevated);
      color: var(--text-secondary);
    }
    .description {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      line-height: 1.6;
    }
    .action-note {
      background: var(--warning-light);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid var(--warning);
    }
    .action-note strong {
      color: var(--warning);
    }
    .step-details {
      margin: 1.5rem 0;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    .detail-item .label {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .detail-item .value {
      color: var(--text-primary);
      font-weight: 500;
    }
    .step-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      align-items: center;
    }
    .status-select {
      padding: 0.5rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.9rem;
      background: var(--surface);
      color: var(--text-primary);
    }
    .status-select:focus {
      outline: none;
      border-color: var(--primary);
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
    .btn-success:hover {
      background: var(--success-dark);
    }
    .btn-secondary {
      background: var(--surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: var(--background);
    }
    .btn-danger {
      background: var(--error);
      color: white;
    }
    .btn-danger:hover {
      background: var(--error-dark);
    }
    /* Table Styles */
    .table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }
    .steps-table {
      width: 100%;
      border-collapse: collapse;
    }
    .steps-table th {
      background: var(--surface-elevated);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }
    .steps-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .step-row {
      transition: background-color 0.2s;
    }
    .step-row:hover {
      background: var(--surface-elevated);
    }
    .step-row.dragging {
      opacity: 0.5;
    }
    .step-row.completed {
      background: linear-gradient(to right, var(--success-light), transparent);
    }
    .step-row.failed {
      background: linear-gradient(to right, var(--error-light), transparent);
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
    .step-info {
      min-width: 200px;
    }
    .step-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .step-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .actions-cell {
      white-space: nowrap;
    }
    .status-select-small {
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      font-size: 0.8rem;
      background: var(--surface);
      color: var(--text-primary);
      margin-right: 0.5rem;
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
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
      grid-column: 1 / -1;
    }
    @media (max-width: 768px) {
      .step-list {
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
      .steps-container {
        grid-template-columns: 1fr;
      }
      .step-item {
        flex-direction: column;
        align-items: flex-start;
        padding-top: 1rem;
      }
      .step-number {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      .step-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .step-title-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
      .step-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .status-select {
        width: 100%;
        margin-bottom: 0.5rem;
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
      .steps-table {
        min-width: 1000px;
      }
    }
  `]
})
export class StepListComponent {
  private dataService = inject(DataService);
  private navigationService = inject(NavigationService);
  private authService = inject(AuthService);

  showCreateForm = false;
  viewMode = signal<'cards' | 'table'>('cards');
  startDateString = new Date().toISOString().split('T')[0];
  expectedDateString = new Date().toISOString().split('T')[0];
  draggedStep: Step | null = null;
  draggedIndex: number = -1;

  newStep: CreateStepRequest = {
    title: '',
    description: '',
    taskId: '',
    location: '',
    actionNote: '',
    startDate: undefined,
    expectedDate: new Date(),
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

  readonly currentTask = computed(() => {
    const state = this.navigationService.currentState();
    return state.selectedTaskId
      ? this.dataService.getTaskById(state.selectedTaskId)
      : undefined;
  });

  readonly currentSteps = computed(() => {
    const state = this.navigationService.currentState();
    return state.selectedTaskId
      ? this.dataService.getStepsByTask(state.selectedTaskId)
      : [];
  });

  readonly availableLocations = computed(() => this.dataService.allLocations());

  setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode.set(mode);
  }

  getStepCountByStatus(status: string): number {
    return this.currentSteps().filter(s => s.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'success': 'Success',
      'failed': 'Failed',
      'postponed': 'Postponed',
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
      if (state.selectedTaskId) {
        this.newStep.taskId = state.selectedTaskId;
      }
    }
  }

  createStep(): void {
    if (this.newStep.title && this.newStep.description && this.newStep.location && this.expectedDateString) {
      this.newStep.expectedDate = new Date(this.expectedDateString);
      if (this.startDateString) {
        this.newStep.startDate = new Date(this.startDateString);
      }
      this.dataService.createStep(this.newStep).then(() => {
        this.resetForm();
        this.showCreateForm = false;
      }).catch(error => {
        console.error('Failed to create step:', error);
        alert('Failed to create step. Please try again.');
      });
    }
  }

  updateStepStatus(step: Step, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value as Step['status'];
    const updates: Partial<Step> = {
      status: newStatus
    };

    if (newStatus === 'success' || newStatus === 'failed' || newStatus === 'stopped') {
      updates.actualEndDate = new Date();
    } else {
      updates.actualEndDate = undefined;
    }

    this.dataService.updateStep(step.id, updates).catch(error => {
      console.error('Failed to update step:', error);
      alert('Failed to update step. Please try again.');
    });
  }

  editStep(step: Step): void {
    console.log('Edit step:', step);
  }

  deleteStep(stepId: string): void {
    if (window.confirm('Are you sure you want to delete this step?')) {
      this.dataService.deleteStep(stepId).catch(error => {
        console.error('Failed to delete step:', error);
        alert('Failed to delete step. Please try again.');
      });
    }
  }

  // Drag and Drop functionality
  onDragStart(event: DragEvent, step: Step, index: number): void {
    this.draggedStep = step;
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
    this.draggedStep = null;
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

    if (!this.draggedStep) return;

    const target = (event.target as HTMLElement).closest('.step-item, .step-row');
    if (!target) return;

    const targetIndex = Array.from(target.parentElement!.children).indexOf(target);

    if (targetIndex !== -1 && targetIndex !== this.draggedIndex) {
      this.dataService.updateStepOrder(this.draggedStep.id, targetIndex);
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
    if (state.selectedCustomerId && state.selectedCompanyId && state.selectedProjectId) {
      this.navigationService.navigateToTasks(state.selectedCustomerId, state.selectedCompanyId, state.selectedProjectId);
    }
  }

  private resetForm(): void {
    this.newStep = {
      title: '',
      description: '',
      taskId: '',
      location: '',
      actionNote: '',
      startDate: undefined,
      expectedDate: new Date(),
      expectedCost: 0,
      priority: 'medium'
    };
    this.startDateString = '';
    this.expectedDateString = '';
  }
}