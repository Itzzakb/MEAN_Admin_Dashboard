import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent, RouterLink],
  template: `
    <app-layout>
      <div class="dashboard">
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {{ authService.currentUser()?.name }}! Here's what's happening.</p>
        </div>

        <div *ngIf="loading" class="loading">Loading stats...</div>

        <div *ngIf="!loading && stats" class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
              <div class="stat-sub">{{ stats.activeUsers }} active</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-label">Total Products</div>
              <div class="stat-sub">{{ stats.activeProducts }} active</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeUsers }}</div>
              <div class="stat-label">Active Users</div>
              <div class="stat-sub">{{ stats.inactiveUsers }} inactive</div>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeProducts }}</div>
              <div class="stat-label">Active Products</div>
              <div class="stat-sub">{{ stats.inactiveProducts }} inactive</div>
            </div>
          </div>
        </div>

        <div class="tables-row">
          <div class="table-card">
            <div class="table-header">
              <h3>Recent Users</h3>
              <a routerLink="/users" class="view-all">View All →</a>
            </div>
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of recentUsers">
                  <td>{{ user.name }}</td>
                  <td class="email">{{ user.email }}</td>
                  <td><span class="badge" [class]="user.role">{{ user.role }}</span></td>
                  <td><span class="badge" [class]="user.status">{{ user.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-card">
            <div class="table-header">
              <h3>Recent Products</h3>
              <a routerLink="/products" class="view-all">View All →</a>
            </div>
            <table>
              <thead>
                <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of recentProducts">
                  <td>{{ p.name }}</td>
                  <td class="email">{{ p.category }}</td>
                  <td>\${{ p.price | number:'1.2-2' }}</td>
                  <td>{{ p.stock }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard { color: #e6edf3; }
    .page-header { margin-bottom: 32px; }
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; color: #fff; }
    p { color: #8b949e; margin: 0; }
    .loading { color: #8b949e; padding: 40px; text-align: center; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: #161b22; border: 1px solid #21262d; border-radius: 16px; padding: 24px; display: flex; gap: 16px; align-items: center; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-icon { font-size: 36px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #fff; }
    .stat-label { color: #8b949e; font-size: 13px; margin: 2px 0; }
    .stat-sub { font-size: 12px; }
    .stat-card.blue .stat-sub { color: #60a5fa; }
    .stat-card.green .stat-sub { color: #34d399; }
    .stat-card.purple .stat-sub { color: #a78bfa; }
    .stat-card.orange .stat-sub { color: #fb923c; }
    .tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .table-card { background: #161b22; border: 1px solid #21262d; border-radius: 16px; overflow: hidden; }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #21262d; }
    h3 { margin: 0; color: #fff; font-size: 16px; }
    .view-all { color: #7c3aed; font-size: 13px; text-decoration: none; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 24px; text-align: left; color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #21262d; }
    td { padding: 12px 24px; font-size: 13px; color: #e6edf3; border-bottom: 1px solid #21262d; }
    tr:last-child td { border-bottom: none; }
    .email { color: #8b949e; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
    .badge.admin { background: rgba(124,58,237,0.2); color: #a78bfa; }
    .badge.user { background: rgba(59,130,246,0.2); color: #60a5fa; }
    .badge.active { background: rgba(34,197,94,0.2); color: #4ade80; }
    .badge.inactive { background: rgba(239,68,68,0.2); color: #f87171; }
  `],
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  recentUsers: any[] = [];
  recentProducts: any[] = [];
  loading = true;

  constructor(public authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data.stats;
        this.recentUsers = res.data.recentUsers;
        this.recentProducts = res.data.recentProducts;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
