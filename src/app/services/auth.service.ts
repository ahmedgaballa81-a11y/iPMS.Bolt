import { Injectable, signal, computed } from '@angular/core';
import { User, LoginRequest, RegisterRequest, CreateUserRequest, ActivityLog } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private users = signal<User[]>([]);
  private activityLogs = signal<ActivityLog[]>([]);

  readonly user = computed(() => this.currentUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isManager = computed(() => this.currentUser()?.role === 'manager');
  readonly allUsers = computed(() => this.users());
  readonly allActivityLogs = computed(() => this.activityLogs());

  constructor() {
    this.initializeDefaultUsers();
    // Simulate logged in admin for demo
    this.currentUser.set(this.users()[0]);
  }

  // Authentication methods
  async login(request: LoginRequest): Promise<{ success: boolean; message: string }> {
    const user = this.users().find(u => u.email === request.email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.isLocked) {
      return { success: false, message: 'Account is locked' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Account is inactive' };
    }

    // In real app, verify password hash
    if (request.password === 'password' || request.password === 'admin123') {
      this.currentUser.set({ ...user, lastLoginDate: new Date() });
      this.updateUser(user.id, { lastLoginDate: new Date() });
      this.logActivity('login', 'user', user.id, user.name, 'User logged in');
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid credentials' };
  }

  async register(request: RegisterRequest): Promise<{ success: boolean; message: string }> {
    const existingUser = this.users().find(u => u.email === request.email);

    if (existingUser) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: this.generateId(),
      email: request.email,
      name: request.name,
      role: 'user',
      isActive: true,
      isLocked: false,
      permissions: ['view_projects', 'create_task', 'edit_task', 'create_step', 'edit_step'],
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.users.update(users => [...users, newUser]);
    this.logActivity('register', 'user', newUser.id, newUser.name, 'User registered');

    return { success: true, message: 'Registration successful' };
  }

  async loginWithGoogle(): Promise<{ success: boolean; message: string }> {
    // Simulate Google OAuth
    const googleUser: User = {
      id: this.generateId(),
      email: 'google.user@gmail.com',
      name: 'Google User',
      role: 'user',
      isActive: true,
      isLocked: false,
      permissions: ['view_projects', 'create_task', 'edit_task', 'create_step', 'edit_step'],
      createdDate: new Date(),
      updatedDate: new Date(),
      lastLoginDate: new Date()
    };

    this.currentUser.set(googleUser);
    this.logActivity('login', 'user', googleUser.id, googleUser.name, 'User logged in with Google');
    return { success: true, message: 'Google login successful' };
  }

  async loginWithFacebook(): Promise<{ success: boolean; message: string }> {
    // Simulate Facebook OAuth
    const facebookUser: User = {
      id: this.generateId(),
      email: 'facebook.user@facebook.com',
      name: 'Facebook User',
      role: 'user',
      isActive: true,
      isLocked: false,
      permissions: ['view_projects', 'create_task', 'edit_task', 'create_step', 'edit_step'],
      createdDate: new Date(),
      updatedDate: new Date(),
      lastLoginDate: new Date()
    };

    this.currentUser.set(facebookUser);
    this.logActivity('login', 'user', facebookUser.id, facebookUser.name, 'User logged in with Facebook');
    return { success: true, message: 'Facebook login successful' };
  }

  logout(): void {
    const user = this.currentUser();
    if (user) {
      this.logActivity('logout', 'user', user.id, user.name, 'User logged out');
    }
    this.currentUser.set(null);
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = this.users().find(u => u.email === email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // In real app, send reset email
    this.logActivity('password_reset', 'user', user.id, user.name, 'Password reset requested');
    return { success: true, message: 'Password reset email sent' };
  }

  // User management methods (Admin only)
  createUser(request: CreateUserRequest): User {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const newUser: User = {
      id: this.generateId(),
      ...request,
      isActive: true,
      isLocked: false,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.users.update(users => [...users, newUser]);
    this.logActivity('create', 'user', newUser.id, newUser.name, 'User created by admin');

    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): void {
    if (!this.isAdmin() && this.currentUser()?.id !== id) {
      throw new Error('Unauthorized: Can only update own profile or admin access required');
    }

    this.users.update(users =>
      users.map(user =>
        user.id === id
          ? { ...user, ...updates, updatedDate: new Date() }
          : user
      )
    );

    const user = this.users().find(u => u.id === id);
    if (user) {
      this.logActivity('update', 'user', id, user.name, 'User updated');
    }
  }

  lockUser(id: string): void {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    this.updateUser(id, { isLocked: true });
    const user = this.users().find(u => u.id === id);
    if (user) {
      this.logActivity('lock', 'user', id, user.name, 'User locked by admin');
    }
  }

  unlockUser(id: string): void {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    this.updateUser(id, { isLocked: false });
    const user = this.users().find(u => u.id === id);
    if (user) {
      this.logActivity('unlock', 'user', id, user.name, 'User unlocked by admin');
    }
  }

  deleteUser(id: string): void {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const user = this.users().find(u => u.id === id);
    this.users.update(users => users.filter(u => u.id !== id));

    if (user) {
      this.logActivity('delete', 'user', id, user.name, 'User deleted by admin');
    }
  }

  grantPermissions(userId: string, permissions: string[]): void {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const user = this.users().find(u => u.id === userId);
    if (user) {
      const newPermissions = [...new Set([...user.permissions, ...permissions])];
      this.updateUser(userId, { permissions: newPermissions });
      this.logActivity('grant_permissions', 'user', userId, user.name, `Permissions granted: ${permissions.join(', ')}`);
    }
  }

  revokePermissions(userId: string, permissions: string[]): void {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const user = this.users().find(u => u.id === userId);
    if (user) {
      const newPermissions = user.permissions.filter(p => !permissions.includes(p));
      this.updateUser(userId, { permissions: newPermissions });
      this.logActivity('revoke_permissions', 'user', userId, user.name, `Permissions revoked: ${permissions.join(', ')}`);
    }
  }

  // Permission checking
  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  }

  canCreateProject(): boolean {
    return this.hasPermission('create_project') || this.isAdmin();
  }

  canDeleteProject(): boolean {
    return this.isAdmin();
  }

  canCreateTask(): boolean {
    return this.hasPermission('create_task') || this.isAdmin();
  }

  canDeleteTask(): boolean {
    return this.isAdmin();
  }

  canCreateStep(): boolean {
    return this.hasPermission('create_step') || this.isAdmin();
  }

  canDeleteStep(): boolean {
    return this.isAdmin();
  }

  // Activity logging
  logActivity(action: string, entityType: ActivityLog['entityType'], entityId: string, entityName: string, details: string): void {
    const user = this.currentUser();
    if (!user) return;

    const activity: ActivityLog = {
      id: this.generateId(),
      userId: user.id,
      userName: user.name,
      action,
      entityType,
      entityId,
      entityName,
      details,
      timestamp: new Date(),
      ipAddress: '127.0.0.1' // In real app, get actual IP
    };

    this.activityLogs.update(logs => [activity, ...logs]);
  }

  getActivityLogsByDateRange(startDate: Date, endDate: Date): ActivityLog[] {
    return this.activityLogs().filter(log =>
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  getActivityLogsByUser(userId: string): ActivityLog[] {
    return this.activityLogs().filter(log => log.userId === userId);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeDefaultUsers(): void {
    const admin: User = {
      id: 'admin-1',
      email: 'admin@company.com',
      name: 'System Administrator',
      role: 'admin',
      isActive: true,
      isLocked: false,
      permissions: [], // Admin has all permissions
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const manager: User = {
      id: 'manager-1',
      email: 'manager@company.com',
      name: 'Project Manager',
      role: 'manager',
      isActive: true,
      isLocked: false,
      permissions: ['create_project', 'edit_project', 'create_task', 'edit_task', 'delete_task', 'create_step', 'edit_step', 'delete_step'],
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const user: User = {
      id: 'user-1',
      email: 'user@company.com',
      name: 'Regular User',
      role: 'user',
      isActive: true,
      isLocked: false,
      permissions: ['view_projects', 'create_task', 'edit_task', 'create_step', 'edit_step'],
      createdDate: new Date(),
      updatedDate: new Date()
    };

    this.users.set([admin, manager, user]);
  }
}