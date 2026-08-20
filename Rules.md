# Project Rules & Guidelines — Vvarsa

File ini memuat konvensi coding, gaya penulisan, dan batasan teknis bagi developer maupun Asisten AI dalam memodifikasi repository.

---

## 1. Coding Convention (Backend — PHP/Laravel)

- **Format Code**: Wajib patuh pada standar **PSR-12**. Gunakan `./vendor/bin/pint` untuk auto-format sebelum commit.
- **Strict Typing**: Gunakan return type hinting (`: string`, `: void`, `: Response`, dsb.) dan tentukan property type di semua class/method baru.
- **Arsitektur Controller (Thin Controller)**: Controller hanya boleh berisi: pengambilan input, pemanggilan logic, dan return response Inertia. Jika logika bisnis kompleks, pindahkan ke `Services`, `Actions`, atau `Traits` tersendiri.
- **Pengambilan Tenant Context**: Gunakan selalu `app('tenant')` di dalam controller untuk mendapatkan tenant aktif. Jangan re-query tenant dari database di dalam controller.
- **Query Builder**:
  - Refactor kondisi yang berulang menjadi **Eloquent Scope** (contoh: `scopeForTenant($query, $tenantId)`, `scopeActive`, `scopeUpcoming`).
  - Gunakan **eager loading** (`with(...)`) untuk relasi yang dikonsumsi di frontend guna mencegah query N+1.
  - Selalu sertakan kolom spesifik (`get(['id', 'name', ...])`) saat hanya sebagian kolom dibutuhkan.
- **Transaksi Database**: Semua operasi multi-step (misal: update stok + buat StockMovement) wajib dibungkus dalam `DB::transaction(function () { ... })`.
- **Validasi Input**: Gunakan method `$request->validate([...])` langsung di controller, bukan anonymous validation. Untuk form kompleks, buat `FormRequest` di `app/Http/Requests/`.

---

## 2. Coding Convention (Frontend — React/TypeScript)

- **Komponen Fungsional**: Selalu gunakan **React Functional Components** beserta Hooks. Dilarang menggunakan Legacy Class Components.
- **Penamaan File**:
  - Komponen React UI: `PascalCase.tsx` (contoh: `OrderSummaryCard.tsx`)
  - Halaman Inertia: `kebab-case.tsx` di dalam folder domain (contoh: `pages/orders/create.tsx`)
  - Custom Hooks: `use-nama-hook.tsx` atau `use-nama-hook.ts` (contoh: `use-mobile.tsx`)
  - File utilitas: `camelCase.ts` atau `kebab-case.ts` (contoh: `utils-mrp.ts`)
- **Styling**: Dilarang menggunakan inline `style={{}}` kecuali untuk nilai yang benar-benar dinamis secara komputasi. Wajib menggunakan kelas **Tailwind CSS 4**.
- **Prettier**: Konfigurasi aktif (`.prettierrc`) — `singleQuote: true`, `semi: true`, `tabWidth: 4`, `printWidth: 150`. Jalankan `npm run format` sebelum commit.
- **ESLint**: Konfigurasi aktif (`eslint.config.js`). Aturan kritis:
  - `react-hooks/rules-of-hooks`: **error** — Hooks hanya boleh dipanggil di level atas komponen.
  - `react-hooks/exhaustive-deps`: **warn** — dependency array `useEffect`/`useCallback` harus lengkap.
- **Type Safety**:
  - Dilarang menggunakan tipe `any`. Definisikan `interface` atau `type` untuk semua props, state, dan data Inertia.
  - Tipe domain utama (Product, Order, Tenant, dll.) didefinisikan di `resources/js/types/mrp.d.ts`. Tambahkan tipe baru di file ini jika membuat entitas baru.
  - Tipe shared props Inertia (auth, tenant, ziggy) didefinisikan di `resources/js/types/index.d.ts`.
  - Jalankan `npm run types` (`tsc --noEmit`) untuk verifikasi type sebelum commit.
- **Form Handling**: Gunakan **React Hook Form** + **Zod** untuk semua form. Jangan mix antara uncontrolled dan controlled input dalam satu form.
- **Routing**: Gunakan helper `route()` dari Ziggy untuk generate URL dari named route Laravel. Jangan hardcode URL string.

---

## 3. Style Guide & UI

- **Design System**: Antarmuka dibangun berbasis komponen **Radix UI** / **Headless UI** yang diekspos melalui pola shadcn/ui. Pertahankan konsistensi ukuran (`rem`), palet warna Tailwind, dan `border-radius` yang sudah ada.
- **Ikonografi**: Gunakan library ikon **`lucide-react`** secara eksklusif. Jangan mencampur library ikon lain.
- **Data Table**: Gunakan **TanStack Table** (`@tanstack/react-table`) untuk semua tampilan tabel data. Jangan menggunakan tabel HTML manual untuk data yang memerlukan sort/filter/pagination.
- **Toast Notifikasi**: Gunakan **Sonner** (`import { toast } from 'sonner'`) untuk semua notifikasi aksi (sukses, error). Tersedia juga `goey-toast` untuk kasus custom.
- **Grafik & Visualisasi**: Gunakan **Recharts** untuk semua komponen chart. Jangan menggunakan library chart lain.
- **Animasi**: Gunakan **Framer Motion** untuk animasi transisi halaman atau elemen interaktif. Jangan menggunakan animasi CSS custom yang tidak konsisten.
- **Format Angka & Tanggal**: Selalu gunakan fungsi helper dari `resources/js/lib/utils-mrp.ts`:
  - `formatRupiah(amount)` — format angka ke format Rupiah Indonesia.
  - `formatDate(dateStr)` — format tanggal ke format Indonesia (contoh: "18 Agustus 2026").
  - `formatDateTime(dateStr)` — format tanggal + waktu.
  - Jangan menggunakan `toLocaleString()` manual secara ad-hoc di komponen.
- **Layout Shell**: Pilih layout yang tepat sesuai konteks:
  - `app-layout.tsx` — untuk halaman tenant (owner, supervisor, staff).
  - `admin-layout.tsx` — untuk halaman platform admin (`/admin/*`).
  - `auth-layout.tsx` — untuk halaman autentikasi (login, register, dll.).

---

## 4. Aturan Multi-Tenancy & Keamanan Data

1. **Isolasi Data Tenant Wajib**: Setiap query yang menyentuh data tenant (Product, Order, Transaction, StockMovement, dll.) **wajib** menyertakan filter `where('tenant_id', $tenant->id)` atau menggunakan scope `forTenant()`. Tidak boleh ada query lintas tenant.
2. **UUID sebagai Primary Key**: Semua model yang menyimpan data sensitif per tenant wajib menggunakan Trait `HasUuids` bawaan Laravel. Jangan menggunakan auto-increment integer untuk entitas yang dapat diakses secara publik.
3. **Subscription Enforcement**: Sebelum operasi `create` untuk produk atau user, panggil `$tenant->canAddProduct()` atau `$tenant->canAddUser()`. Jika false, kembalikan error response yang informatif ke frontend via Inertia.
4. **Otorisasi Role**: Gunakan middleware `role:owner`, `role:owner|supervisor`, dsb. di level route group di `web.php`. Jangan melakukan pengecekan role secara manual di dalam controller body kecuali ada logika kondisional yang berbeda per role.

---

## 5. Batasan & Instruksi AI Assistant / Kontributor

1. **Aturan Database Migration**:
   - **Dilarang** memodifikasi (edit) file migration yang sudah pernah dijalankan di database.
   - Untuk mengubah tabel, **wajib** membuat file migration baru: `php artisan make:migration add_kolom_baru_to_tabel`.
2. **Jangan Hapus Komentar Eksisting**:
   - Jangan menghapus atau mengubah komentar (docblock/inline comment) yang sudah ada kecuali diperintahkan secara eksplisit. Komentar tersebut menopang konteks flow aplikasi.
3. **Lokasi File Baru**:
   - Scaffolding file baru **wajib** ditempatkan pada direktori yang sesuai (`app/Models/`, `app/Http/Controllers/`, `resources/js/pages/`, `resources/js/components/`, dll.).
   - Dilarang membuat file sementara di root project, `.tmp`, atau direktori di luar workspace.
4. **Halaman Inertia Baru**:
   - Buat halaman baru di folder domain yang sesuai dalam `resources/js/pages/` (contoh: `pages/finance/expense-report.tsx`).
   - Pastikan halaman baru menggunakan salah satu layout shell yang sudah ada (`app-layout`, `admin-layout`, `auth-layout`).
5. **Model Baru**:
   - Buat migration + model secara bersamaan menggunakan `php artisan make:model NamaModel -m`.
   - Tambahkan `HasUuids` jika model menyimpan data per-tenant.
   - Definisikan `$fillable`, `$casts`, dan semua relasi Eloquent yang diperlukan.
   - Tambahkan definisi tipe TypeScript yang bersesuaian di `resources/js/types/mrp.d.ts`.
6. **Controller Baru**:
   - Tempatkan di subfolder domain yang tepat (`Admin/`, `Inventory/`, `Finance/`, `Order/`, `Owner/`, `Tax/`).
   - Daftarkan route-nya di `routes/web.php` dalam middleware group yang sesuai.
