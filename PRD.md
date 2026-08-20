# Product Requirements Document (PRD) — Vvarsa

## SECTION 1 — Problem Statement

**Masalah**
Pelaku UMKM (usaha mikro, kecil, dan menengah) — terutama di sektor kuliner, fashion, dan jasa — menghadapi tantangan besar dalam mengelola operasional bisnis secara terpadu. Banyak yang masih mengandalkan catatan manual, spreadsheet terpisah, atau beragam aplikasi yang tidak terintegrasi, sehingga rentan terhadap stok mati, keputusan keuangan berbasis intuisi, dan ketidakmampuan memantau performa bisnis secara real-time.

**Data Pendukung**
- Kesalahan pencatatan stok manual menyebabkan kerugian akibat kelebihan stok bahan baku atau kehabisan produk jual di saat demand tinggi.
- Pelaku UMKM sulit menghitung HPP (Harga Pokok Produksi) secara akurat, sehingga penetapan harga jual tidak optimal.
- Tidak adanya laporan keuangan terstruktur membuat pemantauan profit/loss hanya dilakukan secara perkiraan.
- Pengelolaan tim (karyawan) tanpa sistem menyebabkan celah akses dan duplikasi pekerjaan.

**Tujuan**
PRD ini mendefinisikan platform manajemen bisnis terintegrasi berbasis SaaS multi-tenant — **Vvarsa** — yang memungkinkan pelaku UMKM mengelola inventaris, keuangan, pesanan, resep/BOM, supplier, event komunitas, dan tim dalam satu dashboard, dengan kontrol akses berbasis peran.

---

## SECTION 2 — Goals

- **G1 (Efisiensi Operasional)**: Mengurangi waktu pencatatan stok dan transaksi manual sebesar minimal 60% dibandingkan metode spreadsheet.
- **G2 (Visibilitas Bisnis)**: Menyediakan dashboard terpusat yang merangkum performa inventaris, keuangan harian/bulanan, dan pesanan aktif secara real-time.
- **G3 (Akurasi HPP)**: Membantu UMKM menghitung HPP berbasis Resep/BOM secara otomatis sehingga penetapan harga jual lebih akurat dan margin termonitor.
- **G4 (Manajemen Tim)**: Memberikan kontrol akses berbasis peran (Owner / Supervisor / Staff) agar setiap anggota tim hanya dapat mengakses fitur sesuai kewenangannya.
- **G5 (Komunitas & Ekosistem)**: Membangun jaringan antar-UMKM melalui fitur Event dan Community Forum, meningkatkan kolaborasi dan peluang bisnis lintas tenant.
- **G6 (Skalabilitas Layanan)**: Mendukung model berlangganan bertingkat (Free → Pro → Enterprise) agar platform dapat dimonetisasi dan tumbuh seiring skala bisnis pengguna.

---

## SECTION 3 — Target Users / Personas

- **Platform Admin**: Pengelola platform Vvarsa. Bertugas mengelola tenant yang terdaftar, mengonfigurasi paket subscription, mengelola event global, dan memverifikasi supplier. Tidak terikat pada satu tenant.
- **Tenant Owner (Pemilik Bisnis)**: Pengguna utama. Memiliki akses penuh ke semua fitur dalam tenantnya — dari manajemen produk, keuangan, pesanan, resep, hingga manajemen anggota tim dan subscription.
- **Supervisor**: Manajer operasional harian. Mengakses inventaris, keuangan, dan pesanan. Dapat mengajukan request penambahan anggota baru, namun tidak bisa langsung manage member.
- **Staff (Karyawan)**: Operator lapangan. Akses terbatas pada pencatatan stok, pemrosesan pesanan, dan melihat daftar produk. Tidak dapat mengakses laporan keuangan atau konfigurasi bisnis.

---

## SECTION 4 — User Stories

Prioritas: P1 = wajib ada, P2 = penting, P3 = nice-to-have.

**Inventaris & Stok**
- US-1 (P1) Sebagai Owner, saya ingin menambah produk dengan data lengkap (SKU, satuan, harga beli, harga jual, stok minimum) agar inventaris selalu terdata.
- US-2 (P1) Sebagai Staff, saya ingin mencatat Stock In ketika barang datang dari supplier agar stok terupdate secara akurat.
- US-3 (P1) Sebagai Staff, saya ingin mencatat Stock Out untuk bahan yang terpakai produksi agar stok berkurang sesuai pemakaian.
- US-4 (P1) Sebagai Owner, saya ingin mendapat notifikasi visual (indikator) ketika stok produk berada di bawah minimum agar bisa segera reorder.
- US-5 (P2) Sebagai Owner, saya ingin melakukan Opname (koreksi stok fisik vs. sistem) agar data stok selalu akurat.

**Resep & HPP**
- US-6 (P1) Sebagai Owner, saya ingin membuat Resep yang mendefinisikan komposisi bahan baku per porsi agar HPP dihitung otomatis.
- US-7 (P1) Sebagai Owner, saya ingin membuat Varian Produk yang terhubung ke Resep agar margin dan profit per varian terlihat jelas.

**Pesanan & POS**
- US-8 (P1) Sebagai Staff, saya ingin membuat pesanan baru dengan memilih varian produk dan jumlah agar proses order tercatat.
- US-9 (P1) Sebagai Staff, saya ingin menandai pesanan sebagai "Lunas" agar status pembayaran terupdate dan transaksi keuangan tercatat otomatis.
- US-10 (P1) Sebagai Staff, saya ingin menggunakan tampilan POS (kasir) untuk transaksi langsung di toko.
- US-11 (P2) Sebagai Owner, saya ingin memfilter pesanan berdasarkan status dan rentang tanggal agar mudah memantau order yang tertunda.

**Keuangan**
- US-12 (P1) Sebagai Owner, saya ingin melihat ringkasan keuangan (pendapatan, pengeluaran, profit) hari ini dan bulan ini di satu halaman.
- US-13 (P1) Sebagai Owner, saya ingin mencatat transaksi keuangan manual (income/expense) yang tidak terkait pesanan.
- US-14 (P2) Sebagai Owner, saya ingin melihat laporan penjualan dan pengeluaran yang dapat difilter per periode.

**Supplier**
- US-15 (P2) Sebagai Owner, saya ingin melihat direktori supplier berdasarkan kategori produk agar mudah menemukan vendor yang tepat.
- US-16 (P2) Sebagai Owner, saya ingin menambahkan supplier baru ke direktori platform agar data vendor tersimpan terpusat.

**Event & Komunitas**
- US-17 (P2) Sebagai Tenant (semua role), saya ingin melihat daftar event bisnis yang relevan dengan tipe usaha saya agar tidak melewatkan peluang networking.
- US-18 (P2) Sebagai Owner/Supervisor/Staff, saya ingin mendaftar ke event melalui platform agar administrasi registrasi tersimpan.
- US-19 (P2) Sebagai Owner, saya ingin memposting topik diskusi di forum komunitas agar bisa berbagi pengalaman dengan sesama UMKM.
- US-20 (P3) Sebagai pengguna komunitas, saya ingin memberi Like dan membalas postingan agar diskusi lebih interaktif.

**Manajemen Tim & Subscription**
- US-21 (P1) Sebagai Owner, saya ingin mengundang anggota baru ke tenant saya dan menetapkan rolenya agar tim bisa bekerja sesuai fungsi.
- US-22 (P2) Sebagai Supervisor, saya ingin mengajukan request penambahan anggota agar Owner bisa menyetujui atau menolaknya.
- US-23 (P1) Sebagai Owner, saya ingin melihat status subscription aktif dan memilih upgrade plan agar batas produk/user bertambah.

**Pajak**
- US-24 (P2) Sebagai Owner, saya ingin mencatat laporan pajak secara manual (draft → submitted → paid) agar kewajiban perpajakan terpantau.
- US-25 (P2) Sebagai semua user, saya ingin mengakses halaman konsultasi pajak agar mendapat panduan terkait kewajiban pajak UMKM.

---

## SECTION 5 — Functional Requirements

Prioritas: P1 (wajib), P2 (penting), P3 (nice-to-have).

- **FR-1 (P1) Multi-Tenant SaaS**: Setiap bisnis terdaftar sebagai Tenant tersendiri dengan data yang sepenuhnya terisolasi. Platform Admin mengelola seluruh tenant dari panel admin terpisah.
- **FR-2 (P1) Autentikasi & RBAC**: Sistem login berbasis email/password dengan role hierarchy: `admin` (platform), `owner`, `supervisor`, `staff` (dalam tenant), menggunakan Spatie Laravel Permission.
- **FR-3 (P1) Manajemen Inventaris**: CRUD produk dengan kategori, SKU, harga beli/jual, stok minimum, dan gambar. Auto-kalkulasi `cost_price` dari `purchase_price / purchase_qty`.
- **FR-4 (P1) Manajemen Stok**: Fitur Stock In, Stock Out, Opname (koreksi stok fisik). Semua pergerakan stok disimpan di `StockMovement` dengan histori lengkap.
- **FR-5 (P1) Resep & BOM**: CRUD Resep yang mendefinisikan komposisi bahan baku. Perhitungan HPP otomatis. Varian Produk berelasi ke Resep untuk kalkulasi margin dan profit.
- **FR-6 (P1) Pesanan (Order)**: Buat pesanan multi-item (varian + paket), update status (pending → processing → done), tandai bayar, dan hapus pesanan. Nomor order auto-generate (`ORD-YYYYMMDD-XXXX`).
- **FR-7 (P1) POS (Point of Sale)**: Tampilan kasir khusus untuk transaksi langsung tanpa perlu melalui flow order panjang.
- **FR-8 (P1) Laporan Keuangan**: Overview harian & bulanan (pendapatan, pengeluaran, profit bersih). Grafik tren penjualan mingguan (7 hari). Laporan penjualan & pengeluaran terfilter.
- **FR-9 (P1) Manajemen Transaksi**: Pencatatan transaksi manual (income/expense) di luar alur pesanan, dengan kategori pengeluaran dan metode pembayaran.
- **FR-10 (P1) Subscription Plan**: Tiga tier plan (Free, Pro, Enterprise) dengan batas `max_products` dan `max_users`. Owner dapat melihat dan upgrade plan.
- **FR-11 (P1) Manajemen Member**: Owner mengundang dan mengelola anggota tim. Supervisor mengajukan `MemberRequest`. Owner menyetujui atau menolak request.
- **FR-12 (P2) Manajemen Supplier**: Direktori supplier dengan rating, kategori produk, dan informasi kontak. Dapat dikelola oleh Tenant dan Platform Admin.
- **FR-13 (P2) Manajemen Event**: Platform Admin membuat event dengan target `business_types`. Tenant mendaftar/membatalkan registrasi event. Kapasitas peserta terbatas.
- **FR-14 (P2) Community Forum**: Tenant dapat membuat post diskusi, membalas (reply bersarang), dan memberikan Like pada post sesama UMKM.
- **FR-15 (P2) Manajemen Pajak**: Pencatatan laporan pajak manual dengan status `draft / submitted / paid`. Halaman konsultasi pajak tersedia untuk semua role.
- **FR-16 (P2) Paket Produk (Bundle)**: Owner membuat paket bundling varian produk dengan harga khusus. Paket dapat dipilih saat membuat pesanan.
- **FR-17 (P2) Admin Panel**: Platform Admin mengelola Tenant (activate/deactivate, ganti plan), User, SubscriptionPlan, dan Event global dari panel terpisah (`/admin/*`).

---

## SECTION 6 — Non-Functional Requirements

- **NFR-1 (P1) Keamanan**: Autentikasi session-based Laravel, RBAC via Spatie Permission, UUID sebagai primary key (mencegah ID enumeration), CSRF protection bawaan Laravel.
- **NFR-2 (P1) Isolasi Data Tenant**: Semua query di controller tenant-scoped menggunakan `tenant_id` eksplisit. Middleware `EnsureTenantMiddleware` memvalidasi dan menginjeksi tenant context di setiap request.
- **NFR-3 (P1) Performa**: Halaman Inertia tidak memerlukan round-trip API tambahan (data dikirim sebagai props). Query relasi menggunakan eager loading untuk mencegah N+1.
- **NFR-4 (P1) Ketersediaan Data**: Tenant diwajibkan memiliki status `is_active = true`. Jika tenant dinonaktifkan oleh Admin, seluruh user tenant mendapat response HTTP 403.
- **NFR-5 (P2) Subscription Enforcement**: Batas `max_products` dan `max_users` ditegakkan di level Controller sebelum operasi create, dengan error response yang informatif ke frontend.
- **NFR-6 (P2) Skalabilitas**: Arsitektur monorepo Laravel + Inertia memungkinkan deployment vertikal maupun horizontal. Queue `database` digunakan untuk task asinkron (email, dll.).
- **NFR-7 (P3) Type Safety Frontend**: Seluruh props yang dikonsumsi React didefinisikan dalam tipe TypeScript di `resources/js/types/mrp.d.ts` untuk menghindari runtime error.

---

## SECTION 7 — Scope (In / Out)

**In Scope (v1.0 — Sudah Diimplementasikan)**
- Multi-tenant SaaS dengan isolasi data penuh per tenant.
- RBAC 4 role: admin (platform), owner, supervisor, staff.
- Inventaris: CRUD produk, kategori, stok (in/out/opname), riwayat stok.
- Resep & BOM: kalkulasi HPP, margin, profit per varian produk.
- Pesanan & POS: multi-item order, status pipeline, pembayaran.
- Paket Bundling produk dengan harga khusus.
- Keuangan: transaksi income/expense, laporan harian/bulanan, grafik tren.
- Supplier: direktori supplier dengan kategori dan rating.
- Event: dibuat admin, tenant dapat registrasi/batal.
- Community Forum: post, reply, like antar-tenant.
- Manajemen Member & `MemberRequest` workflow.
- Subscription plan bertingkat (Free / Pro / Enterprise).
- Laporan & konsultasi pajak.
- Admin panel platform (tenant, user, plan, event, supplier).

**Out of Scope (v1.0 — Rencana Selanjutnya)**
- Notifikasi real-time (WebSocket / Pusher) untuk update stok dan pesanan baru.
- Integrasi payment gateway (Midtrans, Xendit) untuk upgrade subscription otomatis.
- Fitur ekspor laporan ke PDF/Excel.
- API publik untuk integrasi pihak ketiga (marketplace, akuntansi).
- Fitur AI/LLM untuk analitik prediktif stok atau rekomendasi harga jual.
- Multi-bahasa (i18n) dan multi-mata uang.

---

## Appendix — Subscription Plan Details

| Fitur | Free | Pro (Rp 149.000/bln) | Enterprise (Rp 499.000/bln) |
|---|:---:|:---:|:---:|
| Max Produk | 100 | 1.000 | Unlimited |
| Max User | 1 | 5 | Unlimited |
| Inventaris & Stok | ✓ | ✓ | ✓ |
| Laporan Keuangan (Harian/Bulanan) | ✓ | ✓ | ✓ |
| Event (lihat) | ✓ | ✓ | ✓ |
| Event (registrasi) | — | ✓ | ✓ |
| Community (baca & join) | ✓ | ✓ | ✓ |
| Community (post) | — | ✓ | ✓ |
| Laporan Pajak & Konsultasi | — | ✓ | ✓ |
| Multi User | — | ✓ | ✓ |
| Export PDF | — | ✓ | ✓ |
| Tambah Supplier | — | — | ✓ |
| Akses API | — | — | ✓ |
| Dedicated Support | — | — | ✓ |

**Referensi model data utama**: `Tenant`, `User`, `Product`, `ProductVariant`, `Recipe`, `StockMovement`, `Order`, `OrderItem`, `Transaction`, `Event`, `CommunityPost`, `MemberRequest`, `TaxReport`, `SubscriptionPlan`.
