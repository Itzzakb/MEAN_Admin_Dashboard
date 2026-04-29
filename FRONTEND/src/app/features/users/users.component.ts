import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LayoutComponent, FormsModule],
  template: `
    <app-layout>
      <div class="page">
        <div class="page-header">
          <h1>User Management</h1>
          <p>Manage all registered users</p>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <input class="search-input" type="text" [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)" placeholder="🔍 Search users..." />
          <select [(ngModel)]="filterRole" (ngModelChange)="loadUsers()">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select [(ngModel)]="filterStatus" (ngModelChange)="loadUsers()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <!-- Table -->
        <div class="table-card">
          <div *ngIf="loading" class="loading-state">Loading users...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ user.name?.charAt(0).toUpperCase() }}</div>
                    <span>{{ user.name }}</span>
                  </div>
                </td>
                <td class="muted">{{ user.email }}</td>
                <td><span class="badge" [class]="user.role">{{ user.role }}</span></td>
                <td><span class="badge" [class]="user.status">{{ user.status }}</span></td>
                <td class="muted">{{ user.createdAt | date:'MMM d, y' }}</td>
                <td>
                  <button class="btn-icon danger" (click)="deleteUser(user._id)" title="Delete user">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="6" class="empty-state">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination.pages > 1">
          <button [disabled]="pagination.page === 1" (click)="goToPage(pagination.page - 1)">← Prev</button>
          <span>Page {{ pagination.page }} of {{ pagination.pages }} ({{ pagination.total }} total)</span>
          <button [disabled]="pagination.page === pagination.pages" (click)="goToPage(pagination.page + 1)">Next →</button>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page { color: #e6edf3; }
    .page-header { margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; color: #fff; }
    p { color: #8b949e; margin: 0; font-size: 14px; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 220px; padding: 10px 16px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; color: #e6edf3; font-size: 14px; outline: none; }
    .search-input:focus { border-color: #7c3aed; }
    select { padding: 10px 16px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; color: #e6edf3; font-size: 14px; outline: none; cursor: pointer; }
    .table-card { background: #161b22; border: 1px solid #21262d; border-radius: 16px; overflow: hidden; }
    .loading-state, .empty-state { padding: 40px; text-align: center; color: #8b949e; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 14px 20px; text-align: left; color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #21262d; background: #0d1117; }
    td { padding: 14px 20px; font-size: 13px; color: #e6edf3; border-bottom: 1px solid #21262d; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .muted { color: #8b949e; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 12px; flex-shrink: 0; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
    .badge.admin { background: rgba(124,58,237,0.2); color: #a78bfa; }
    .badge.user { background: rgba(59,130,246,0.2); color: #60a5fa; }
    .badge.active { background: rgba(34,197,94,0.2); color: #4ade80; }
    .badge.inactive { background: rgba(239,68,68,0.2); color: #f87171; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: background 0.2s; }
    .btn-icon.danger:hover { background: rgba(239,68,68,0.15); }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 24px; }
    .pagination button { padding: 8px 18px; background: #161b22; border: 1px solid #30363d; color: #e6edf3; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .pagination button:hover:not(:disabled) { border-color: #7c3aed; color: #a78bfa; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .pagination span { color: #8b949e; font-size: 13px; }
  `],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  searchQuery = '';
  filterRole = '';
  filterStatus = '';
  pagination = { page: 1, limit: 10, total: 0, pages: 0 };
  private searchSubject = new Subject<string>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pagination.page = 1;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers({
      page: this.pagination.page,
      limit: this.pagination.limit,
      search: this.searchQuery,
      role: this.filterRole,
      status: this.filterStatus,
    }).subscribe({
      next: (res) => {
        this.users = res.data;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  goToPage(page: number): void {
    this.pagination.page = page;
    this.loadUsers();
  }

  deleteUser(id: string): void {
    if (!confirm('Delete this user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert(err.error?.message || 'Delete failed'),
    });
  }
}
