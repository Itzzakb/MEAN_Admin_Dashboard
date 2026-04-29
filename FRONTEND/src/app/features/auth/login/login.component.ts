import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">⚡</div>
          <h1>Admin Dashboard</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" formControlName="email" placeholder="admin@dashboard.com"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" />
            <span class="error-msg" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Valid email required
            </span>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" />
            <span class="error-msg" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password required
            </span>
          </div>

          <div class="error-banner" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" [disabled]="loading || loginForm.invalid" class="btn-primary">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Create one</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      font-family: 'Segoe UI', sans-serif;
    }
    .auth-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }
    .auth-header { text-align: center; margin-bottom: 36px; }
    .logo { font-size: 48px; margin-bottom: 8px; }
    h1 { color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    p { color: rgba(255,255,255,0.5); margin: 0; }
    .form-group { margin-bottom: 20px; }
    label { display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; margin-bottom: 8px; }
    input {
      width: 100%; padding: 12px 16px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07);
      color: #fff; font-size: 14px; box-sizing: border-box; outline: none; transition: border 0.2s;
    }
    input:focus { border-color: #7c3aed; }
    input.error { border-color: #ef4444; }
    input::placeholder { color: rgba(255,255,255,0.3); }
    .error-msg { color: #ef4444; font-size: 12px; margin-top: 4px; display: block; }
    .error-banner { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #ef4444; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .btn-primary {
      width: 100%; padding: 13px; background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s, transform 0.1s;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .auth-footer { text-align: center; margin-top: 24px; color: rgba(255,255,255,0.5); font-size: 14px; }
    .auth-footer a { color: #7c3aed; text-decoration: none; font-weight: 500; }
    .demo-hint { margin-top: 16px; padding: 12px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 12px; text-align: center; }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
