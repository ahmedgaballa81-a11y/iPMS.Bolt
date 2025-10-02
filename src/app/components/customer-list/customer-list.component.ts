import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { NavigationService } from "../../services/navigation.service";
import { Company, CreateCompanyRequest } from "../../models/company.model";

@Component({
  selector: "app-company-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="company-list">
      <div class="header">
        <h2>Companies</h2>
        <button class="btn btn-primary" (click)="toggleCreateForm()">
          Add Company
        </button>
      </div>

      <div class="create-form" [class.visible]="showCreateForm">
        <div class="form-card">
          <h3>Add New Company</h3>
          <form (ngSubmit)="createCompany()">
            <div class="form-row">
              <div class="form-group">
                <label for="customer">Customer *</label>
                <select
                  id="customer"
                  [(ngModel)]="newCompany.customerId"
                  name="customer"
                  required
                >
                  <option value="">Select Customer</option>
                  @for (customer of dataService.allCustomers(); track
                  customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label for="name">Company Name *</label>
                <input
                  type="text"
                  id="name"
                  [(ngModel)]="newCompany.name"
                  name="name"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="newCompany.email"
                  name="email"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  [(ngModel)]="newCompany.phone"
                  name="phone"
                />
              </div>
              <div class="form-group">
                <label for="mobile">Mobile</label>
                <input
                  type="tel"
                  id="mobile"
                  [(ngModel)]="newCompany.mobile"
                  name="mobile"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="website">Website</label>
                <input
                  type="url"
                  id="website"
                  [(ngModel)]="newCompany.website"
                  name="website"
                />
              </div>
              <div class="form-group">
                <label for="activity">Activity</label>
                <select
                  id="activity"
                  [(ngModel)]="newCompany.activityId"
                  name="activity"
                >
                  <option value="">Select Activity</option>
                  @for (activity of dataService.allActivities(); track
                  activity.id) {
                  <option [value]="activity.id">{{ activity.name }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="mainAddress">Main Address</label>
              <input
                type="text"
                id="mainAddress"
                [(ngModel)]="newCompany.mainAddress"
                name="mainAddress"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="taxRegistrationNumber"
                  >Tax Registration Number</label
                >
                <input
                  type="text"
                  id="taxRegistrationNumber"
                  [(ngModel)]="newCompany.taxRegistrationNumber"
                  name="taxRegistrationNumber"
                />
              </div>
              <div class="form-group">
                <label for="taxAuthority">Tax Authority</label>
                <input
                  type="text"
                  id="taxAuthority"
                  [(ngModel)]="newCompany.taxAuthority"
                  name="taxAuthority"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="taxCardData">Tax Card Data</label>
                <input
                  type="text"
                  id="taxCardData"
                  [(ngModel)]="newCompany.taxCardData"
                  name="taxCardData"
                />
              </div>
              <div class="form-group">
                <label for="commercialRegisterData"
                  >Commercial Register Data</label
                >
                <input
                  type="text"
                  id="commercialRegisterData"
                  [(ngModel)]="newCompany.commercialRegisterData"
                  name="commercialRegisterData"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="importCardData">Import Card Data</label>
                <input
                  type="text"
                  id="importCardData"
                  [(ngModel)]="newCompany.importCardData"
                  name="importCardData"
                />
              </div>
              <div class="form-group">
                <label for="exportCardData">Export Card Data</label>
                <input
                  type="text"
                  id="exportCardData"
                  [(ngModel)]="newCompany.exportCardData"
                  name="exportCardData"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                [(ngModel)]="newCompany.description"
                name="description"
                rows="3"
              ></textarea>
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
                Create Company
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="companies-grid">
        @for (company of dataService.allCompanies(); track company.id) {
        <div class="company-card" (click)="selectCompany(company)">
          <div class="company-header">
            <div class="company-info">
              <h3>{{ company.name }}</h3>
              <p class="customer-name">
                {{ getCustomerName(company.customerId) }}
              </p>
              <p class="email">{{ company.email }}</p>
              @if (company.activityId) {
              <span class="industry-tag">{{
                getActivityName(company.activityId)
              }}</span>
              }
            </div>
            <div class="company-status">
              <span class="status" [class.active]="company.isActive">
                {{ company.isActive ? "Active" : "Inactive" }}
              </span>
            </div>
          </div>

          

          @if (company.description) {
          <div class="company-description">
            <p>{{ company.description }}</p>
          </div>
          }

          <div class="company-stats">
            <div class="stat">
              <span class="count">{{
                dataService.getProjectsByCompany(company.id).length
              }}</span>
              <span class="label">Projects</span>
            </div>
          </div>

          <div class="company-actions">
            <button
              class="btn-icon"
              (click)="toggleCompanyStatus(company, $event)"
              [title]="company.isActive ? 'Deactivate' : 'Activate'"
            >
              {{ company.isActive ? "⏸️" : "▶️" }}
            </button>
            <button
              class="btn-icon"
              (click)="editCompany(company, $event)"
              title="Edit"
            >
              ✏️
            </button>
            <button
              class="btn-icon delete"
              (click)="deleteCompany(company.id, $event)"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
        }
      </div>

      @if (dataService.allCompanies().length === 0) {
      <div class="empty-state">
        <p>No companies yet. Create your first company to get started!</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .company-list {
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
        max-height: 1200px;
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
      .form-group select,
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
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--primary);
      }

      .companies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
      }

      .company-card {
        background: var(--surface);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }

      .company-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary);
      }

      .company-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .company-info h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.1rem;
      }

      .company-info .email {
        margin: 0 0 0.5rem 0;
        color: var(--primary);
        font-size: 0.9rem;
      }

      .company-info .customer-name {
        margin: 0 0 0.5rem 0;
        color: var(--secondary);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .industry-tag {
        background: var(--secondary-light);
        color: var(--secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
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

      .company-details {
        margin-bottom: 0.5rem;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .detail-item .value {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .company-description {
        background: var(--surface-elevated);
        padding: 0.5rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
      }

      .company-description p {
        margin: 0;
        color: var(--text-secondary);
        font-style: italic;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .company-stats {
        display: flex;
        gap: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border);
        margin-bottom: 0.5rem;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat .count {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--primary);
      }

      .stat .label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .company-actions {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .company-card:hover .company-actions {
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
        .company-list {
          padding: 1rem;
        }

        .companies-grid {
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

        .company-actions {
          opacity: 1;
        }
      }
    `,
  ],
})
export class CompanyListComponent {
  public dataService = inject(DataService);
  private navigationService = inject(NavigationService);

  showCreateForm = false;
  newCompany: CreateCompanyRequest = {
    name: "",
    email: "",
    phone: "",
    mobile: "",
    mainAddress: "",
    website: "",
    activityId: "",
    description: "",
    customerId: "",
    taxRegistrationNumber: "",
    taxAuthority: "",
    taxCardData: "",
    commercialRegisterData: "",
    importCardData: "",
    exportCardData: "",
  };

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  createCompany(): void {
    if (
      this.newCompany.name &&
      this.newCompany.email &&
      this.newCompany.customerId
    ) {
      this.dataService
        .createCompany(this.newCompany)
        .then(() => {
          this.resetForm();
          this.showCreateForm = false;
        })
        .catch((error) => {
          console.error("Failed to create company:", error);
          alert("Failed to create company. Please try again.");
        });
    }
  }

  selectCompany(company: Company): void {
    this.navigationService.navigateToProjects(company.customerId, company.id);
  }

  toggleCompanyStatus(company: Company, event: Event): void {
    event.stopPropagation();
    this.dataService
      .updateCompany(company.id, { isActive: !company.isActive })
      .catch((error) => {
        console.error("Failed to update company:", error);
        alert("Failed to update company. Please try again.");
      });
  }

  editCompany(company: Company, event: Event): void {
    event.stopPropagation();
    console.log("Edit company:", company);
  }

  deleteCompany(companyId: string, event: Event): void {
    event.stopPropagation();
    if (
      confirm(
        "Are you sure you want to delete this company? This will also delete all associated customers and projects."
      )
    ) {
      this.dataService.deleteCompany(companyId).catch((error) => {
        console.error("Failed to delete company:", error);
        alert("Failed to delete company. Please try again.");
      });
    }
  }

  getCustomerCount(companyId: string): number {
    return this.dataService.getCustomersByCompany(companyId).length;
  }

  getCustomerName = (customerId: string): string => {
    const customer = this.dataService.getCustomerById(customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  getActivityName = (activityId: string): string => {
    const activity = this.dataService.getActivityById(activityId);
    return activity ? activity.name : "Unknown Activity";
  };

  navigateToCustomers(): void {
    this.navigationService.navigateToCustomers();
  }

  private resetForm(): void {
    this.newCompany = {
      name: "",
      email: "",
      phone: "",
      mobile: "",
      mainAddress: "",
      website: "",
      activityId: "",
      description: "",
      customerId: "",
      taxRegistrationNumber: "",
      taxAuthority: "",
      taxCardData: "",
      commercialRegisterData: "",
      importCardData: "",
      exportCardData: "",
    };
  }
}
