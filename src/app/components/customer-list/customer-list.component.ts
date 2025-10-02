import { Component, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { NavigationService } from "../../services/navigation.service";
import { Customer, CreateCustomerRequest } from "../../models/customer.model";

@Component({
  selector: "app-customer-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./customer-list.component.html",
  styles: [
    `
      .customer-list {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        margin-bottom: 1rem;
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

      .filter-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--surface-elevated);
        padding: 0.25rem 0.5rem;
        border-radius: 8px;
        border: 1px solid var(--border);
      }

      .filter-control input[type="text"] {
        border: none;
        background: transparent;
        padding: 0.4rem 0.5rem;
        outline: none;
        min-width: 220px;
        color: var(--text-primary);
      }

      .clear-filter {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
      }

      .clear-filter:hover {
        background: var(--surface);
        color: var(--text-primary);
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

      .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--border);
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s;
      }

      .form-group input:focus {
        outline: none;
        border-color: var(--primary);
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      .table-container {
        background: var(--surface);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
      }

      .customers-table {
        width: 100%;
        border-collapse: collapse;
      }

      .customers-table thead {
        background: var(--surface-elevated);
        border-bottom: 2px solid var(--border);
      }

      .customers-table th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .customers-table tbody tr {
        border-bottom: 1px solid var(--border);
        transition: background 0.2s;
        cursor: pointer;
      }

      .customers-table tbody tr:hover {
        background: var(--surface-elevated);
      }

      .customers-table tbody tr:last-child {
        border-bottom: none;
      }

      .customers-table td {
        padding: 1rem;
        color: var(--text-primary);
      }

      .customer-name {
        color: var(--text-primary);
      }

      .email-cell {
        color: var(--primary);
      }

      .centered {
        text-align: center;
      }

      .company-count {
        background: var(--primary-light);
        color: var(--primary);
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .actions-cell {
        text-align: right;
      }

      .actions-cell .btn-icon {
        margin-left: 0.25rem;
      }

      .customers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.5rem;
      }

      .customer-card {
        background: var(--surface);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }

      .customer-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary);
      }

      .customer-info h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.25rem;
      }

      .customer-info p {
        margin: 0.25rem 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .customer-info .email {
        color: var(--primary);
      }

      .customer-stats {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        display: flex;
        gap: 2rem;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat .count {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--primary);
      }

      .stat .label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .customer-actions {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .customer-card:hover .customer-actions {
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

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
      }

      .empty-state p {
        font-size: 1.1rem;
        margin: 0;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
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

      @media (max-width: 768px) {
        .customer-list {
          padding: 1rem;
        }

        .customers-grid {
          grid-template-columns: 1fr;
        }

        .header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .header-actions {
          flex-direction: column;
        }

        .customer-actions {
          opacity: 1;
        }

        .table-container {
          overflow-x: auto;
        }

        .customers-table {
          min-width: 700px;
        }
      }
    `,
  ],
})
export class CustomerListComponent {
  public dataService = inject(DataService);
  private navigationService = inject(NavigationService);

  viewMode: "table" | "cards" = "cards";
  showCreateForm = false;
  filterName = "";
  newCustomer: CreateCustomerRequest = {
    name: "",
    email: "",
    phone: "",
  };

  readonly currentCustomers = computed(() => this.dataService.allCustomers());

  ngOnInit(): void {}

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  createCustomer(): void {
    if (this.newCustomer.name && this.newCustomer.email) {
      this.dataService
        .createCustomer(this.newCustomer)
        .then(() => {
          this.resetForm();
          this.showCreateForm = false;
        })
        .catch((error) => {
          console.error("Failed to create customer:", error);
          alert("Failed to create customer. Please try again.");
        });
    }
  }

  selectCustomer(customer: Customer): void {
    this.navigationService.navigateToCompanies(customer.id);
  }

  filteredCustomers(): Customer[] {
    const term = this.filterName.trim().toLowerCase();
    const customers = this.currentCustomers();
    if (!term) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(term));
  }

  clearFilter(): void {
    this.filterName = "";
  }

  editCustomer(customer: Customer, event: Event): void {
    event.stopPropagation();
    // Implement edit functionality
    console.log("Edit customer:", customer);
  }

  deleteCustomer(customerId: string, event: Event): void {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this customer?")) {
      this.dataService.deleteCustomer(customerId).catch((error) => {
        console.error("Failed to delete customer:", error);
        alert("Failed to delete customer. Please try again.");
      });
    }
  }

  getProjectCount(customerId: string): number {
    return this.dataService.getCompaniesByCustomer(customerId).length;
  }

  private resetForm(): void {
    this.newCustomer = {
      name: "",
      email: "",
      phone: "",
    };
  }
}
