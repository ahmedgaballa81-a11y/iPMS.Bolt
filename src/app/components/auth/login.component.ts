import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { LoginRequest, RegisterRequest } from "../../models/user.model";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>{{ isLoginMode ? "Sign In" : "Sign Up" }}</h1>
          <p>{{ isLoginMode ? "Welcome back!" : "Create your account" }}</p>
        </div>

        @if (errorMessage) {
        <div class="error-message">⚠️ {{ errorMessage }}</div>
        } @if (successMessage) {
        <div class="success-message">✅ {{ successMessage }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          @if (!isLoginMode) {
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="registerData.name"
              name="name"
              required
              placeholder="Enter your full name"
            />
          </div>
          }

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [ngModel]="isLoginMode ? loginData.email : registerData.email"
              (ngModelChange)="
                isLoginMode
                  ? (loginData.email = $event)
                  : (registerData.email = $event)
              "
              name="email"
              required
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [ngModel]="
                isLoginMode ? loginData.password : registerData.password
              "
              (ngModelChange)="
                isLoginMode
                  ? (loginData.password = $event)
                  : (registerData.password = $event)
              "
              name="password"
              required
              placeholder="Enter your password"
            />
          </div>

          @if (isLoginMode) {
          <div class="form-options">
            <button
              type="button"
              class="link-button"
              (click)="showResetPassword = true"
            >
              Forgot Password?
            </button>
          </div>
          }

          <button
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="isLoading"
          >
            {{
              isLoading ? "Please wait..." : isLoginMode ? "Sign In" : "Sign Up"
            }}
          </button>
        </form>

        <div class="social-login">
          <div class="divider">
            <span>or continue with</span>
          </div>

          <div class="social-buttons">
            <button
              type="button"
              class="btn btn-social google"
              (click)="loginWithGoogle()"
              [disabled]="isLoading"
            >
              G Google
            </button>
            <button
              type="button"
              class="btn btn-social facebook"
              (click)="loginWithFacebook()"
              [disabled]="isLoading"
            >
              f Facebook
            </button>
          </div>
        </div>

        <div class="auth-switch">
          <p>
            {{
              isLoginMode
                ? "Don't have an account?"
                : "Already have an account?"
            }}
            <button type="button" class="link-button" (click)="toggleMode()">
              {{ isLoginMode ? "Sign Up" : "Sign In" }}
            </button>
          </p>
        </div>

        <!-- Reset Password Modal -->
        @if (showResetPassword) {
        <div class="modal-overlay" (click)="showResetPassword = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>Reset Password</h3>
            <p>
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form (ngSubmit)="resetPassword()">
              <div class="form-group">
                <label for="resetEmail">Email</label>
                <input
                  type="email"
                  id="resetEmail"
                  [(ngModel)]="resetEmail"
                  name="resetEmail"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div class="modal-actions">
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="showResetPassword = false"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
        }

        <!-- Demo Credentials -->
        <div class="demo-credentials">
          <h4>Demo Credentials</h4>
          <div class="demo-accounts">
            <div class="demo-account">
              <strong>Admin:</strong> admin&#64;company.com / admin123
            </div>
            <div class="demo-account">
              <strong>Manager:</strong> manager&#64;company.com / password
            </div>
            <div class="demo-account">
              <strong>User:</strong> user&#64;company.com / password
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
          135deg,
          var(--primary-light),
          var(--secondary-light)
        );
        padding: 2rem;
      }

      .auth-card {
        background: var(--surface);
        border-radius: 16px;
        padding: 3rem;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border);
        width: 100%;
        max-width: 450px;
      }

      .auth-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .auth-header h1 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 2rem;
        font-weight: 600;
      }

      .auth-header p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 1rem;
      }

      .error-message {
        background: var(--error-light);
        color: var(--error);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        border: 1px solid var(--error);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .success-message {
        background: var(--success-light);
        color: var(--success);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        border: 1px solid var(--success);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .auth-form {
        margin-bottom: 2rem;
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
        padding: 0.875rem;
        border: 2px solid var(--border);
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s;
        font-family: inherit;
      }

      .form-group input:focus {
        outline: none;
        border-color: var(--primary);
      }

      .form-options {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.5rem;
      }

      .link-button {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        text-decoration: none;
        font-size: 0.9rem;
        padding: 0;
      }

      .link-button:hover {
        text-decoration: underline;
      }

      .btn {
        padding: 0.875rem 1.5rem;
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

      .btn-primary:hover:not(:disabled) {
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

      .btn-full {
        width: 100%;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .social-login {
        margin-bottom: 2rem;
      }

      .divider {
        text-align: center;
        margin: 1.5rem 0;
        position: relative;
      }

      .divider::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border);
      }

      .divider span {
        background: var(--surface);
        padding: 0 1rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .social-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .btn-social {
        background: var(--surface-elevated);
        color: var(--text-primary);
        border: 1px solid var(--border);
        font-size: 0.9rem;
      }

      .btn-social:hover:not(:disabled) {
        background: var(--background);
      }

      .btn-social.google:hover:not(:disabled) {
        border-color: #4285f4;
        color: #4285f4;
      }

      .btn-social.facebook:hover:not(:disabled) {
        border-color: #1877f2;
        color: #1877f2;
      }

      .social-icon {
        font-size: 1.1rem;
      }

      .auth-switch {
        text-align: center;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
      }

      .auth-switch p {
        margin: 0;
        color: var(--text-secondary);
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background: var(--surface);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border);
        width: 100%;
        max-width: 400px;
        margin: 2rem;
      }

      .modal-content h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
      }

      .modal-content p {
        margin: 0 0 1.5rem 0;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }

      .demo-credentials {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
      }

      .demo-credentials h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
        font-size: 1rem;
        text-align: center;
      }

      .demo-accounts {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .demo-account {
        background: var(--surface-elevated);
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .demo-account strong {
        color: var(--text-primary);
      }

      @media (max-width: 768px) {
        .auth-container {
          padding: 1rem;
        }

        .auth-card {
          padding: 2rem;
        }

        .social-buttons {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(AuthService);

  isLoginMode = true;
  isLoading = false;
  errorMessage = "";
  successMessage = "";
  showResetPassword = false;
  resetEmail = "";

  loginData: LoginRequest = {
    email: "",
    password: "",
  };

  registerData: RegisterRequest = {
    email: "",
    password: "",
    name: "",
  };

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = "";
    this.successMessage = "";
    this.resetForm();
  }

  async onSubmit(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = "";
    this.successMessage = "";

    try {
      if (this.isLoginMode) {
        const result = await this.authService.login(this.loginData);
        if (result.success) {
          this.successMessage = result.message;
          // In real app, navigate to dashboard
        } else {
          this.errorMessage = result.message;
        }
      } else {
        const result = await this.authService.register(this.registerData);
        if (result.success) {
          this.successMessage = result.message;
          this.isLoginMode = true;
          this.resetForm();
        } else {
          this.errorMessage = result.message;
        }
      }
    } catch (error) {
      this.errorMessage = "An unexpected error occurred";
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      const result = await this.authService.loginWithGoogle();
      if (result.success) {
        this.successMessage = result.message;
      } else {
        this.errorMessage = result.message;
      }
    } catch (error) {
      this.errorMessage = "Google login failed";
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithFacebook(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      const result = await this.authService.loginWithFacebook();
      if (result.success) {
        this.successMessage = result.message;
      } else {
        this.errorMessage = result.message;
      }
    } catch (error) {
      this.errorMessage = "Facebook login failed";
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.resetEmail) return;

    try {
      const result = await this.authService.resetPassword(this.resetEmail);
      if (result.success) {
        this.successMessage = result.message;
        this.showResetPassword = false;
        this.resetEmail = "";
      } else {
        this.errorMessage = result.message;
      }
    } catch (error) {
      this.errorMessage = "Password reset failed";
    }
  }

  private resetForm(): void {
    this.loginData = { email: "", password: "" };
    this.registerData = { email: "", password: "", name: "" };
  }
}