# Architecture Document — Vvarsa

## 1. Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 dengan Inertia.js 2 (Vite 6)
- **Styling**: Tailwind CSS 4 dengan komponen Radix UI / Headless UI dan `class-variance-authority` (pendekatan shadcn/ui).
- **Database**: MySQL (via Laragon) / SQLite (opsional Development).
- **TypeScript**: Digunakan di sisi frontend untuk menjamin type safety (`.tsx`, `.ts`).
- **State/Form**: React Hook Form + Zod (validasi schema), TanStack Table (data table).
- **Charts**: Recharts.
- **Animasi**: Framer Motion.
- **Notifikasi**: Sonner + Goey Toast.
- **RBAC (Role & Permission)**: `spatie/laravel-permission` v8.
- **Route Helpers**: `tightenco/ziggy` (generate named routes ke sisi JS/TS).
- **Testing**: PestPHP v3.

---

## 2. Struktur Folder

Struktur proyek mengikuti standar **Laravel 12 + Inertia.js + React** (monorepo):

```
vvarsa/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/           # Platform Admin: Dashboard, Tenant, User, Plan, Event, Supplier
│   │   │   ├── Auth/            # Autentikasi (Login, Register, Password Reset)
│   │   │   ├── Finance/         # ReportController, TransactionController
│   │   │   ├── Inventory/       # ProductController, ProductVariantController, RecipeController, StockMovementController
│   │   │   ├── Order/           # OrderController, PackageController, PosController
│   │   │   ├── Owner/           # MemberController, SubscriptionController
│   │   │   ├── Settings/        # Pengaturan akun/profil user
│   │   │   ├── Tax/             # TaxController (laporan & konsultasi pajak)
│   │   │   ├── CommunityController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── EventController.php
│   │   │   └── SupplierController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureTenantMiddleware.php  # Inject tenant context ke request
│   │   │   ├── HandleAppearance.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/            # Form Request Validation
│   ├── Models/                  # Eloquent Models (27 model)
│   └── Providers/
├── database/
│   ├── migrations/              # Skema tabel beserta revisi
│   └── seeders/                 # PermissionSeeder, SubscriptionPlanSeeder, TenantDemoSeeder, dll.
├── resources/
│   ├── css/
│   └── js/
│       ├── app.tsx              # Entry point frontend
│       ├── ssr.tsx              # Entry point SSR (opsional)
│       ├── components/          # Komponen UI reusable (AppSidebar, DataTable, DeleteDialog, dll.)
│       │   └── ui/              # Primitif shadcn/ui (Button, Input, Dialog, Select, dll.)
│       ├── hooks/               # Custom React hooks
│       ├── layouts/             # Layout shell (app-layout, admin-layout, auth-layout, settings-layout)
│       ├── lib/                 # Utility (cn, format, dll.)
│       ├── pages/               # Halaman Inertia per domain fitur
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── community/
│       │   ├── events/
│       │   ├── finance/
│       │   ├── inventory/
│       │   ├── orders/
│       │   ├── owner/
│       │   ├── packages/
│       │   ├── recipes/
│       │   ├── settings/
│       │   ├── suppliers/
│       │   ├── tax/
│       │   ├── variants/
│       │   ├── dashboard.tsx
│       │   └── welcome.tsx
│       └── types/
│           ├── mrp.d.ts         # Tipe domain utama (Tenant, Product, Order, dll.)
│           └── index.d.ts       # Tipe global Inertia shared props
├── routes/
│   ├── web.php                  # Routing utama (Public, Admin, Tenant)
│   ├── auth.php                 # Route autentikasi
│   └── settings.php             # Route pengaturan profil
└── vite.config.ts
```

---

## 3. Sistem Multi-Tenancy

Vvarsa adalah platform **SaaS multi-tenant**. Setiap bisnis (UMKM) disebut **Tenant**.

### Alur Tenant Context

1. **Login** → Middleware `EnsureTenantMiddleware` berjalan di setiap request tenant.
2. **Cek Peran**: Jika user berperan `admin` (platform admin), diarahkan ke `/admin`. Jika belum punya `tenant_id`, diarahkan ke halaman pilih bisnis.
3. **Load Tenant**: Tenant di-load bersama relasi `plan` & `activeSubscription`.
4. **Inject ke Container**: `app()->instance('tenant', $tenant)` agar Controller dapat mengaksesnya via `app('tenant')`.
5. **Share ke Inertia**: Data tenant (id, name, plan, limits) di-share ke semua halaman React via `inertia()->share()`.

### Batasan Plan (Subscription-Based)

Model `Tenant` memiliki computed attribute `max_products` dan `max_users` yang bersumber dari `SubscriptionPlan`. Method `canAddProduct()` dan `canAddUser()` digunakan sebelum operasi create untuk menegakkan batasan plan.

---

## 4. Sistem Role & Permission

Menggunakan **Spatie Laravel Permission v8** dengan 4 role utama:

| Role | Konteks | Akses Utama |
|---|---|---|
| `admin` | Platform (global) | Dashboard admin, kelola Tenant, User, Plan, Event global |
| `owner` | Dalam Tenant | Full akses: inventory, finance, order, resep, paket, pajak, member |
| `supervisor` | Dalam Tenant | Sama dengan Owner kecuali tidak bisa manage member (hanya request) |
| `staff` | Dalam Tenant | Lihat produk, kelola stok, pesanan, events, community (terbatas) |

### Routing Berdasarkan Role

```
/               → Public (welcome page)
/admin/*        → middleware: auth, verified, role:admin
/dashboard      → middleware: auth, verified, EnsureTenant, role:owner|supervisor|staff
/inventory/*    → View: owner|supervisor|staff | Manage: owner only
/finance/*      → owner only
/orders/*       → owner|supervisor|staff
/members/*      → View: owner|supervisor | Manage: owner only
/tax/*          → owner (laporan), semua (konsultasi)
/subscription/* → owner only
```

---

## 5. Domain Fitur yang Sudah Diimplementasikan

### Inventory Management
- CRUD Produk (dengan kategori, gambar, SKU, harga beli/jual, minimum stok)
- Manajemen Stok: **Stock In**, **Stock Out**, **Opname** (koreksi stok)
- Riwayat pergerakan stok (`StockMovement`)
- Produk dapat di-toggle aktif/nonaktif

### Resep & BOM (Bill of Materials)
- CRUD Resep — menentukan komposisi bahan baku per porsi
- Varian Produk terhubung ke Resep untuk kalkulasi **HPP (Harga Pokok Produksi)**
- Kalkulasi margin dan profit otomatis dari HPP vs. harga jual

### Varian Produk
- CRUD Varian yang bisa dihubungkan ke Resep
- Digunakan sebagai item dalam Order dan POS

### Pesanan (Order) & POS
- CRUD Order (buat, lihat, update status, tandai bayar, hapus)
- Order mendukung item multi-varian dengan perhitungan subtotal, diskon, total
- Paket produk (bundling) dengan harga spesifik
- POS (Point of Sale) untuk transaksi kasir langsung

### Finance
- Laporan keuangan overview (pendapatan, pengeluaran, profit bulanan & harian)
- Manajemen Transaksi manual (income/expense)
- Laporan Penjualan & Laporan Pengeluaran terfilter
- Grafik tren penjualan mingguan (7 hari terakhir) di Dashboard

### Supplier
- CRUD Supplier (nama, kontak, website, rating, kategori produk)
- Supplier bisa dikelola oleh Tenant maupun Platform Admin

### Event
- Event dibuat oleh Platform Admin, dapat difilter per `business_type` tenant
- Tenant dapat mendaftar/membatalkan registrasi event
- Status event: `upcoming`, `ongoing`, `completed`, `cancelled`

### Community
- Forum diskusi antar-tenant (CommunityPost)
- Reply bersarang (nested replies)
- Fitur Like pada post

### Member Management
- Owner mengundang/menambah User baru ke dalam Tenant
- Owner dapat mengubah role staff, menonaktifkan, atau menghapus member
- Supervisor hanya bisa mengajukan request penambahan member (`MemberRequest`)
- Approval/Rejection request oleh Owner

### Subscription
- Owner dapat melihat status langganan aktif dan upgrade plan
- Admin dapat mengelola daftar `SubscriptionPlan` dan mengubah plan tenant

### Pajak (Tax)
- Laporan pajak manual (draft, submitted, paid)
- Halaman konsultasi pajak (semua role dapat akses)

---

## 6. Flow Data — Dashboard Tenant

```
GET /dashboard
  → DashboardController@index
     ├── app('tenant') → inject dari EnsureTenantMiddleware
     ├── Query: Stats (total produk, low stock, penjualan hari ini/bulan)
     ├── Query: Grafik mingguan (7 hari terakhir dari Transaction)
     ├── Query: 5 transaksi terbaru
     ├── Query: 3 event mendatang
     └── Query: 5 produk stok rendah
  → Inertia::render('dashboard', [...props])
  → React page: resources/js/pages/dashboard.tsx
```

---

## 7. Keputusan Teknis

- **Inertia.js + React (Monorepo)**: Menghilangkan kebutuhan RESTful API terpisah. Autentikasi dan otorisasi tetap sepenuhnya di sisi server Laravel. Data dikirim sebagai props Inertia, bukan via fetch/axios.
- **UUID untuk Primary Key**: Model utama (`User`, `Tenant`, dll.) menggunakan `HasUuids` bawaan Laravel untuk mencegah ID enumeration.
- **`app()->instance('tenant', $tenant)`**: Pendekatan *Service Container binding* agar tenant context tersedia di seluruh layer (Controller, Policy) tanpa perlu inject ulang dari request.
- **Subscription-Gated Features**: Batas `max_products` dan `max_users` ditegakkan di level Controller (bukan middleware) agar error bisa dikembalikan sebagai response Inertia yang informatif.
- **Spatie Permission — Role-based Routing**: Middleware `role:owner|supervisor` digunakan langsung di route group sehingga otorisasi fitur transparan dari `web.php`.
- **TanStack Table**: Digunakan untuk semua data table di frontend agar mendukung sorting, filtering, dan pagination secara konsisten.
- **Recharts + Framer Motion**: Visualisasi data keuangan dengan grafik interaktif dan animasi halaman yang smooth untuk pengalaman premium.
