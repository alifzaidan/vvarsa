# Database Schema — Vvarsa

Tabel-tabel di bawah ini dibangun dengan pendekatan **SaaS multi-tenant** di mana setiap data bisnis terisolasi per `tenant_id`. Semua tabel utama menggunakan **UUID** sebagai primary key.

---

## DOMAIN: Platform & Autentikasi

### Tabel: `users`
Menyimpan data autentikasi seluruh user — baik Platform Admin maupun anggota tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Null on Delete, Nullable) — `null` jika Platform Admin
- **name** (String)
- **email** (String, Unique)
- **password** (String, Hashed)
- **email_verified_at** (Timestamp, Nullable)
- **is_active** (Boolean, Default: `true`)
- **remember_token** (String, Nullable)
- **Timestamps**

> Role dikelola oleh Spatie Laravel Permission (tabel `roles` / `model_has_roles`), bukan kolom `role` langsung di tabel ini.

---

### Tabel: `subscription_plans`
Mendefinisikan tier paket berlangganan yang tersedia di platform (Free, Pro, Enterprise).
- **id** (UUID, PK)
- **name** (String) — contoh: `Free`, `Pro`, `Enterprise`
- **slug** (String, Unique) — contoh: `free`, `pro`, `enterprise`
- **price** (Decimal 10,2, Default: `0`)
- **billing_cycle** (String, Default: `monthly`) — `monthly`, `yearly`
- **max_users** (Integer, Default: `1`)
- **max_products** (Integer, Default: `100`)
- **features** (JSON, Nullable) — array fitur yang diaktifkan
- **is_active** (Boolean, Default: `true`)
- **Timestamps**

---

### Tabel: `tenants`
Menyimpan data bisnis UMKM yang terdaftar di platform.
- **id** (UUID, PK)
- **name** (String)
- **slug** (String, Unique)
- **business_type** (String, Default: `general`) — `fnb`, `retail`, `fashion`, `general`, `service`
- **phone** (String, Nullable)
- **address** (String, Nullable)
- **logo** (String, Nullable)
- **plan_id** (UUID, FK → subscription_plans.id, Restrict on Delete)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**

---

### Tabel: `tenant_subscriptions`
Riwayat transaksi berlangganan setiap tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **plan_id** (UUID, FK → subscription_plans.id, Restrict on Delete)
- **status** (String, Default: `active`) — `active`, `expired`, `cancelled`, `trial`
- **starts_at** (Timestamp)
- **ends_at** (Timestamp, Nullable)
- **payment_ref** (String, Nullable)
- **amount_paid** (Decimal 10,2, Default: `0`)
- **Timestamps**

---

### Tabel: `password_reset_tokens`
Token reset password bawaan Laravel.
- **email** (String, PK)
- **token** (String)
- **created_at** (Timestamp, Nullable)

### Tabel: `sessions`
Sesi aktif pengguna bawaan Laravel.
- **id** (String, PK)
- **user_id** (UUID, Nullable, Indexed)
- **ip_address** (String 45, Nullable)
- **user_agent** (Text, Nullable)
- **payload** (LongText)
- **last_activity** (Integer, Indexed)

---

## DOMAIN: RBAC (Spatie Laravel Permission)

Tabel-tabel berikut dikelola otomatis oleh package **`spatie/laravel-permission`**.

### Tabel: `permissions`
- **id** (UUID, PK)
- **name** (String) — contoh: `inventory.products.manage`
- **guard_name** (String)
- **Timestamps**
- *Unique: [`name`, `guard_name`]*

### Tabel: `roles`
- **id** (UUID, PK)
- **name** (String) — `admin`, `owner`, `supervisor`, `staff`
- **guard_name** (String)
- **Timestamps**
- *Unique: [`name`, `guard_name`]*

### Tabel: `model_has_permissions` *(Pivot)*
Menghubungkan permission ke model (User) secara langsung.
- **permission_id** (UUID, FK → permissions.id, Cascade Delete)
- **model_type** (String)
- **model_id** (UUID)

### Tabel: `model_has_roles` *(Pivot)*
Menghubungkan role ke user.
- **role_id** (UUID, FK → roles.id, Cascade Delete)
- **model_type** (String)
- **model_id** (UUID)

### Tabel: `role_has_permissions` *(Pivot)*
Menghubungkan permission ke role.
- **permission_id** (UUID, FK → permissions.id, Cascade Delete)
- **role_id** (UUID, FK → roles.id, Cascade Delete)

---

## DOMAIN: Inventaris

### Tabel: `product_categories`
Kategori produk bertingkat (hierarki) per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **name** (String)
- **parent_id** (UUID, FK → product_categories.id, Null on Delete, Nullable) — untuk sub-kategori
- **color** (String, Nullable)
- **Timestamps**

---

### Tabel: `products`
Master data bahan baku / produk inventaris per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **sku** (String, Nullable)
- **name** (String)
- **category_id** (UUID, FK → product_categories.id, Null on Delete, Nullable)
- **unit** (String, Default: `pcs`) — `pcs`, `kg`, `liter`, `box`, dll.
- **min_stock** (Integer, Default: `0`)
- **current_stock** (Integer, Default: `0`)
- **purchase_price** (Decimal 12,2, Default: `0`) — harga beli per kemasan
- **purchase_qty** (Decimal 12,2, Default: `1`) — isi/jumlah dalam kemasan
- **cost_price** (Decimal 12,2, Default: `0`) — harga beli per unit (auto: `purchase_price / purchase_qty`)
- **sell_price** (Decimal 12,2, Default: `0`) — harga jual
- **image** (String, Nullable)
- **description** (Text, Nullable)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**
- *Unique: [`tenant_id`, `sku`]*

---

### Tabel: `stock_movements`
Riwayat seluruh pergerakan stok (masuk, keluar, opname).
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **product_id** (UUID, FK → products.id, Cascade Delete)
- **type** (String) — `in`, `out`, `opname`
- **qty** (Integer) — jumlah pergerakan
- **qty_before** (Integer) — stok sebelum
- **qty_after** (Integer) — stok sesudah
- **unit_cost** (Decimal 12,2, Nullable) — harga per unit saat stock-in
- **reference** (String, Nullable) — nomor PO, invoice, dll.
- **note** (Text, Nullable)
- **user_id** (UUID, FK → users.id, Restrict on Delete) — user yang mencatat
- **movement_date** (Timestamp)
- **Timestamps**

---

## DOMAIN: Resep & Varian Produk

### Tabel: `recipes`
Master resep / Bill of Materials (BOM) per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **name** (String)
- **description** (Text, Nullable)
- **portion_qty** (Decimal 10,3, Default: `1.000`) — jumlah output porsi dari 1x batch resep
- **Timestamps**

---

### Tabel: `recipe_ingredients`
Komposisi bahan baku dalam sebuah resep.
- **id** (UUID, PK)
- **recipe_id** (UUID, FK → recipes.id, Cascade Delete)
- **ingredient_id** (UUID, FK → products.id, Null on Delete, Nullable) — produk inventaris sebagai bahan
- **ingredient_name** (String) — snapshot nama bahan (atau nama custom jika `ingredient_id` null)
- **qty** (Decimal 10,3) — jumlah bahan per 1x batch resep
- **unit** (String) — satuan bahan: `gr`, `ml`, `pcs`, dll.
- **ingredient_cost** (Decimal 12,2, Default: `0`) — HPP per unit bahan
- **Timestamps**

---

### Tabel: `product_variants`
Varian produk jual yang dapat dihubungkan ke Resep untuk kalkulasi HPP.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **recipe_id** (UUID, FK → recipes.id, Null on Delete, Nullable)
- **recipe_qty** (Decimal 10,3, Default: `1.000`) — multiplier/porsi yang digunakan per 1 unit varian
- **sku** (String, Nullable)
- **name** (String)
- **sell_price** (Decimal 12,2, Default: `0`) — harga jual ke pelanggan
- **description** (Text, Nullable)
- **image** (String, Nullable)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**
- *Unique: [`tenant_id`, `sku`]*

---

## DOMAIN: Pesanan (Order)

### Tabel: `orders`
Header pesanan pelanggan per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **order_number** (String, Unique) — format: `ORD-YYYYMMDD-XXXX`
- **customer_name** (String)
- **customer_phone** (String, Nullable)
- **status** (String, Default: `pending`) — `pending`, `processing`, `done`, `cancelled`
- **payment_status** (String, Default: `unpaid`) — `unpaid`, `paid`
- **payment_method** (String, Nullable) — `cash`, `transfer`, dll.
- **subtotal** (Decimal 14,2, Default: `0`)
- **discount** (Decimal 14,2, Default: `0`)
- **total** (Decimal 14,2, Default: `0`)
- **notes** (Text, Nullable)
- **transaction_id** (UUID, FK → transactions.id, Null on Delete, Nullable) — terhubung saat order dibayar
- **stock_deducted** (Boolean, Default: `false`) — apakah stok sudah dikurangi
- **user_id** (UUID, FK → users.id, Restrict on Delete) — staff yang membuat order
- **ordered_at** (Timestamp, Default: CURRENT_TIMESTAMP)
- **Timestamps**

---

### Tabel: `order_items`
Detail item dalam sebuah pesanan.
- **id** (UUID, PK)
- **order_id** (UUID, FK → orders.id, Cascade Delete)
- **variant_id** (UUID, FK → product_variants.id, Null on Delete, Nullable)
- **variant_name** (String) — snapshot nama varian
- **qty** (Integer)
- **unit_price** (Decimal 12,2) — harga jual per unit
- **unit_hpp** (Decimal 12,2, Default: `0`) — HPP per unit saat order dibuat
- **total** (Decimal 14,2) — `qty × unit_price`
- **paket_isi** (TinyInteger Unsigned, Nullable) — jumlah isi paket (1, 3, 6, dll.)
- **paket_harga** (Integer Unsigned, Nullable) — harga fix paket (bukan `unit_price × qty`)
- **Timestamps**

---

## DOMAIN: Paket Produk (Bundle)

### Tabel: `packages`
Definisi paket bundling produk dengan harga khusus per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **name** (String)
- **capacity** (Integer) — kuantitas per paket
- **price** (Decimal 14,2) — harga paket
- **is_active** (Boolean, Default: `true`)
- **description** (Text, Nullable)
- **Timestamps**

### Tabel: `package_variants` *(Pivot)*
Menghubungkan Paket ke Varian Produk.
- **id** (UUID, PK)
- **package_id** (UUID, FK → packages.id, Cascade Delete)
- **variant_id** (UUID, FK → product_variants.id, Cascade Delete)
- **Timestamps**

---

## DOMAIN: Keuangan

### Tabel: `expense_categories`
Kategori pengeluaran bisnis per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **name** (String)
- **type** (String, Default: `opex`) — `opex`, `capex`
- **color** (String, Nullable)
- **Timestamps**

---

### Tabel: `transactions`
Pencatatan transaksi keuangan (income / expense) per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **type** (String) — `income`, `expense`
- **category** (String, Nullable) — `sales`, `purchase`, `salary`, `rent`, dll.
- **expense_category_id** (UUID, FK → expense_categories.id, Null on Delete, Nullable)
- **amount** (Decimal 14,2)
- **description** (String, Nullable)
- **reference** (String, Nullable) — nomor invoice, dll.
- **date** (Date)
- **payment_method** (String, Default: `cash`) — `cash`, `transfer`, `credit`
- **user_id** (UUID, FK → users.id, Restrict on Delete)
- **Timestamps**

---

### Tabel: `sales`
Snapshot item yang terjual, terhubung ke transaksi.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **transaction_id** (UUID, FK → transactions.id, Cascade Delete)
- **product_id** (UUID, FK → products.id, Null on Delete, Nullable)
- **product_name** (String) — snapshot nama produk
- **qty** (Integer)
- **unit_price** (Decimal 12,2)
- **discount** (Decimal 12,2, Default: `0`)
- **total** (Decimal 14,2)
- **Timestamps**

---

### Tabel: `tax_reports`
Laporan pajak manual per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **period** (String) — contoh: `2024-Q1`, `2024-06`
- **tax_type** (String) — `PPh21`, `PPh23`, `PPN`, dll.
- **gross_amount** (Decimal 14,2, Default: `0`)
- **tax_amount** (Decimal 14,2, Default: `0`)
- **status** (String, Default: `draft`) — `draft`, `submitted`, `paid`
- **notes** (Text, Nullable)
- **due_date** (Date, Nullable)
- **submitted_at** (Date, Nullable)
- **user_id** (UUID, FK → users.id, Restrict on Delete)
- **Timestamps**

---

### Tabel: `payment_methods`
Metode pembayaran yang dikonfigurasi per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **name** (String) — contoh: `BCA`, `OVO`, `Tunai`
- **account_name** (String, Nullable)
- **account_number** (String, Nullable)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**

---

## DOMAIN: Supplier

### Tabel: `suppliers`
Direktori supplier — bisa bersifat global (platform) atau per tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Null on Delete, **Nullable**) — `null` = supplier global platform
- **name** (String)
- **contact_name** (String, Nullable)
- **phone** (String, Nullable)
- **email** (String, Nullable)
- **website** (String, Nullable)
- **address** (Text, Nullable)
- **city** (String, Nullable)
- **product_categories** (JSON, Nullable) — array kategori produk yang disuplai
- **business_type** (String, Nullable) — `fnb`, `retail`, dll.
- **rating** (Decimal 2,1, Default: `0`) — skala 0–5
- **review_count** (Integer, Default: `0`)
- **logo** (String, Nullable)
- **description** (Text, Nullable)
- **is_verified** (Boolean, Default: `false`)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**

---

## DOMAIN: Event

### Tabel: `events`
Event bisnis yang dibuat oleh Platform Admin, dapat difilter per tipe industri.
- **id** (UUID, PK)
- **title** (String)
- **organizer** (String)
- **business_types** (JSON, Nullable) — contoh: `["fnb", "retail"]`
- **location** (String)
- **city** (String, Nullable)
- **description** (Text, Nullable)
- **image** (String, Nullable)
- **start_date** (DateTime)
- **end_date** (DateTime)
- **max_participants** (Integer, Nullable) — `null` = unlimited
- **registered_count** (Integer, Default: `0`)
- **registration_fee** (Decimal 10,2, Default: `0`) — `0` = gratis
- **registration_url** (String, Nullable) — URL eksternal jika ada
- **allow_platform_registration** (Boolean, Default: `true`)
- **status** (String, Default: `upcoming`) — `upcoming`, `ongoing`, `completed`, `cancelled`
- **is_featured** (Boolean, Default: `false`)
- **Timestamps**

---

### Tabel: `event_registrations`
Registrasi tenant/user ke sebuah event.
- **id** (UUID, PK)
- **event_id** (UUID, FK → events.id, Cascade Delete)
- **user_id** (UUID, FK → users.id, Cascade Delete)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **status** (String, Default: `registered`) — `registered`, `confirmed`, `cancelled`, `attended`
- **notes** (Text, Nullable)
- **registered_at** (Timestamp)
- **Timestamps**
- *Unique: [`event_id`, `user_id`]* — 1 user hanya bisa mendaftar 1 kali per event

---

## DOMAIN: Komunitas

### Tabel: `community_posts`
Post diskusi di forum komunitas antar-tenant.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **user_id** (UUID, FK → users.id, Cascade Delete)
- **business_type** (String, Nullable) — filter per industri
- **title** (String)
- **content** (LongText)
- **category** (String, Default: `discussion`) — `discussion`, `question`, `tips`, `announcement`
- **image** (String, Nullable)
- **likes_count** (Integer, Default: `0`) — denormalized counter
- **replies_count** (Integer, Default: `0`) — denormalized counter
- **views_count** (Integer, Default: `0`) — denormalized counter
- **is_pinned** (Boolean, Default: `false`)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**

---

### Tabel: `community_post_likes` *(Pivot)*
Like pada post komunitas. Unique per user per post.
- **id** (UUID, PK)
- **post_id** (UUID, FK → community_posts.id, Cascade Delete)
- **user_id** (UUID, FK → users.id, Cascade Delete)
- **Timestamps**
- *Unique: [`post_id`, `user_id`]*

---

### Tabel: `community_replies`
Balasan (reply) pada post komunitas, mendukung nested reply.
- **id** (UUID, PK)
- **post_id** (UUID, FK → community_posts.id, Cascade Delete)
- **user_id** (UUID, FK → users.id, Cascade Delete)
- **parent_id** (UUID, FK → community_replies.id, Null on Delete, Nullable) — untuk nested reply
- **content** (Text)
- **likes_count** (Integer, Default: `0`)
- **is_active** (Boolean, Default: `true`)
- **Timestamps**

---

## DOMAIN: Manajemen Member

### Tabel: `member_requests`
Request penambahan anggota baru ke dalam tenant, diajukan oleh Supervisor dan disetujui oleh Owner.
- **id** (UUID, PK)
- **tenant_id** (UUID, FK → tenants.id, Cascade Delete)
- **requested_by** (UUID, FK → users.id, Cascade Delete) — user yang mengajukan (Supervisor)
- **name** (String) — nama calon anggota baru
- **email** (String)
- **password** (String, Hashed) — password sudah di-hash saat store
- **role** (String, Default: `staff`) — role yang diminta: `staff`, `owner`
- **status** (Enum: `pending`, `approved`, `rejected`, Default: `pending`)
- **reviewed_by** (UUID, FK → users.id, Null on Delete, Nullable) — Owner yang merespons
- **reviewed_at** (Timestamp, Nullable)
- **Timestamps**

---

## Ringkasan Relasi Antar Tabel

```
subscription_plans (1) ──── (N) tenants
subscription_plans (1) ──── (N) tenant_subscriptions
tenants            (1) ──── (N) users
tenants            (1) ──── (N) tenant_subscriptions

tenants            (1) ──── (N) product_categories
tenants            (1) ──── (N) products
product_categories (1) ──── (N) products
products           (1) ──── (N) stock_movements
products           (1) ──── (N) recipe_ingredients (as ingredient)

tenants            (1) ──── (N) recipes
recipes            (1) ──── (N) recipe_ingredients
recipes            (1) ──── (N) product_variants
product_variants   (N) ──── (N) packages     [via package_variants]
product_variants   (1) ──── (N) order_items

tenants            (1) ──── (N) orders
orders             (1) ──── (N) order_items
orders             (0/1) ── (1) transactions  [saat lunas]

tenants            (1) ──── (N) transactions
tenants            (1) ──── (N) expense_categories
transactions       (1) ──── (N) sales
tenants            (1) ──── (N) tax_reports
tenants            (1) ──── (N) payment_methods

tenants            (1) ──── (N) suppliers    [supplier global: tenant_id = null]

events             (1) ──── (N) event_registrations
users              (1) ──── (N) event_registrations

tenants            (1) ──── (N) community_posts
community_posts    (1) ──── (N) community_replies
community_posts    (1) ──── (N) community_post_likes
community_replies  (1) ──── (N) community_replies  [nested / self-referential]

tenants            (1) ──── (N) member_requests
users (RBAC)       (N) ──── (N) roles         [via model_has_roles]
roles              (N) ──── (N) permissions   [via role_has_permissions]
```
