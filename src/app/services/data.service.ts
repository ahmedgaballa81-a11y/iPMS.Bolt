import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service'; // Corrected import path
import { Company, CreateCompanyRequest } from '../models/company.model';
import { Customer, CreateCustomerRequest } from '../models/customer.model';
import { Project, CreateProjectRequest } from '../models/project.model';
import { Task, CreateTaskRequest } from '../models/task.model';
import { Step, CreateStepRequest } from '../models/step.model';
import { Location, CreateLocationRequest } from '../models/location.model';
import { Authority, CreateAuthorityRequest } from '../models/authority.model';
import { CompanyActivity, CreateCompanyActivityRequest } from '../models/company-activity.model';
import { Industry, CreateIndustryRequest } from '../models/industry.model';
import { Activity, CreateActivityRequest } from '../models/activity.model'; // Import new model
import { User } from '../models/user.model'; // Import User model for type safety

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private authService = inject(AuthService);

  // Signals for reactive state management
  private companies = signal<Company[]>([]);
  private customers = signal<Customer[]>([]);
  private projects = signal<Project[]>([]);
  private tasks = signal<Task[]>([]);
  private steps = signal<Step[]>([]);
  private locations = signal<Location[]>([]);
  private authorities = signal<Authority[]>([]);
  private companyActivities = signal<CompanyActivity[]>([]);
  private industries = signal<Industry[]>([]);
  private activities = signal<Activity[]>([]); // New signal for activities
  private loadingError = signal<string | null>(null);

  // Computed values
  readonly allCompanies = computed(() => this.companies());
  readonly allCustomers = computed(() => this.customers());
  readonly allProjects = computed(() => this.projects());
  readonly allTasks = computed(() => this.tasks());
  readonly allSteps = computed(() => this.steps());
  readonly allLocations = computed(() => this.locations());
  readonly allAuthorities = computed(() => this.authorities());
  readonly allCompanyActivities = computed(() => this.companyActivities());
  readonly allIndustries = computed(() => this.industries());
  readonly allActivities = computed(() => this.activities()); // New computed for activities
  readonly hasLoadingError = computed(() => this.loadingError());

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize companies
    const mockCompanies: Company[] = [
      {
        id: "1",
        name: "Acme Corporation",
        email: "info@acme.com",
        phone: "+1-555-0100",
        mobile: "+1-555-0101",
        mainAddress: "123 Business St, Corporate City, CC 12345",
        website: "https://acme.com",
        activityId: "1",
        description: "Leading technology solutions provider",
        isActive: true,
        customerId: "1",
        taxRegistrationNumber: "TAX123456789",
        taxAuthority: "Federal Tax Authority",
        taxCardData: "TC-2024-001",
        taxCardStartDate: new Date("2024-01-01T00:00:00.000Z"),
        taxCardEndDate: new Date("2024-12-31T00:00:00.000Z"),
        commercialRegisterData: "CR-2024-001",
        commercialRegisterDate: new Date("2024-01-01T00:00:00.000Z"),
        commercialExpireDate: new Date("2026-12-31T00:00:00.000Z"),
        createdDate: new Date("2024-01-10T08:00:00.000Z"),
        updatedDate: new Date("2024-01-10T08:00:00.000Z"),
      },
      {
        id: "2",
        name: "Tech Solutions Inc",
        email: "contact@techsolutions.com",
        phone: "+1-555-0200",
        mobile: "+1-555-0201",
        mainAddress: "456 Innovation Ave, Tech City, TC 67890",
        website: "https://techsolutions.com",
        activityId: "2",
        description: "Professional technology consulting services",
        isActive: true,
        customerId: "1",
        taxRegistrationNumber: "TAX987654321",
        taxAuthority: "State Tax Authority",
        createdDate: new Date("2024-01-12T09:00:00.000Z"),
        updatedDate: new Date("2024-01-12T09:00:00.000Z"),
      },
    ];

    // Initialize customers
    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "+1-555-0123",
        companyId: "1",
        createdDate: new Date("2024-01-15T10:00:00.000Z"),
        updatedDate: new Date("2024-01-15T10:00:00.000Z"),
      },
      {
        id: "2",
        name: "Tech Solutions Inc",
        email: "info@techsolutions.com",
        phone: "+1-555-0456",
        companyId: "2",
        createdDate: new Date("2024-01-20T14:30:00.000Z"),
        updatedDate: new Date("2024-01-20T14:30:00.000Z"),
      },
      {
        id: "3",
        name: "Innovate Global",
        email: "support@innovateglobal.com",
        phone: "+1-555-0789",
        companyId: "3",
        createdDate: new Date("2024-02-05T09:00:00.000Z"),
        updatedDate: new Date("2024-02-05T09:00:00.000Z"),
      },
      {
        id: "4",
        name: "Future Enterprises",
        email: "contact@future.net",
        phone: "+1-555-1011",
        companyId: "4",
        createdDate: new Date("2024-02-10T11:00:00.000Z"),
        updatedDate: new Date("2024-02-10T11:00:00.000Z"),
      },
    ];

    // Initialize projects
    const mockProjects: Project[] = [
      {
        id: "1",
        title: "Website Redesign",
        description: "Complete redesign of company website",
        customerId: "1",
        companyId: "1",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-16T09:00:00.000Z"),
        startDate: new Date("2024-01-20T00:00:00.000Z"),
        expectedEndDate: new Date("2024-03-15T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 25000,
        actualCost: 5000,
        status: "in-progress",
        priority: "high",
        progress: 35,
        isArchived: false,
      },
      {
        id: "2",
        title: "Mobile App Development",
        description: "Native mobile application for iOS and Android",
        customerId: "2",
        companyId: "2",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-21T11:00:00.000Z"),
        startDate: undefined,
        expectedEndDate: new Date("2024-06-30T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 50000,
        actualCost: 0,
        status: "not-started",
        priority: "medium",
        progress: 0,
        isArchived: false,
      },
      {
        id: "3",
        title: "ERP System Integration",
        description: "Integrate new ERP system with existing infrastructure",
        customerId: "3",
        companyId: "3",
        createdBy: "Manager User",
        createdDate: new Date("2024-02-10T10:00:00.000Z"),
        startDate: new Date("2024-02-15T00:00:00.000Z"),
        expectedEndDate: new Date("2024-08-31T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 120000,
        actualCost: 15000,
        status: "in-progress",
        priority: "critical",
        progress: 10,
        isArchived: false,
      },
      {
        id: "4",
        title: "Cloud Migration",
        description: "Migrate on-premise servers to AWS cloud",
        customerId: "1",
        companyId: "1",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-25T14:00:00.000Z"),
        startDate: new Date("2024-02-01T00:00:00.000Z"),
        expectedEndDate: new Date("2024-05-30T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 75000,
        actualCost: 10000,
        status: "in-progress",
        priority: "high",
        progress: 20,
        isArchived: false,
      },
      {
        id: "5",
        title: "Legacy System Decommission",
        description: "Safely decommission old systems after migration",
        customerId: "1",
        companyId: "1",
        createdBy: "Admin User",
        createdDate: new Date("2024-02-05T09:00:00.000Z"),
        startDate: undefined,
        expectedEndDate: new Date("2024-07-15T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 30000,
        actualCost: 0,
        status: "not-started",
        priority: "medium",
        progress: 0,
        isArchived: true, // Archived project
      },
    ];

    // Initialize tasks
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "UI/UX Design",
        description: "Create wireframes and mockups",
        projectId: "1",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-16T10:00:00.000Z"),
        startDate: new Date("2024-01-20T00:00:00.000Z"),
        expectedEndDate: new Date("2024-02-10T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 8000,
        actualCost: 2000,
        status: "in-progress",
        priority: "high",
        order: 1,
        progress: 60,
      }, // Removed extraneous backslash
      {
        id: "2",
        title: "Frontend Development",
        description: "Implement responsive frontend",
        projectId: "1",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-16T10:30:00.000Z"),
        startDate: undefined,
        expectedEndDate: new Date("2024-03-01T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 12000,
        actualCost: 0,
        status: "not-started",
        priority: "medium",
        order: 2,
        progress: 0,
      },
      {
        id: "3",
        title: "Backend API Development",
        description: "Develop RESTful APIs for mobile app",
        projectId: "2",
        createdBy: "Manager User",
        createdDate: new Date("2024-01-22T10:00:00.000Z"),
        startDate: new Date("2024-02-01T00:00:00.000Z"),
        expectedEndDate: new Date("2024-04-15T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 20000,
        actualCost: 5000,
        status: "in-progress",
        priority: "high",
        order: 1,
        progress: 25,
      },
      {
        id: "4",
        title: "Database Schema Design",
        description: "Design and implement database schema for ERP",
        projectId: "3",
        createdBy: "Admin User",
        createdDate: new Date("2024-02-11T09:00:00.000Z"),
        startDate: new Date("2024-02-15T00:00:00.000Z"),
        expectedEndDate: new Date("2024-03-01T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 10000,
        actualCost: 2000,
        status: "in-progress",
        priority: "critical",
        order: 1,
        progress: 15,
      },
      {
        id: "5",
        title: "User Acceptance Testing (UAT)",
        description: "Conduct UAT with key stakeholders",
        projectId: "1",
        createdBy: "Admin User",
        createdDate: new Date("2024-03-01T10:00:00.000Z"),
        startDate: undefined,
        expectedEndDate: new Date("2024-03-10T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 5000,
        actualCost: 0,
        status: "not-started",
        priority: "medium",
        order: 3,
        progress: 0,
      },
    ];

    // Initialize steps
    const mockSteps: Step[] = [
      {
        id: "1",
        title: "Research Phase",
        description: "Analyze current website and user requirements",
        projectId: "1",
        taskId: "1",
        location: "Main Office",
        actionNote: "Complete user interviews and competitor analysis",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-16T11:00:00.000Z"),
        startDate: new Date("2024-01-20T00:00:00.000Z"),
        expectedDate: new Date("2024-01-25T00:00:00.000Z"),
        actualEndDate: new Date("2024-01-24T00:00:00.000Z"),
        expectedCost: 2000,
        actualCost: 1800,
        status: "success",
        priority: "high",
        order: 1,
      },
      {
        id: "2",
        title: "Wireframe Creation",
        description: "Create detailed wireframes for all pages",
        projectId: "1",
        taskId: "1",
        location: "Main Office",
        actionNote: "Focus on user experience and navigation flow",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-16T11:30:00.000Z"),
        startDate: new Date("2024-01-25T00:00:00.000Z"),
        expectedDate: new Date("2024-02-05T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 3000,
        actualCost: 200,
        status: "in-progress",
        priority: "high",
        order: 2,
      },
      {
        id: "3",
        title: "Database Setup",
        description: "Set up PostgreSQL database instance",
        projectId: "2",
        taskId: "3",
        location: "Cloud Server",
        actionNote: "Ensure proper security and backups are configured",
        createdBy: "Manager User",
        createdDate: new Date("2024-02-02T10:00:00.000Z"),
        startDate: new Date("2024-02-05T00:00:00.000Z"),
        expectedDate: new Date("2024-02-10T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 1500,
        actualCost: 500,
        status: "in-progress",
        priority: "medium",
        order: 1,
      },
      {
        id: "4",
        title: "API Endpoint Definition",
        description: "Define all necessary API endpoints for mobile app",
        projectId: "2",
        taskId: "3",
        location: "Remote Work",
        actionNote: "Document API specifications clearly",
        createdBy: "Manager User",
        createdDate: new Date("2024-02-05T11:00:00.000Z"),
        startDate: undefined,
        expectedDate: new Date("2024-02-20T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 2000,
        actualCost: 0,
        status: "not-started",
        priority: "high",
        order: 2,
      },
      {
        id: "5",
        title: "Data Migration Plan",
        description:
          "Create a detailed plan for migrating existing data to new ERP",
        projectId: "3",
        taskId: "4",
        location: "Main Office",
        actionNote: "Identify data sources and transformation rules",
        createdBy: "Admin User",
        createdDate: new Date("2024-02-16T10:00:00.000Z"),
        startDate: new Date("2024-02-18T00:00:00.000Z"),
        expectedDate: new Date("2024-02-28T00:00:00.000Z"),
        actualEndDate: undefined,
        expectedCost: 3000,
        actualCost: 1000,
        status: "in-progress",
        priority: "critical",
        order: 1,
      },
    ];

    // Initialize locations
    const mockLocations: Location[] = [
      {
        id: "1",
        name: "Main Office",
        address: "123 Main St, Business District",
        city: "Business City",
        state: "BC",
        country: "United States",
        postalCode: "12345",
        description: "Primary office location",
        createdDate: new Date("2024-01-15T08:00:00.000Z"),
        updatedDate: new Date("2024-01-15T08:00:00.000Z"),
      },
      {
        id: "2",
        name: "Client Site",
        address: "456 Client Ave, Client City",
        city: "Client City",
        state: "CC",
        country: "United States",
        postalCode: "67890",
        description: "On-site work at client location",
        createdDate: new Date("2024-01-15T08:30:00.000Z"),
        updatedDate: new Date("2024-01-15T08:30:00.000Z"),
      },
      {
        id: "3",
        name: "Remote Work",
        address: "N/A",
        city: "Virtual",
        state: "N/A",
        country: "Global",
        postalCode: "N/A",
        description: "Work performed remotely by team members",
        createdDate: new Date("2024-01-20T09:00:00.000Z"),
        updatedDate: new Date("2024-01-20T09:00:00.000Z"),
      },
      {
        id: "4",
        name: "Cloud Server",
        address: "AWS East Region",
        city: "Ashburn",
        state: "VA",
        country: "United States",
        postalCode: "20147",
        description: "Cloud infrastructure hosting",
        createdDate: new Date("2024-02-01T12:00:00.000Z"),
        updatedDate: new Date("2024-02-01T12:00:00.000Z"),
      },
    ];

    // Initialize authorities
    const mockAuthorities: Authority[] = [
      {
        id: "1",
        name: "John Smith",
        title: "Project Manager",
        department: "Operations",
        email: "john.smith@company.com",
        phone: "+1-555-0111",
        role: "manager",
        permissions: [
          "create_project",
          "edit_project",
          "create_task",
          "edit_task",
        ],
        isActive: true,
        createdDate: new Date("2024-01-15T07:00:00.000Z"),
        updatedDate: new Date("2024-01-15T07:00:00.000Z"),
      },
      {
        id: "2",
        name: "Sarah Johnson",
        title: "System Administrator",
        department: "IT",
        email: "sarah.johnson@company.com",
        phone: "+1-555-0222",
        role: "admin",
        permissions: [
          "create_customer",
          "edit_customer",
          "create_project",
          "edit_project",
          "create_task",
          "edit_task",
          "create_step",
          "edit_step",
        ],
        isActive: true,
        createdDate: new Date("2024-01-15T07:30:00.000Z"),
        updatedDate: new Date("2024-01-15T07:30:00.000Z"),
      },
      {
        id: "3",
        name: "Emily White",
        title: "Software Engineer",
        department: "Development",
        email: "emily.white@company.com",
        phone: "+1-555-0333",
        role: "coordinator",
        permissions: [
          "view_projects",
          "create_task",
          "edit_task",
          "create_step",
          "edit_step",
        ],
        isActive: true,
        createdDate: new Date("2024-01-20T08:00:00.000Z"),
        updatedDate: new Date("2024-01-20T08:00:00.000Z"),
      },
      {
        id: "4",
        name: "David Green",
        title: "QA Lead",
        department: "Quality Assurance",
        email: "david.green@company.com",
        phone: "+1-555-0444",
        role: "supervisor",
        permissions: ["view_projects", "edit_task", "edit_step"],
        isActive: false,
        createdDate: new Date("2024-01-25T09:00:00.000Z"),
        updatedDate: new Date("2024-01-25T09:00:00.000Z"),
      },
    ];

    // Initialize company activities
    const mockCompanyActivities: CompanyActivity[] = [
      {
        id: "ca-1",
        companyId: "1",
        title: "Initial Client Meeting",
        description:
          "Discussed project scope and requirements for website redesign.",
        activityType: "meeting",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-18T10:00:00.000Z"),
        dueDate: new Date("2024-01-18T10:00:00.000Z"),
        status: "completed",
      },
      {
        id: "ca-2",
        companyId: "1",
        title: "Follow-up Email",
        description: "Sent summary of meeting and proposed next steps.",
        activityType: "email",
        createdBy: "Admin User",
        createdDate: new Date("2024-01-18T14:00:00.000Z"),
        dueDate: new Date("2024-01-18T14:00:00.000Z"),
        status: "completed",
      },
      {
        id: "ca-3",
        companyId: "2",
        title: "Mobile App Brainstorm",
        description: "Internal brainstorming session for mobile app features.",
        activityType: "meeting",
        createdBy: "Project Manager",
        createdDate: new Date("2024-01-22T09:30:00.000Z"),
        dueDate: new Date("2024-01-25T00:00:00.000Z"),
        status: "open",
      },
      {
        id: "ca-4",
        companyId: "3",
        title: "ERP Vendor Demo",
        description:
          "Attended a demo of potential ERP solutions from vendor X.",
        activityType: "meeting",
        createdBy: "Manager User",
        createdDate: new Date("2024-02-12T13:00:00.000Z"),
        dueDate: new Date("2024-02-12T13:00:00.000Z"),
        status: "completed",
      },
      {
        id: "ca-5",
        companyId: "1",
        title: "Client Check-in Call",
        description:
          "Weekly check-in with Acme Corp. regarding cloud migration progress.",
        activityType: "call",
        createdBy: "Admin User",
        createdDate: new Date("2024-02-20T11:00:00.000Z"),
        dueDate: new Date("2024-02-20T11:00:00.000Z"),
        status: "open",
      },
      {
        id: "ca-6",
        companyId: "2",
        title: "App Feature Discussion",
        description:
          "Discussed new feature requests for the mobile app with the client.",
        activityType: "meeting",
        createdBy: "Project Manager",
        createdDate: new Date("2024-02-25T15:00:00.000Z"),
        dueDate: new Date("2024-03-01T00:00:00.000Z"),
        status: "pending",
      },
    ];

    // Initialize industries
    const mockIndustries: Industry[] = [
      {
        id: "ind-1",
        name: "Technology",
        description: "Software, hardware, and IT services.",
        createdDate: new Date("2024-01-05T09:00:00.000Z"),
        updatedDate: new Date("2024-01-05T09:00:00.000Z"),
      },
      {
        id: "ind-2",
        name: "Healthcare",
        description: "Medical services, pharmaceuticals, and biotechnology.",
        createdDate: new Date("2024-01-05T09:15:00.000Z"),
        updatedDate: new Date("2024-01-05T09:15:00.000Z"),
      },
      {
        id: "ind-3",
        name: "Finance",
        description: "Banking, investment, and financial services.",
        createdDate: new Date("2024-01-05T09:30:00.000Z"),
        updatedDate: new Date("2024-01-05T09:30:00.000Z"),
      },
      {
        id: "ind-4",
        name: "Manufacturing",
        description: "Production of goods and materials.",
        createdDate: new Date("2024-01-05T09:45:00.000Z"),
        updatedDate: new Date("2024-01-05T09:45:00.000Z"),
      },
      {
        id: "ind-5",
        name: "Consulting",
        description: "Professional advisory services.",
        createdDate: new Date("2024-01-05T10:00:00.000Z"),
        updatedDate: new Date("2024-01-05T10:00:00.000Z"),
      },
    ];

    // Initialize activities
    const mockActivities: Activity[] = [
      {
        id: "act-1",
        name: "Requirement Gathering",
        description:
          "Initial phase to collect and document all project requirements.",
        createdDate: new Date("2024-01-01T09:00:00.000Z"),
        updatedDate: new Date("2024-01-01T09:00:00.000Z"),
      },
      {
        id: "act-2",
        name: "Design Prototyping",
        description:
          "Creating visual mockups and interactive prototypes for user interfaces.",
        createdDate: new Date("2024-01-10T10:00:00.000Z"),
        updatedDate: new Date("2024-01-10T10:00:00.000Z"),
      },
      {
        id: "act-3",
        name: "Backend Development",
        description: "Building server-side logic, databases, and APIs.",
        createdDate: new Date("2024-01-20T11:00:00.000Z"),
        updatedDate: new Date("2024-01-20T11:00:00.000Z"),
      },
      {
        id: "act-4",
        name: "Frontend Development",
        description:
          "Implementing user interfaces and client-side interactions.",
        createdDate: new Date("2024-02-01T12:00:00.000Z"),
        updatedDate: new Date("2024-02-01T12:00:00.000Z"),
      },
      {
        id: "act-5",
        name: "Testing & QA",
        description:
          "Comprehensive testing to identify and fix bugs, ensuring quality.",
        createdDate: new Date("2024-02-15T13:00:00.000Z"),
        updatedDate: new Date("2024-02-15T13:00:00.000Z"),
      },
    ];

    // Set all mock data
    this.companies.set(mockCompanies);
    this.customers.set(mockCustomers);
    this.projects.set(mockProjects);
    this.tasks.set(mockTasks);
    this.steps.set(mockSteps);
    this.locations.set(mockLocations);
    this.authorities.set(mockAuthorities);
    this.companyActivities.set(mockCompanyActivities);
    this.industries.set(mockIndustries);
    this.activities.set(mockActivities); // Set new mock data
    this.loadingError.set(null);
  }

  // Company methods
  async createCompany(request: CreateCompanyRequest): Promise<Company> {
    const company: Company = {
      id: this.generateId(),
      ...request,
      isActive: true,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.companies.update(companies => [...companies, company]);
    this.logActivity('create', 'company', company.id, company.name, 'Company created');
    return company;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<void> {
    const updatedCompany = { ...updates, updatedDate: new Date() };

    this.companies.update(companies =>
      companies.map(company =>
        company.id === id ? { ...company, ...updatedCompany } : company
      )
    );

    const company = this.companies().find(c => c.id === id);
    if (company) {
      this.logActivity('update', 'company', id, company.name, 'Company updated');
    }
  }

  async deleteCompany(id: string): Promise<void> {
    const company = this.companies().find(c => c.id === id);

    // Delete related projects
    const relatedProjects = this.projects().filter(p => p.companyId === id);
    for (const project of relatedProjects) {
      await this.deleteProject(project.id);
    }

    // Delete related company activities
    this.companyActivities.update(activities => activities.filter(ca => ca.companyId !== id));

    this.companies.update(companies => companies.filter(c => c.id !== id));

    if (company) {
      this.logActivity('delete', 'company', id, company.name, 'Company deleted');
    }
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies().find(c => c.id === id);
  }

  getCompaniesByCustomer(customerId: string): Company[] {
    return this.companies().filter(c => c.customerId === customerId);
  }

  getCustomersByCompany(companyId: string): Customer[] {
    return this.customers().filter(c => c.companyId === companyId);
  }

  getProjectsByCompany2(companyId: string): Project[] {
    return this.projects().filter(p => p.companyId === companyId);
  }

  // Customer methods
  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    if (!this.canCreateCustomer()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const customer: Customer = {
      id: this.generateId(),
      ...request,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.customers.update(customers => [...customers, customer]);
    this.logActivity('create', 'customer', customer.id, customer.name, 'Customer created');
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    if (!this.canEditCustomer()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const updatedCustomer = { ...updates, updatedDate: new Date() };

    this.customers.update(customers =>
      customers.map(customer =>
        customer.id === id ? { ...customer, ...updatedCustomer } : customer
      )
    );

    const customer = this.customers().find(c => c.id === id);
    if (customer) {
      this.logActivity('update', 'customer', id, customer.name, 'Customer updated');
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    if (!this.canDeleteCustomer()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const customer = this.customers().find(c => c.id === id);

    // Delete related companies and their projects
    const relatedCompanies = this.companies().filter(c => c.customerId === id);
    for (const company of relatedCompanies) {
      await this.deleteCompany(company.id);
    }

    // Delete projects directly related to customer
    const relatedProjects = this.projects().filter(p => p.customerId === id);
    for (const project of relatedProjects) {
      await this.deleteProject(project.id);
    }

    this.customers.update(customers => customers.filter(c => c.id !== id));

    if (customer) {
      this.logActivity('delete', 'customer', id, customer.name, 'Customer deleted');
    }
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }

  // Project methods
  async createProject(request: CreateProjectRequest): Promise<Project> {
    if (!this.canCreateProject()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const project: Project = {
      id: this.generateId(),
      ...request,
      createdBy: 'Current User',
      createdDate: new Date(),
      actualCost: 0,
      status: 'not-started',
      progress: 0,
      isArchived: false
    };

    this.projects.update(projects => [...projects, project]);
    this.logActivity('create', 'project', project.id, project.title, 'Project created');
    return project;
  }

  async archiveProject(id: string): Promise<void> {
    await this.updateProject(id, { status: 'archived', isArchived: true });
  }

  async unarchiveProject(id: string): Promise<void> {
    await this.updateProject(id, { status: 'not-started', isArchived: false });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    if (!this.canEditProject()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    this.projects.update(projects =>
      projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    );

    const project = this.projects().find(p => p.id === id);
    if (project) {
      this.logActivity('update', 'project', id, project.title, 'Project updated');
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.canDeleteProject()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const project = this.projects().find(p => p.id === id);

    // Delete related tasks and steps
    const relatedTasks = this.tasks().filter(t => t.projectId === id);
    for (const task of relatedTasks) {
      await this.deleteTask(task.id);
    }

    this.projects.update(projects => projects.filter(p => p.id !== id));

    if (project) {
      this.logActivity('delete', 'project', id, project.title, 'Project deleted');
    }
  }

  getProjectsByCustomer(customerId: string): Project[] {
    return this.projects().filter(p => p.customerId === customerId);
  }

  getProjectsByCompany(companyId: string): Project[] {
    return this.allProjects().filter(project => project.companyId === companyId);
  }

  getActiveProjectsByCustomer(customerId: string): Project[] {
    return this.projects().filter(p => p.customerId === customerId && !p.isArchived);
  }

  getArchivedProjectsByCustomer(customerId: string): Project[] {
    return this.projects().filter(p => p.customerId === customerId && p.isArchived);
  }

  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  // Task methods
  async createTask(request: CreateTaskRequest): Promise<Task> {
    if (!this.canCreateTask()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const tasksInProject = this.tasks().filter(t => t.projectId === request.projectId);
    const maxOrder = Math.max(...tasksInProject.map(t => t.order), 0);

    const task: Task = {
      id: this.generateId(),
      ...request,
      createdBy: 'Current User',
      createdDate: new Date(),
      actualCost: 0,
      status: 'not-started',
      order: maxOrder + 1,
      progress: 0
    };

    this.tasks.update(tasks => [...tasks, task]);
    this.logActivity('create', 'task', task.id, task.title, 'Task created');

    if (task.assignedUserId) {
      const assignedUser = this.authService.allUsers().find((u: User) => u.id === task.assignedUserId); // Explicitly type 'u'
      if (assignedUser) {
        this.logActivity('update', 'task', task.id, task.title, `Task assigned to ${assignedUser.name}`);
      }
    }

    return task;
  }

  async updateTaskOrder(taskId: string, newOrder: number): Promise<void> {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task) return;

    const projectTasks = this.tasks().filter(t => t.projectId === task.projectId);
    const otherTasks = projectTasks.filter(t => t.id !== taskId);

    // Update orders for all tasks in the project
    const updates = otherTasks.map((t, index) => {
      const order = index >= newOrder ? index + 1 : index;
      return this.updateTask(t.id, { order });
    });

    updates.push(this.updateTask(taskId, { order: newOrder }));
    await Promise.all(updates);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!this.canEditTask()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const oldTask = this.tasks().find(t => t.id === id);
    const oldAssignedUserId = oldTask?.assignedUserId;
    const newAssignedUserId = updates.assignedUserId;

    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );

    const task = this.tasks().find(t => t.id === id);
    if (task) {
      this.logActivity('update', 'task', id, task.title, 'Task updated');

      // Log assignment changes
      if (oldAssignedUserId !== newAssignedUserId) {
        if (newAssignedUserId) {
          const newUser = this.authService.allUsers().find((u: User) => u.id === newAssignedUserId); // Explicitly type 'u'
          if (newUser) {
            this.logActivity('update', 'task', id, task.title, `Task assigned to ${newUser.name}`);
          }
        } else if (oldAssignedUserId) {
          this.logActivity('update', 'task', id, task.title, 'Task unassigned');
        }
      }
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.canDeleteTask()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const task = this.tasks().find(t => t.id === id);

    // Delete related steps
    const relatedSteps = this.steps().filter(s => s.taskId === id);
    for (const step of relatedSteps) {
      await this.deleteStep(step.id);
    }

    this.tasks.update(tasks => tasks.filter(t => t.id !== id));

    if (task) {
      this.logActivity('delete', 'task', id, task.title, 'Task deleted');
    }
  }

  getTasksByProject(projectId: string): Task[] {
    return this.tasks()
      .filter(t => t.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks().find(t => t.id === id);
  }

  getTasksByAssignedUser(userId: string): Task[] {
    return this.tasks().filter(t => t.assignedUserId === userId);
  }

  getUnassignedTasks(): Task[] {
    return this.tasks().filter(t => !t.assignedUserId);
  }

  // Step methods
  async createStep(request: CreateStepRequest): Promise<Step> {
    if (!this.canCreateStep()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const task = this.getTaskById(request.taskId);
    if (!task) throw new Error('Task not found');

    const stepsInTask = this.steps().filter(s => s.taskId === request.taskId);
    const maxOrder = Math.max(...stepsInTask.map(s => s.order), 0);

    const step: Step = {
      id: this.generateId(),
      ...request,
      projectId: task.projectId,
      createdBy: 'Current User',
      createdDate: new Date(),
      actualCost: 0,
      status: 'not-started',
      order: maxOrder + 1
    };

    this.steps.update(steps => [...steps, step]);
    this.logActivity('create', 'step', step.id, step.title, 'Step created');
    return step;
  }

  async updateStepOrder(stepId: string, newOrder: number): Promise<void> {
    const step = this.steps().find(s => s.id === stepId);
    if (!step) return;

    const taskSteps = this.steps().filter(s => s.taskId === step.taskId);
    const otherSteps = taskSteps.filter(s => s.id !== stepId);

    // Update orders for all steps in the task
    const updates = otherSteps.map((t, index) => {
      const order = index >= newOrder ? index + 1 : index;
      return this.updateStep(t.id, { order });
    });

    updates.push(this.updateStep(stepId, { order: newOrder }));
    await Promise.all(updates);
  }

  async updateStep(id: string, updates: Partial<Step>): Promise<void> {
    if (!this.canEditStep()) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    this.steps.update(steps =>
      steps.map(step =>
        step.id === id ? { ...step, ...updates } : step
      )
    );

    const step = this.steps().find(s => s.id === id);
    if (step) {
      this.logActivity('update', 'step', id, step.title, 'Step updated');
    }

    // If step is marked as failed, create a new step
    if (updates.status === 'failed') {
      const failedStep = this.steps().find(s => s.id === id);
      if (failedStep) {
        await this.createFollowUpStep(failedStep);
      }
    }
  }

  private async createFollowUpStep(failedStep: Step): Promise<void> {
    const followUpStep: Step = {
      id: this.generateId(),
      title: `${failedStep.title} (Retry)`,
      description: `Follow-up step after failure: ${failedStep.description}`,
      projectId: failedStep.projectId,
      taskId: failedStep.taskId,
      location: failedStep.location,
      actionNote: `Retry after previous step failed. Original note: ${failedStep.actionNote}`,
      createdBy: 'Current User',
      createdDate: new Date(),
      startDate: new Date(),
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      actualEndDate: undefined,
      expectedCost: failedStep.expectedCost,
      actualCost: 0,
      status: 'not-started',
      priority: failedStep.priority,
      order: failedStep.order + 0.5 // Insert after the failed step
    };

    this.steps.update(steps => [...steps, followUpStep]);

    // Reorder all steps to maintain integer order values
    setTimeout(() => {
      const taskSteps = this.getStepsByTask(failedStep.taskId);
      taskSteps.forEach((step, index) => {
        this.updateStep(step.id, { order: index });
      });
    }, 0);
  }

  async deleteStep(id: string): Promise<void> {
    if (!this.canDeleteStep()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const step = this.steps().find(s => s.id === id);
    this.steps.update(steps => steps.filter(s => s.id !== id));

    if (step) {
      this.logActivity('delete', 'step', id, step.title, 'Step deleted');
    }
  }

  getStepsByTask(taskId: string): Step[] {
    return this.steps()
      .filter(s => s.taskId === taskId)
      .sort((a, b) => a.order - b.order);
  }

  // Location methods
  async createLocation(request: CreateLocationRequest): Promise<Location> {
    const location: Location = {
      id: this.generateId(),
      ...request,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.locations.update(locations => [...locations, location]);
    return location;
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<void> {
    const updatedLocation = { ...updates, updatedDate: new Date() };

    this.locations.update(locations =>
      locations.map(location =>
        location.id === id ? { ...location, ...updatedLocation } : location
      )
    );
  }

  async deleteLocation(id: string): Promise<void> {
    this.locations.update(locations => locations.filter(l => l.id !== id));
  }

  getLocationById(id: string): Location | undefined {
    return this.locations().find(l => l.id === id);
  }

  // Authority methods
  async createAuthority(request: CreateAuthorityRequest): Promise<Authority> {
    const authority: Authority = {
      id: this.generateId(),
      ...request,
      isActive: true,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.authorities.update(authorities => [...authorities, authority]);
    return authority;
  }

  async updateAuthority(id: string, updates: Partial<Authority>): Promise<void> {
    const updatedAuthority = { ...updates, updatedDate: new Date() };

    this.authorities.update(authorities =>
      authorities.map(authority =>
        authority.id === id ? { ...authority, ...updatedAuthority } : authority
      )
    );
  }

  async deleteAuthority(id: string): Promise<void> {
    this.authorities.update(authorities => authorities.filter(a => a.id !== id));
  }

  getAuthorityById(id: string): Authority | undefined {
    return this.authorities().find(a => a.id === id);
  }

  // Company Activity methods (NEW)
  async createCompanyActivity(request: CreateCompanyActivityRequest): Promise<CompanyActivity> {
    const currentUser = this.authService.user();
    if (!currentUser) throw new Error('User not authenticated');

    const activity: CompanyActivity = {
      id: this.generateId(),
      ...request,
      createdBy: currentUser.name,
      createdDate: new Date(),
    };

    this.companyActivities.update(activities => [activity, ...activities]);
    this.logActivity('create', 'company_activity', activity.id, activity.title, `Company activity created for company ${activity.companyId}`);
    return activity;
  }

  async updateCompanyActivity(id: string, updates: Partial<CompanyActivity>): Promise<void> {
    this.companyActivities.update(activities =>
      activities.map(activity =>
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
    const activity = this.companyActivities().find(a => a.id === id);
    if (activity) {
      this.logActivity('update', 'company_activity', id, activity.title, `Company activity updated for company ${activity.companyId}`);
    }
  }

  async deleteCompanyActivity(id: string): Promise<void> {
    const activity = this.companyActivities().find(a => a.id === id);
    this.companyActivities.update(activities => activities.filter(a => a.id !== id));
    if (activity) {
      this.logActivity('delete', 'company_activity', id, activity.title, `Company activity deleted for company ${activity.companyId}`);
    }
  }

  getCompanyActivitiesByCompanyId(companyId: string): CompanyActivity[] {
    return this.companyActivities().filter(ca => ca.companyId === companyId)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  // Industry methods (NEW)
  async createIndustry(request: CreateIndustryRequest): Promise<Industry> {
    const industry: Industry = {
      id: this.generateId(),
      ...request,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.industries.update(industries => [...industries, industry]);
    this.logActivity('create', 'industry', industry.id, industry.name, 'Industry created');
    return industry;
  }

  async updateIndustry(id: string, updates: Partial<Industry>): Promise<void> {
    const updatedIndustry = { ...updates, updatedDate: new Date() };

    this.industries.update(industries =>
      industries.map(industry =>
        industry.id === id ? { ...industry, ...updatedIndustry } : industry
      )
    );
    const industry = this.industries().find(i => i.id === id);
    if (industry) {
      this.logActivity('update', 'industry', id, industry.name, 'Industry updated');
    }
  }

  async deleteIndustry(id: string): Promise<void> {
    const industry = this.industries().find(i => i.id === id);
    this.industries.update(industries => industries.filter(i => i.id !== id));
    if (industry) {
      this.logActivity('delete', 'industry', id, industry.name, 'Industry deleted');
    }
  }

  getIndustryById(id: string): Industry | undefined {
    return this.industries().find(i => i.id === id);
  }

  // Activity methods (NEW)
  async createActivity(request: CreateActivityRequest): Promise<Activity> {
    const activity: Activity = {
      id: this.generateId(),
      ...request,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.activities.update(activities => [...activities, activity]);
    this.logActivity('create', 'activity', activity.id, activity.name, 'Activity created');
    return activity;
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<void> {
    const updatedActivity = { ...updates, updatedDate: new Date() };

    this.activities.update(activities =>
      activities.map(activity =>
        activity.id === id ? { ...activity, ...updatedActivity } : activity
      )
    );
    const activity = this.activities().find(a => a.id === id);
    if (activity) {
      this.logActivity('update', 'activity', id, activity.name, 'Activity updated');
    }
  }

  async deleteActivity(id: string): Promise<void> {
    const activity = this.activities().find(a => a.id === id);
    this.activities.update(activities => activities.filter(a => a.id !== id));
    if (activity) {
      this.logActivity('delete', 'activity', id, activity.name, 'Activity deleted');
    }
  }

  getActivityById(id: string): Activity | undefined {
    return this.activities().find(a => a.id === id);
  }

  // Permission checking methods
  private canCreateCustomer(): boolean {
    return this.authService.hasPermission('create_customer') || (this.authService.isAdmin() as boolean) || false;
  }

  private canEditCustomer(): boolean {
    return this.authService.hasPermission('edit_customer') || (this.authService.isAdmin() as boolean) || false;
  }

  private canDeleteCustomer(): boolean {
    return (this.authService.isAdmin() as boolean) || false;
  }

  private canCreateProject(): boolean {
    return this.authService.hasPermission('create_project') || (this.authService.isAdmin() as boolean) || false;
  }

  private canEditProject(): boolean {
    return this.authService.hasPermission('edit_project') || (this.authService.isAdmin() as boolean) || false;
  }

  private canDeleteProject(): boolean {
    return (this.authService.isAdmin() as boolean) || false;
  }

  private canCreateTask(): boolean {
    return this.authService.hasPermission('create_task') || (this.authService.isAdmin() as boolean) || false;
  }

  private canEditTask(): boolean {
    return this.authService.hasPermission('edit_task') || (this.authService.isAdmin() as boolean) || false;
  }

  private canDeleteTask(): boolean {
    return (this.authService.isAdmin() as boolean) || false;
  }

  private canCreateStep(): boolean {
    return this.authService.hasPermission('create_step') || (this.authService.isAdmin() as boolean) || false;
  }

  private canEditStep(): boolean {
    return this.authService.hasPermission('edit_step') || (this.authService.isAdmin() as boolean) || false;
  }

  private canDeleteStep(): boolean {
    return (this.authService.isAdmin() as boolean) || false;
  }

  // Activity logging
  private logActivity(action: string, entityType: 'customer' | 'project' | 'task' | 'step' | 'company' | 'company_activity' | 'industry' | 'activity', entityId: string, entityName: string, details: string): void {
    const currentUser = this.authService.user(); // Get the current user
    if (!currentUser) {
      console.warn('Attempted to log activity without a current user.');
      return;
    }
    this.authService.logActivity(action, entityType, entityId, entityName, details);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}