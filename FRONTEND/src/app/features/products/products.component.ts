import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, LayoutComponent, FormsModule, ReactiveFormsModule],
  template: `
    <app-layout>
      <div class="page">
        <div class="page-header">
          <div>
            <h1>Products</h1>
            <p>Manage your product catalog</p>
          </div>
          <button *ngIf="authService.isAdmin()" class="btn-primary" (click)="openModal()">+ Add Product</button>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <input class="search-input" type="text" [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)" placeholder="🔍 Search products..." />
          <select [(ngModel)]="filterCategory" (ngModelChange)="loadProducts()">
            <option value="">All Categories</option>
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
          <select [(ngModel)]="filterStatus" (ngModelChange)="loadProducts()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <!-- Table -->
        <div class="table-card">
          <div *ngIf="loading" class="loading-state">Loading products...</div>
          <table *ngIf="!loading">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Created</th><th *ngIf="authService.isAdmin()">Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products">
                <td>
                  <div class="product-name">{{ p.name }}</div>
                  <!-- <div class="product-desc">{{ p.description | slice:0:50 }}...</div> -->
                </td>
                <td><span class="category-tag">{{ p.category }}</span></td>
                <td class="price">₹{{ p.price | number:'1.2-2' }}</td>
                <td [class.low-stock]="p.stock < 10">{{ p.stock }}</td>
                <td><span class="badge" [class]="p.status">{{ p.status | titlecase }}</span></td>
                <td class="muted">{{ p.createdAt | date:'MMM d, y' }}</td>
                <td *ngIf="authService.isAdmin()">
                  <button class="btn-icon edit" (click)="editProduct(p)" title="Edit">✏️</button>
                  <button class="btn-icon danger" (click)="deleteProduct(p._id)" title="Delete">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="products.length === 0">
                <td colspan="7" class="empty-state">No products found.</td>
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

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
            <div class="form-row">
              <div class="form-group">
                <label>Product Name</label>
                <input type="text" formControlName="name" placeholder="Product name" />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select formControlName="category">
                  <option value="">Select category</option>
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" formControlName="price" placeholder="0" step="1" />
              </div>
              <div class="form-group">
                <label>Stock</label>
                <input type="number" formControlName="stock" placeholder="0" />
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" rows="3" placeholder="Product description..."></textarea>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select formControlName="status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="productForm.invalid || saving">
                {{ saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page { color: #e6edf3; position: relative; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; color: #fff; }
    p { color: #8b949e; margin: 0; font-size: 14px; }
    .btn-primary { padding: 10px 20px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 10px 20px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 10px; font-size: 14px; cursor: pointer; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 220px; padding: 10px 16px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; color: #e6edf3; font-size: 14px; outline: none; }
    .search-input:focus { border-color: #7c3aed; }
    select { padding: 10px 16px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; color: #e6edf3; font-size: 14px; outline: none; cursor: pointer; }
    .table-card { background: #161b22; border: 1px solid #21262d; border-radius: 16px; overflow: hidden; }
    .loading-state, .empty-state { padding: 40px; text-align: center; color: #8b949e; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 14px 20px; text-align: left; color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #21262d; background: #0d1117; }
    td { padding: 14px 20px; font-size: 13px; color: #e6edf3; border-bottom: 1px solid #21262d; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .product-name { font-weight: 500; }
    .product-desc { color: #8b949e; font-size: 12px; margin-top: 2px; }
    .category-tag { background: rgba(59,130,246,0.15); color: #60a5fa; padding: 3px 10px; border-radius: 6px; font-size: 12px; }
    .price { color: #4ade80; font-weight: 600; }
    .low-stock { color: #f87171 !important; }
    .muted { color: #8b949e; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.active { background: rgba(34,197,94,0.2); color: #4ade80; }
    .badge.inactive { background: rgba(239,68,68,0.2); color: #f87171; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 15px; padding: 4px 6px; border-radius: 6px; transition: background 0.2s; }
    .btn-icon.edit:hover { background: rgba(59,130,246,0.15); }
    .btn-icon.danger:hover { background: rgba(239,68,68,0.15); }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 24px; }
    .pagination button { padding: 8px 18px; background: #161b22; border: 1px solid #30363d; color: #e6edf3; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .pagination button:hover:not(:disabled) { border-color: #7c3aed; color: #a78bfa; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .pagination span { color: #8b949e; font-size: 13px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal { background: #161b22; border: 1px solid #30363d; border-radius: 20px; padding: 32px; width: 100%; max-width: 560px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .modal-header h2 { margin: 0; color: #fff; font-size: 20px; }
    .close-btn { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
    .close-btn:hover { background: #21262d; color: #fff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; color: #8b949e; font-size: 13px; margin-bottom: 8px; }
    input, textarea { width: 100%; padding: 10px 14px; background: #0d1117; border: 1px solid #30363d; border-radius: 10px; color: #e6edf3; font-size: 14px; outline: none; box-sizing: border-box; }
    input:focus, textarea:focus, select:focus { border-color: #7c3aed; }
    textarea { resize: vertical; font-family: inherit; }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  `],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  loading = false;
  saving = false;
  searchQuery = '';
  filterCategory = '';
  filterStatus = '';
  categories = ['Electronics', 'Clothing', 'Books', 'Food', 'Sports', 'Other'];
  pagination = { page: 1, limit: 10, total: 0, pages: 0 };
  showModal = false;
  editingProduct: any = null;
  productForm: FormGroup;
  private searchSubject = new Subject<string>();

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stock: [0, [Validators.min(0)]],
      status: ['active'],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pagination.page = 1;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts({
      page: this.pagination.page,
      limit: this.pagination.limit,
      search: this.searchQuery,
      category: this.filterCategory,
      status: this.filterStatus,
    }).subscribe({
      next: (res) => {
        this.products = res.data;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onSearch(value: string): void { this.searchSubject.next(value); }
  goToPage(page: number): void { this.pagination.page = page; this.loadProducts(); }

  openModal(): void { this.showModal = true; this.editingProduct = null; this.productForm.reset({ status: 'active', stock: 0 }); }
  closeModal(): void { this.showModal = false; this.editingProduct = null; }

  editProduct(product: any): void {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showModal = true;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    this.saving = true;
    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct._id, this.productForm.value)
      : this.productService.createProduct(this.productForm.value);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadProducts(); },
      error: (err) => { alert(err.error?.message || 'Save failed'); this.saving = false; },
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({ next: () => this.loadProducts() });
  }
}
