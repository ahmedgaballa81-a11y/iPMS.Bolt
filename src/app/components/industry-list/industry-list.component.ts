import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Industry, CreateIndustryRequest } from '../../models/industry.model';

@Component({
  selector: 'app-industry-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="industry-list">
      <div class="header">
        <h2>Industries</h2>
        <button class="btn btn-primary" (click)="toggleCreateForm()">
          ➕ Add Industry
        </button>
      </div>

      <div class="create-form" [class.visible]="showCreateForm()">
        <div class="form-card">
          <h3>{{ editingIndustry() ? 'Edit Industry' : 'Add New Industry' }}</h3>
          <form (ngSubmit)="saveIndustry()">
            <div class="form-group">
              <label for="name">Industry Name *</label>
              <input 
                type="text" 
                id="name" 
                [(ngModel)]="currentIndustry.name"
                name="name" 
                required>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                [(ngModel)]="currentIndustry.description"
                name="description" 
                rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelForm()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingIndustry() ? 'Update Industry' : 'Create Industry' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="industries-grid">
        @for (industry of dataService.allIndustries(); track industry.id) {
          <div class="industry-card">
            <div class="industry-header">
              <h3>{{ industry.name }}</h3>
              <div class="industry-actions">
                <button class="btn-icon" (click)="editIndustry(industry)" title="Edit">
                  ✏️
                </button>
                <button class="btn-icon delete" (click)="deleteIndustry(industry.id)" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
            @if (industry.description) {
              <p class="description">{{ industry.description }}</p>
            } @else {
              <p class="description text-muted">No description provided.</p>
            }
            <div class="industry-meta">
              <div class="meta-item">
                <span class="label">Created:</span>
                <span class="value">{{ industry.createdDate | date:'MMM d, y' }}</span>
              </div>
              @if (industry.updatedDate && industry.updatedDate !== industry.createdDate) {
                <div class="meta-item">
                  <span class="label">Updated:</span>
                  <span class="value">{{ industry.updatedDate | date:'MMM d, y' }}</span>
                </div>
              }
            </div>
          </div>
        }
        @if (dataService.allIndustries().length === 0) {
          <div class="empty-state">
            <p>No industries defined yet. Add your first industry!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .industry-list {
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
    .create-form {
      margin-bottom: 2rem;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }
    .create-form.visible {
      max-height: 600px;
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
    .industries-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .industry-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
      position: relative;
    }
    .industry-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary);
    }
    .industry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .industry-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }
    .industry-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .industry-card:hover .industry-actions {
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
    .industry-meta {
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
      grid-column: 1 / -1;
    }
    @media (max-width: 768px) {
      .industry-list {
        padding: 1rem;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      .industries-grid {
        grid-template-columns: 1fr;
      }
      .industry-actions {
        opacity: 1;
      }
    }
  `]
})
export class IndustryListComponent {
  public dataService = inject(DataService);

  showCreateForm = signal(false);
  editingIndustry = signal<Industry | null>(null);

  currentIndustry: CreateIndustryRequest = {
    name: '',
    description: ''
  };

  toggleCreateForm(): void {
    this.editingIndustry.set(null);
    this.resetForm();
    this.showCreateForm.update(current => !current);
  }

  editIndustry(industry: Industry): void {
    this.editingIndustry.set(industry);
    this.currentIndustry = {
      name: industry.name,
      description: industry.description
    };
    this.showCreateForm.set(true);
  }

  async saveIndustry(): Promise<void> {
    if (!this.currentIndustry.name) {
      alert('Industry name is required.');
      return;
    }

    try {
      if (this.editingIndustry()) {
        await this.dataService.updateIndustry(this.editingIndustry()!.id, this.currentIndustry);
      } else {
        await this.dataService.createIndustry(this.currentIndustry);
      }
      this.cancelForm();
    } catch (error) {
      console.error('Failed to save industry:', error);
      alert('Failed to save industry. Please try again.');
    }
  }

  async deleteIndustry(industryId: string): Promise<void> {
    if (window.confirm('Are you sure you want to delete this industry?')) {
      try {
        await this.dataService.deleteIndustry(industryId);
      } catch (error) {
        console.error('Failed to delete industry:', error);
        alert('Failed to delete industry. Please try again.');
      }
    }
  }

  cancelForm(): void {
    this.showCreateForm.set(false);
    this.editingIndustry.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.currentIndustry = {
      name: '',
      description: ''
    };
  }
}