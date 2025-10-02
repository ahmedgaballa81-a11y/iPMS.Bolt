import { Component, inject, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { NavigationService } from "../../services/navigation.service";
import { Project, CreateProjectRequest } from "../../models/project.model";

@Component({
  selector: "app-all-projects",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="all-projects">
      <div class="header">
        <h2>Projects</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              [class.active]="viewMode() === 'table'"
              (click)="setViewMode('table')"
              title="Table View"
            >
              ☰
            </button>
            <button
              class="toggle-btn"
              [class.active]="viewMode() === 'cards'"
              (click)="setViewMode('cards')"
              title="Card View"
            >
              ⊞
            </button>
          </div>
          <button class="btn btn-primary" (click)="toggleCreateForm()">
            ➕ Add Project &nbsp;&nbsp;&nbsp;
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-row">
          <div class="form-group">
            <label for="customerFilter">Customer</label>
            <div class="autocomplete-container">
              <input
                type="text"
                id="customerFilter"
                [ngModel]="customerFilter()"
                (ngModelChange)="customerFilter.set($event)"
                name="customerFilter"
                placeholder="Filter by customer name"
                class="autocomplete-input"
              />
              @if (customerFilter() && filteredCustomerNames().length > 0) {
              <div class="autocomplete-dropdown">
                @for (customerName of filteredCustomerNames(); track
                customerName) {
                <div
                  class="autocomplete-item"
                  (click)="customerFilter.set(customerName)"
                >
                  {{ customerName }}
                </div>
                }
              </div>
              }
            </div>
          </div>
          <div class="form-group">
            <label for="companyFilter">Company</label>
            <div class="autocomplete-container">
              <input
                type="text"
                id="companyFilter"
                [ngModel]="companyFilter()"
                (ngModelChange)="companyFilter.set($event)"
                name="companyFilter"
                placeholder="Filter by company name"
                class="autocomplete-input"
              />
              @if (companyFilter() && filteredCompanyNames().length > 0) {
              <div class="autocomplete-dropdown">
                @for (companyName of filteredCompanyNames(); track companyName)
                {
                <div
                  class="autocomplete-item"
                  (click)="companyFilter.set(companyName)"
                >
                  {{ companyName }}
                </div>
                }
              </div>
              }
            </div>
          </div>
          <div class="form-group">
            <label for="projectFilter">Project</label>
            <div class="autocomplete-container">
              <input
                type="text"
                id="projectFilter"
                [ngModel]="projectFilter()"
                (ngModelChange)="projectFilter.set($event)"
                name="projectFilter"
                placeholder="Filter by project name"
                class="autocomplete-input"
              />
              @if (projectFilter() && filteredProjectNames().length > 0) {
              <div class="autocomplete-dropdown">
                @for (projectName of filteredProjectNames(); track projectName)
                {
                <div
                  class="autocomplete-item"
                  (click)="projectFilter.set(projectName)"
                >
                  {{ projectName }}
                </div>
                }
              </div>
              }
            </div>
          </div>
          <div class="form-group">
            <label for="statusFilter">Status</label>
            <select
              id="statusFilter"
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event)"
              name="statusFilter"
            >
              <option value="">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="stopped">Stopped</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="form-group">
            <button class="btn btn-secondary" (click)="clearFilters()">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Create Project Form -->
      <div class="create-form" [class.visible]="showCreateForm()">
        <div class="form-card">
          <h3>Add New Project</h3>
          <form (ngSubmit)="createProject()">
            <div class="form-group">
              <label for="customer">Customer *</label>
              <select
                id="customer"
                [ngModel]="newProject().customerId"
                (ngModelChange)="updateNewProject('customerId', $event)"
                name="customer"
                required
              >
                <option value="">Select Customer</option>
                @for (customer of allCustomers(); track customer.id) {
                <option [value]="customer.id">{{ customer.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label for="company">Company *</label>
              <select
                id="company"
                [ngModel]="newProject().companyId"
                (ngModelChange)="updateNewProject('companyId', $event)"
                name="company"
                required
              >
                <option value="">Select Company</option>
                @for (company of
                getCompaniesByCustomer(newProject().customerId); track
                company.id) {
                <option [value]="company.id">{{ company.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label for="title">Title *</label>
              <input
                type="text"
                id="title"
                [ngModel]="newProject().title"
                (ngModelChange)="updateNewProject('title', $event)"
                name="title"
                required
              />
            </div>
            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                id="description"
                [ngModel]="newProject().description"
                (ngModelChange)="updateNewProject('description', $event)"
                name="description"
                required
                rows="3"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="priority">Priority *</label>
                <select
                  id="priority"
                  [ngModel]="newProject().priority"
                  (ngModelChange)="updateNewProject('priority', $event)"
                  name="priority"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div class="form-group">
                <label for="expectedCost">Expected Cost *</label>
                <input
                  type="number"
                  id="expectedCost"
                  [ngModel]="newProject().expectedCost"
                  (ngModelChange)="updateNewProject('expectedCost', $event)"
                  name="expectedCost"
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  [ngModel]="startDateString()"
                  (ngModelChange)="startDateString.set($event)"
                  name="startDate"
                />
              </div>
              <div class="form-group">
                <label for="expectedEndDate">Expected End Date *</label>
                <input
                  type="date"
                  id="expectedEndDate"
                  [ngModel]="expectedEndDateString()"
                  (ngModelChange)="expectedEndDateString.set($event)"
                  name="expectedEndDate"
                  required
                />
              </div>
            </div>
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="toggleCreateForm()"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Project Form -->
      <div class="create-form" [class.visible]="showEditForm()">
        <div class="form-card">
          <h3>Edit Project</h3>
          <form (ngSubmit)="updateProject()">
            <div class="form-group">
              <label for="editTitle">Title *</label>
              <input
                type="text"
                id="editTitle"
                [ngModel]="editingProject().title"
                (ngModelChange)="updateEditingProject('title', $event)"
                name="editTitle"
                required
              />
            </div>
            <div class="form-group">
              <label for="editDescription">Description *</label>
              <textarea
                id="editDescription"
                [ngModel]="editingProject().description"
                (ngModelChange)="updateEditingProject('description', $event)"
                name="editDescription"
                required
                rows="3"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="editPriority">Priority *</label>
                <select
                  id="editPriority"
                  [ngModel]="editingProject().priority"
                  (ngModelChange)="updateEditingProject('priority', $event)"
                  name="editPriority"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div class="form-group">
                <label for="editExpectedCost">Expected Cost *</label>
                <input
                  type="number"
                  id="editExpectedCost"
                  [ngModel]="editingProject().expectedCost"
                  (ngModelChange)="updateEditingProject('expectedCost', $event)"
                  name="editExpectedCost"
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="editStartDate">Start Date</label>
                <input
                  type="date"
                  id="editStartDate"
                  [ngModel]="editStartDateString()"
                  (ngModelChange)="editStartDateString.set($event)"
                  name="editStartDate"
                />
              </div>
              <div class="form-group">
                <label for="editExpectedEndDate">Expected End Date *</label>
                <input
                  type="date"
                  id="editExpectedEndDate"
                  [ngModel]="editExpectedEndDateString()"
                  (ngModelChange)="editExpectedEndDateString.set($event)"
                  name="editExpectedEndDate"
                  required
                />
              </div>
            </div>
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="cancelEdit()"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Update Project
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Status Overview -->
      <div class="status-overview">
        <div class="status-card">
          <div class="status-icon not-started">🕒</div>
          <div class="status-info">
            <span class="count">{{
              getProjectCountByStatus("not-started")
            }}</span>
            <span class="label">Not Started</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon in-progress">🚀</div>
          <div class="status-info">
            <span class="count">{{
              getProjectCountByStatus("in-progress")
            }}</span>
            <span class="label">In Progress</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon completed">✅</div>
          <div class="status-info">
            <span class="count">{{
              getProjectCountByStatus("completed")
            }}</span>
            <span class="label">Completed</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon stopped">⏸️</div>
          <div class="status-info">
            <span class="count">{{ getProjectCountByStatus("stopped") }}</span>
            <span class="label">Stopped</span>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon archived">🗄️</div>
          <div class="status-info">
            <span class="count">{{ getProjectCountByStatus("archived") }}</span>
            <span class="label">Archived</span>
          </div>
        </div>
      </div>

      <!-- Cards View -->
      @if (viewMode() === 'cards') {
      <div class="projects-grid">
        @for (project of filteredProjects(); track project.id) {
        <div class="project-card" (click)="selectProject(project)">
          <div class="project-header">
            <h3>{{ project.title }}</h3>
            <div class="project-badges">
              <span class="priority" [class]="'priority-' + project.priority">
                {{ project.priority | titlecase }}
              </span>
              <span class="status" [class]="'status-' + project.status">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
          </div>

          <!-- <div class="customer-info">
                <span class="customer-label">Customer:</span>
                <span class="customer-name">{{ getCustomerName(project.customerId) }}</span>
              </div>
              
              <div class="company-info">
                <span class="company-label">Company:</span>
                <span class="company-name">{{ getCompanyName(project.companyId) }}</span>
              </div> -->

          <div class="project-client-info">
            <div class="client-item">
              <span class="client-label">Customer:</span>
              <span class="client-name">{{
                getCustomerName(project.customerId)
              }}</span>
            </div>
            <div class="client-item">
              <span class="client-label">Company:</span>
              <span class="client-name">{{
                getCompanyName(project.companyId)
              }}</span>
            </div>
          </div>

          <p class="description">{{ project.description }}</p>

          <div class="project-stats">
            <div class="stat-row">
              <div class="stat">
                <span class="label">Tasks</span>
                <span class="value">{{ getTaskCount(project.id) }}</span>
              </div>
              <div class="stat">
                <span class="label">Progress</span>
                <span class="value">{{ project.progress }}%</span>
              </div>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="project.progress"
              ></div>
            </div>
          </div>

          <div class="project-details">
            @if (project.startDate) {
            <div class="detail-row">
              <span class="label">Started:</span>
              <span class="value">{{
                project.startDate | date : "MMM d, y"
              }}</span>
            </div>
            }
            <div class="detail-row">
              <span class="label">Expected End:</span>
              <span class="value">{{
                project.expectedEndDate | date : "MMM d, y"
              }}</span>
            </div>
            @if (project.actualEndDate) {
            <div class="detail-row">
              <span class="label">Actual End:</span>
              <span class="value">{{
                project.actualEndDate | date : "MMM d, y"
              }}</span>
            </div>
            }
            <div class="detail-row">
              <span class="label">Budget:</span>
              <span class="value">$ {{ project.expectedCost | number }}</span>
            </div>
            @if (project.actualCost > 0) {
            <div class="detail-row">
              <span class="label">Spent:</span>
              <span class="value">$ {{ project.actualCost | number }}</span>
            </div>
            }
          </div>

          <div class="project-actions">
            @if (!project.isArchived) {
            <button
              class="btn-icon archive"
              (click)="archiveProject(project.id, $event)"
              title="Archive"
            >
              🗄️
            </button>
            } @else {
            <button
              class="btn-icon unarchive"
              (click)="unarchiveProject(project.id, $event)"
              title="Unarchive"
            >
              📤
            </button>
            }
            <button
              class="btn-icon"
              (click)="editProject(project, $event)"
              title="Edit"
            >
              ✏️
            </button>
            <button
              class="btn-icon delete"
              (click)="deleteProject(project.id, $event)"
              title="Delete"
            >
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
        <table class="projects-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Customer</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Start Date</th>
              <th>Expected End</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (project of filteredProjects(); track project.id) {
            <tr class="project-row" (click)="selectProject(project)">
              <td class="project-info">
                <div class="project-title">{{ project.title }}</div>
                <div class="project-desc">{{ project.description }}</div>
                <div class="project-client-info-table">
                  <div class="client-info-row">
                    <span class="client-label">Customer:</span>
                    <span class="client-name">{{
                      getCustomerName(project.customerId)
                    }}</span>
                  </div>
                  <div class="client-info-row">
                    <span class="client-label">Company:</span>
                    <span class="client-name">{{
                      getCompanyName(project.companyId)
                    }}</span>
                  </div>
                </div>
              </td>
              <td class="customer-cell">
                {{ getCustomerName(project.customerId) }}
              </td>
              <td>
                <span class="priority" [class]="'priority-' + project.priority">
                  {{ project.priority | titlecase }}
                </span>
              </td>
              <td>
                <span class="status" [class]="'status-' + project.status">
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>
              <td>
                <div class="progress-cell">
                  <div class="progress-bar-small">
                    <div
                      class="progress-fill"
                      [style.width.%]="project.progress"
                    ></div>
                  </div>
                  <span class="progress-text">{{ project.progress }}%</span>
                </div>
              </td>
              <td>
                {{
                  project.startDate
                    ? (project.startDate | date : "MMM d, y")
                    : "-"
                }}
              </td>
              <td>{{ project.expectedEndDate | date : "MMM d, y" }}</td>
              <td>$ {{ project.expectedCost | number }}</td>
              <td>$ {{ project.actualCost | number }}</td>
              <td>{{ getTaskCount(project.id) }}</td>
              <td class="actions-cell">
                @if (!project.isArchived) {
                <button
                  class="btn-icon-small archive"
                  (click)="archiveProject(project.id, $event)"
                  title="Archive"
                >
                  🗄️
                </button>
                } @else {
                <button
                  class="btn-icon-small unarchive"
                  (click)="unarchiveProject(project.id, $event)"
                  title="Unarchive"
                >
                  📤
                </button>
                }
                <button
                  class="btn-icon-small"
                  (click)="editProject(project, $event)"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon-small delete"
                  (click)="deleteProject(project.id, $event)"
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      } @if (filteredProjects().length === 0) {
      <div class="empty-state">
        <p>
          {{
            hasFilters()
              ? "No projects match your filters."
              : "No projects yet."
          }}
        </p>
        <button
          class="btn btn-primary"
          (click)="toggleCreateForm()"
          [class.btn-danger]="showCreateForm()"
        >
          {{ showCreateForm() ? "Cancel" : "Create New Project" }}
        </button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .all-projects {
        padding: 2rem;
        max-width: 1400px;
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

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .view-toggle {
        display: flex;
        gap: 0.5rem;
        background: var(--surface-elevated);
        padding: 0.25rem;
        border-radius: 8px;
        border: 1px solid var(--border);
      }

      .toggle-btn {
        background: transparent;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1.2rem;
        color: var(--text-secondary);
        transition: all 0.2s;
      }

      .toggle-btn:hover {
        background: var(--surface);
        color: var(--text-primary);
      }

      .toggle-btn.active {
        background: var(--primary);
        color: white;
      }

      .toggle-btn:hover:not(.active) {
        background: var(--background);
        color: var(--text-primary);
      }

      .filters {
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

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 0.9rem;
      }

      .form-group input,
      .form-group select {
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

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .autocomplete-container {
        position: relative;
      }

      .autocomplete-input {
        width: 100%;
      }

      .autocomplete-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--surface);
        border: 1px solid var(--border);
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: var(--shadow-md);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
      }

      .autocomplete-item {
        padding: 0.75rem;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid var(--border);
      }

      .autocomplete-item:last-child {
        border-bottom: none;
      }

      .autocomplete-item:hover {
        background: var(--surface-elevated);
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

      .status-icon.completed {
        background: var(--success-light);
      }

      .status-icon.stopped {
        background: var(--error-light);
      }

      .status-icon.archived {
        background: var(--surface-elevated);
      }

      .status-info {
        display: flex;
        flex-direction: column;
      }

      .status-info .count {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1;
      }

      .status-info .label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(
          auto-fill,
          minmax(280px, 1fr)
        ); /* Decreased min-width here */
        gap: 1.5rem;
      }

      .project-card {
        background: var(--surface);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }

      .project-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary);
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .project-header h3 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.25rem;
        flex: 1;
      }

      .project-badges {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-end;
      }

      .customer-info {
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: var(--surface-elevated);
        border-radius: 8px;
      }

      .customer-label {
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .customer-name {
        color: var(--primary);
        font-weight: 600;
        margin-left: 0.5rem;
      }

      .priority {
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .priority-critical {
        background: var(--error-light);
        color: var(--error);
      }

      .priority-high {
        background: var(--warning-light);
        color: var(--warning);
      }

      .priority-medium {
        background: var(--primary-light);
        color: var(--primary);
      }

      .priority-low {
        background: var(--success-light);
        color: var(--success);
      }

      .status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
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

      .status-completed {
        background: var(--success-light);
        color: var(--success);
      }

      .status-stopped {
        background: var(--error-light);
        color: var(--error);
      }

      .status-archived {
        background: var(--surface-elevated);
        color: var(--text-secondary);
      }

      .description {
        color: var(--text-secondary);
        margin: 0 0 1.5rem 0;
        line-height: 1.5;
      }

      .project-stats {
        margin-bottom: 1.5rem;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
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

      .project-details {
        border-top: 1px solid var(--border);
        padding-top: 1rem;
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

      .project-actions {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .project-card:hover .project-actions {
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
      }

      .btn-icon:hover {
        background: var(--primary);
        color: white;
      }

      .btn-icon.delete:hover {
        background: var(--error);
      }

      .btn-icon.archive:hover {
        background: var(--warning);
      }

      .btn-icon.unarchive:hover {
        background: var(--success);
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-dark);
      }

      /* Table Styles */
      .table-container {
        background: var(--surface);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
      }

      .projects-table {
        width: 100%;
        border-collapse: collapse;
      }

      .projects-table th {
        background: var(--surface-elevated);
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border);
        font-size: 0.9rem;
      }

      .projects-table td {
        padding: 1rem;
        border-bottom: 1px solid var(--border);
        vertical-align: middle;
      }

      .project-row {
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .project-row:hover {
        background: var(--surface-elevated);
      }

      .project-info {
        min-width: 200px;
      }

      .project-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .project-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .project-client-info-table {
        margin-top: 0.5rem;
      }

      .project-client-info {
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: var(--surface-elevated);
        border-radius: 8px;
        border-left: 4px solid var(--primary);
      }

      .client-info-row {
        display: flex;
        align-items: center;
        margin-bottom: 0.25rem;
      }

      .client-info-row:last-child {
        margin-bottom: 0;
      }

      .client-info-row .client-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: 500;
        min-width: 70px;
      }

      .client-info-row .client-name {
        font-size: 0.8rem;
        color: var(--primary);
        font-weight: 600;
        margin-left: 0.25rem;
      }

      .client-name {
        color: var(--primary);
        font-weight: 600;
        margin-left: 0.5rem;
      }

      .customer-cell {
        color: var(--primary);
        font-weight: 500;
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

      .btn-icon-small.archive:hover {
        background: var(--warning);
      }

      .btn-icon-small.unarchive:hover {
        background: var(--success);
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

      .btn-danger {
        background: var(--error);
        color: white;
      }

      .btn-danger:hover {
        background: var(--error-dark);
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
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
      }

      .btn-secondary {
        background: var(--surface-elevated);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }

      .btn-secondary:hover {
        background: var(--background);
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
      }

      @media (max-width: 768px) {
        .all-projects {
          padding: 1rem;
        }

        .header {
          flex-direction: column;
          align-items: stretch;
        }

        .header-actions {
          justify-content: space-between;
        }

        .projects-grid {
          grid-template-columns: 1fr;
        }

        .filter-row {
          grid-template-columns: 1fr;
        }

        .project-actions {
          opacity: 1;
        }

        .status-overview {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .table-container {
          overflow-x: auto;
        }

        .projects-table {
          min-width: 1000px;
        }
      }
    `,
  ],
})
export class AllProjectsComponent {
  private dataService = inject(DataService);
  private navigationService = inject(NavigationService);

  viewMode = signal<"cards" | "table">("cards");
  customerFilter = signal("");
  companyFilter = signal("");
  projectFilter = signal("");
  statusFilter = signal("");
  showCreateForm = signal(false);
  showEditForm = signal(false); // New signal for edit form visibility
  editingProjectId = signal<string | null>(null); // New signal to store the ID of the project being edited

  newProject = signal<CreateProjectRequest>({
    title: "",
    description: "",
    priority: "medium",
    expectedCost: 0,
    expectedEndDate: new Date(),
    customerId: "",
    companyId: "",
  });

  editingProject = signal<Partial<Project>>({}); // New signal for the project being edited

  startDateString = signal("");
  expectedEndDateString = signal("");
  editStartDateString = signal(""); // New signal for edit form start date
  editExpectedEndDateString = signal(""); // New signal for edit form expected end date

  readonly allCustomers = computed(() => this.dataService.allCustomers());
  readonly allCompanies = computed(() => this.dataService.allCompanies());
  readonly allProjects = computed(() => this.dataService.allProjects());

  readonly uniqueCustomerNames = computed(() => {
    const customers = this.allCustomers();
    return [...new Set(customers.map((c) => c.name))].sort();
  });

  readonly uniqueProjectNames = computed(() => {
    const projects = this.allProjects();
    return [...new Set(projects.map((p) => p.title))].sort();
  });

  readonly uniqueCompanyNames = computed(() => {
    const companies = this.allCompanies();
    return [...new Set(companies.map((c) => c.name))].sort();
  });
  readonly filteredCustomerNames = computed(() => {
    const filter = this.customerFilter().toLowerCase();
    if (!filter) return this.uniqueCustomerNames();
    return this.uniqueCustomerNames().filter((name) =>
      name.toLowerCase().includes(filter)
    );
  });

  readonly filteredProjectNames = computed(() => {
    const filter = this.projectFilter().toLowerCase();
    if (!filter) return this.uniqueProjectNames();
    return this.uniqueProjectNames().filter((name) =>
      name.toLowerCase().includes(filter)
    );
  });

  readonly filteredCompanyNames = computed(() => {
    const filter = this.companyFilter().toLowerCase();
    if (!filter) return this.uniqueCompanyNames();
    return this.uniqueCompanyNames().filter((name) =>
      name.toLowerCase().includes(filter)
    );
  });
  readonly filteredProjects = computed(() => {
    let projects = this.allProjects();

    if (this.customerFilter()) {
      const customerFilterLower = this.customerFilter().toLowerCase();
      projects = projects.filter((project) => {
        const customer = this.getCustomerName(project.customerId);
        return customer.toLowerCase().includes(customerFilterLower);
      });
    }

    if (this.companyFilter()) {
      const companyFilterLower = this.companyFilter().toLowerCase();
      projects = projects.filter((project) => {
        const company = this.getCompanyName(project.companyId);
        return company.toLowerCase().includes(companyFilterLower);
      });
    }

    if (this.projectFilter()) {
      projects = projects.filter(
        (project) =>
          project.title
            .toLowerCase()
            .includes(this.projectFilter().toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(this.projectFilter().toLowerCase())
      );
    }

    if (this.statusFilter()) {
      projects = projects.filter(
        (project) => project.status === this.statusFilter()
      );
    }

    return projects;
  });

  setViewMode(mode: "cards" | "table"): void {
    this.viewMode.set(mode);
  }

  applyFilters(): void {
    // Filters are applied automatically through computed signals
  }

  clearFilters(): void {
    this.customerFilter.set("");
    this.companyFilter.set("");
    this.projectFilter.set("");
    this.statusFilter.set("");
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((current) => !current);
    this.showEditForm.set(false); // Hide edit form if create is opened
    if (!this.showCreateForm()) {
      this.resetForm();
    }
  }

  updateNewProject(field: keyof CreateProjectRequest, value: any): void {
    this.newProject.update((current) => ({ ...current, [field]: value }));
  }

  updateEditingProject(field: string, value: any): void {
    this.editingProject.update((current) => ({ ...current, [field]: value }));
  }

  createProject(): void {
    const project = this.newProject();

    if (
      !project.title ||
      !project.description ||
      !project.customerId ||
      !project.companyId
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const startDate = this.startDateString()
      ? new Date(this.startDateString())
      : undefined;
    const expectedEndDate = new Date(this.expectedEndDateString());

    const projectData: CreateProjectRequest = {
      ...project,
      startDate,
      expectedEndDate,
    };

    this.dataService
      .createProject(projectData)
      .then(() => {
        this.resetForm();
        this.toggleCreateForm();
      })
      .catch((error) => {
        console.error("Failed to create project:", error);
        alert("Failed to create project. Please try again.");
      });
  }

  getCompaniesByCustomer(customerId: string): any[] {
    if (!customerId) return [];
    return this.dataService.getCompaniesByCustomer(customerId);
  }

  resetForm(): void {
    this.newProject.set({
      title: "",
      description: "",
      priority: "medium",
      expectedCost: 0,
      expectedEndDate: new Date(),
      customerId: "",
      companyId: "",
    });
    this.startDateString.set("");
    this.expectedEndDateString.set("");
  }

  hasFilters(): boolean {
    return !!(
      this.customerFilter() ||
      this.projectFilter() ||
      this.statusFilter()
    );
  }

  getProjectCountByStatus(status: string): number {
    return this.filteredProjects().filter((p) => p.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      "not-started": "Not Started",
      "in-progress": "In Progress",
      completed: "Completed",
      stopped: "Stopped",
      archived: "Archived",
    };
    return labels[status] || status;
  }

  getCustomerName(customerId: string): string {
    const customer = this.allCustomers().find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  }

  getCompanyName(companyId: string): string {
    const company = this.dataService.getCompanyById(companyId);
    return company ? company.name : "Unknown Company";
  }

  getTaskCount(projectId: string): number {
    return this.dataService.getTasksByProject(projectId).length;
  }

  selectProject(project: Project): void {
    if (project.isArchived) return; // Don't navigate to archived projects

    this.navigationService.navigateToTasks(
      project.customerId,
      project.companyId,
      project.id
    );
  }

  editProject(project: Project, event: Event): void {
    event.stopPropagation();
    this.editingProject.set({ ...project });
    this.editingProjectId.set(project.id);
    this.showCreateForm.set(false); // Hide create form if edit is opened
    this.showEditForm.set(true);

    // Set date strings for form inputs
    this.editStartDateString.set(
      project.startDate ? project.startDate.toISOString().split("T")[0] : ""
    );
    this.editExpectedEndDateString.set(
      project.expectedEndDate.toISOString().split("T")[0]
    );
  }

  updateProject(): void {
    const project = this.editingProject();
    const projectId = this.editingProjectId();

    if (!projectId || !project.title || !project.description) {
      alert("Please fill in all required fields");
      return;
    }

    const startDate = this.editStartDateString()
      ? new Date(this.editStartDateString())
      : undefined;
    const expectedEndDate = new Date(this.editExpectedEndDateString());

    const updatedProject: Partial<Project> = {
      ...project,
      startDate,
      expectedEndDate,
    };

    this.dataService
      .updateProject(projectId, updatedProject)
      .then(() => {
        this.cancelEdit();
      })
      .catch((error) => {
        console.error("Failed to update project:", error);
        alert("Failed to update project. Please try again.");
      });
  }

  cancelEdit(): void {
    this.showEditForm.set(false);
    this.editingProject.set({});
    this.editingProjectId.set(null);
    this.editStartDateString.set("");
    this.editExpectedEndDateString.set("");
  }

  deleteProject(projectId: string, event: Event): void {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      this.dataService.deleteProject(projectId).catch((error) => {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project. Please try again.");
      });
    }
  }

  archiveProject(projectId: string, event: Event): void {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to archive this project?")) {
      this.dataService.archiveProject(projectId).catch((error) => {
        console.error("Failed to archive project:", error);
        alert("Failed to archive project. Please try again.");
      });
    }
  }

  unarchiveProject(projectId: string, event: Event): void {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to unarchive this project?")) {
      this.dataService.unarchiveProject(projectId).catch((error) => {
        console.error("Failed to unarchive project:", error);
        alert("Failed to unarchive project. Please try again.");
      });
    }
  }
}