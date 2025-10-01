import { Injectable, signal } from '@angular/core';

export interface NavigationState {
  currentView: 'dashboard' | 'users' | 'companies' | 'customers' | 'projects' | 'all-projects' | 'tasks' | 'steps' | 'locations' | 'authorities' | 'activity-log' | 'company-activity-log' | 'industries' | 'company-details' | 'activities'; // Added activities
  selectedCustomerId?: string;
  selectedCompanyId?: string;
  selectedProjectId?: string;
  selectedTaskId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationState = signal<NavigationState>({
    currentView: 'dashboard'
  });

  readonly currentState = this.navigationState.asReadonly();

  navigateToDashboard(): void {
    this.navigationState.set({
      currentView: 'dashboard'
    });
  }

  navigateToUsers(): void {
    this.navigationState.set({
      currentView: 'users'
    });
  }

  navigateToCustomersList(): void {
    this.navigationState.set({
      currentView: 'customers'
    });
  }

  navigateToCustomers(): void {
    this.navigationState.set({
      currentView: 'customers'
    });
  }

  navigateToAllCompanies(): void {
    this.navigationState.set({
      currentView: 'companies'
    });
  }

  navigateToCompanies(customerId?: string): void { // Made customerId optional
    this.navigationState.set({
      currentView: 'companies',
      selectedCustomerId: customerId
    });
  }

  navigateToCompanyDetails(companyId: string): void { // New navigation method
    this.navigationState.set({
      currentView: 'company-details',
      selectedCompanyId: companyId
    });
  }

  navigateToProjects(customerId: string, companyId: string): void {
    this.navigationState.set({
      currentView: 'projects',
      selectedCustomerId: customerId,
      selectedCompanyId: companyId
    });
  }

  navigateToTasks(customerId: string, companyId: string, projectId: string): void {
    this.navigationState.set({
      currentView: 'tasks',
      selectedCustomerId: customerId,
      selectedCompanyId: companyId,
      selectedProjectId: projectId
    });
  }

  navigateToSteps(customerId: string, companyId: string, projectId: string, taskId: string): void {
    this.navigationState.set({
      currentView: 'steps',
      selectedCustomerId: customerId,
      selectedCompanyId: companyId,
      selectedProjectId: projectId,
      selectedTaskId: taskId
    });
  }

  navigateToLocations(): void {
    this.navigationState.set({
      currentView: 'locations'
    });
  }

  navigateToAuthorities(): void {
    this.navigationState.set({
      currentView: 'authorities'
    });
  }

  navigateToAllProjects(): void {
    this.navigationState.set({
      currentView: 'all-projects'
    });
  }

  navigateToActivityLog(): void {
    this.navigationState.set({
      currentView: 'activity-log'
    });
  }

  navigateToCompanyActivityLog(): void {
    this.navigationState.set({
      currentView: 'company-activity-log'
    });
  }

  navigateToIndustries(): void {
    this.navigationState.set({
      currentView: 'industries'
    });
  }

  navigateToActivities(): void { // New navigation method
    this.navigationState.set({
      currentView: 'activities'
    });
  }
}