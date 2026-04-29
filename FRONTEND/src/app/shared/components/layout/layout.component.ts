import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">AdminPro</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            <span>Products</span>
          </a>
          <a *ngIf="authService.isAdmin()" routerLink="/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span>Users</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ getInitial() }}</div>
            <div class="user-details">
              <div class="user-name">{{ authService.currentUser()?.name }}</div>
              <div class="user-role">{{ authService.currentUser()?.role | titlecase }}</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">↩ Logout</button>
        </div>
      </aside>

      <main class="main-content">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: #0d1117; font-family: 'Segoe UI', sans-serif; }
    .sidebar { width: 260px; background: #161b22; border-right: 1px solid #21262d; display: flex; flex-direction: column; position: fixed; height: 100vh; }
    .sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 24px 20px; border-bottom: 1px solid #21262d; }
    .brand-icon { font-size: 28px; }
    .brand-name { color: #fff; font-size: 18px; font-weight: 700; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: #8b949e; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .nav-item:hover { background: #21262d; color: #e6edf3; }
    .nav-item.active { background: rgba(124,58,237,0.2); color: #a78bfa; border: 1px solid rgba(124,58,237,0.3); }
    .nav-icon { font-size: 18px; }
    .sidebar-footer { padding: 16px 12px; border-top: 1px solid #21262d; }
    .user-info { display: flex; align-items: center; gap: 10px; padding: 12px; }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
    .user-name { color: #e6edf3; font-size: 13px; font-weight: 600; }
    .user-role { color: #8b949e; font-size: 11px; }
    .logout-btn { width: 100%; padding: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; margin-top: 4px; }
    .logout-btn:hover { background: rgba(239,68,68,0.2); }
    .main-content { flex: 1; margin-left: 260px; padding: 32px; overflow-y: auto; }
  `],
})
export class LayoutComponent {
  constructor(public authService: AuthService, private router: Router) {}

  getInitial(): string {
    return this.authService.currentUser()?.name?.charAt(0).toUpperCase() || 'U';
  }

  logout(): void {
    this.authService.logout();
  }
}
