import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Location, CreateLocationRequest } from '../../models/location.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="location-list">
      <div class="header">
        <h2>Locations</h2>
        <button class="btn btn-primary" (click)="toggleCreateForm()">
          ➕ Add Location
        </button>
      </div>

      <div class="create-form" [class.visible]="showCreateForm">
        <div class="form-card">
          <h3>Add New Location</h3>
          <form (ngSubmit)="createLocation()">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  [(ngModel)]="newLocation.name"
                  name="name" 
                  required>
              </div>
              <div class="form-group">
                <label for="country">Country *</label>
                <input 
                  type="text" 
                  id="country" 
                  [(ngModel)]="newLocation.country"
                  name="country" 
                  required>
              </div>
            </div>
            <div class="form-group">
              <label for="address">Address *</label>
              <input 
                type="text" 
                id="address" 
                [(ngModel)]="newLocation.address"
                name="address" 
                required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="city">City *</label>
                <input 
                  type="text" 
                  id="city" 
                  [(ngModel)]="newLocation.city"
                  name="city" 
                  required>
              </div>
              <div class="form-group">
                <label for="state">State</label>
                <input 
                  type="text" 
                  id="state" 
                  [(ngModel)]="newLocation.state"
                  name="state">
              </div>
              <div class="form-group">
                <label for="postalCode">Postal Code</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  [(ngModel)]="newLocation.postalCode"
                  name="postalCode">
              </div>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                [(ngModel)]="newLocation.description"
                name="description"
                rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="toggleCreateForm()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Location
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="locations-grid">
        @for (location of dataService.allLocations(); track location.id) {
          <div class="location-card">
            <div class="location-header">
              <h3>{{ location.name }}</h3>
              <div class="location-actions">
                <button 
                  class="btn-icon" 
                  (click)="editLocation(location)"
                  title="Edit">
                  ✏️
                </button>
                <button 
                  class="btn-icon delete" 
                  (click)="deleteLocation(location.id)"
                  title="Delete">
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="location-info">
              <div class="address-section">
                <p class="address">📍 {{ location.address }}</p>
                <p class="city-state">
                  {{ location.city }}{{ location.state ? ', ' + location.state : '' }}
                  {{ location.postalCode ? ' ' + location.postalCode : '' }}
                </p>
                <p class="country">{{ location.country }}</p>
              </div>
              
              @if (location.description) {
                <div class="description-section">
                  <p class="description">{{ location.description }}</p>
                </div>
              }
            </div>

            <div class="location-meta">
              <div class="meta-item">
                <span class="label">Created</span>
                <span class="value">{{ location.createdDate | date:'MMM d, y' }}</span>
              </div>
              @if (location.updatedDate !== location.createdDate) {
                <div class="meta-item">
                  <span class="label">Updated</span>
                  <span class="value">{{ location.updatedDate | date:'MMM d, y' }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      @if (dataService.allLocations().length === 0) {
        <div class="empty-state">
          <p>No locations yet. Create your first location to get started!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .location-list {
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
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

    .locations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .location-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }

    .location-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .location-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.3rem;
    }

    .location-actions {
      display: flex;
      gap: 0.5rem;
    }

    .address-section {
      margin-bottom: 1rem;
    }

    .address-section p {
      margin: 0.25rem 0;
      color: var(--text-secondary);
    }

    .address {
      font-weight: 500;
      color: var(--text-primary) !important;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .city-state {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .description-section {
      padding: 1rem;
      background: var(--surface-elevated);
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .description {
      margin: 0;
      color: var(--text-secondary);
      font-style: italic;
    }

    .location-meta {
      display: flex;
      gap: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
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
      .location-list {
        padding: 1rem;
      }

      .locations-grid {
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

      .location-meta {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class LocationListComponent {
  public dataService = inject(DataService);

  showCreateForm = false;
  newLocation: CreateLocationRequest = {
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    description: ''
  };

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  createLocation(): void {
    if (this.newLocation.name && this.newLocation.address && this.newLocation.city && this.newLocation.country) {
      this.dataService.createLocation(this.newLocation).then(() => {
        this.resetForm();
        this.showCreateForm = false;
      }).catch(error => {
        console.error('Failed to create location:', error);
        alert('Failed to create location. Please try again.');
      });
    }
  }

  editLocation(location: Location): void {
    console.log('Edit location:', location);
  }

  deleteLocation(locationId: string): void {
    if (window.confirm('Are you sure you want to delete this location?')) {
      this.dataService.deleteLocation(locationId).catch(error => {
        console.error('Failed to delete location:', error);
        alert('Failed to delete location. Please try again.');
      });
    }
  }

  private resetForm(): void {
    this.newLocation = {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      description: ''
    };
  }
}