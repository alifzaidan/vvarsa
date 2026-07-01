export interface Tenant {
    id: number;
    name: string;
    business_type: string;
    plan: {
        name: string;
        slug: string;
        features: string[];
    } | null;
    max_products: number;
    max_users: number;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_cycle: string;
    max_users: number;
    max_products: number;
    features: string[];
    is_active: boolean;
}

export interface Product {
    id: number;
    tenant_id: number;
    sku: string | null;
    name: string;
    category_id: number | null;
    category?: { id: number; name: string };
    unit: string;
    min_stock: number;
    current_stock: number;
    purchase_price: number;
    purchase_qty: number;
    cost_price: number;
    sell_price: number;
    image: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    parent_id: number | null;
}

export interface StockMovement {
    id: number;
    product_id: number;
    product?: { id: number; name: string; unit: string };
    type: 'in' | 'out' | 'opname';
    qty: number;
    qty_before: number;
    qty_after: number;
    unit_cost: number | null;
    reference: string | null;
    note: string | null;
    user?: { id: number; name: string };
    movement_date: string;
    created_at: string;
}

export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    category: string | null;
    description: string | null;
    reference: string | null;
    date: string;
    payment_method: string;
    user?: { id: number; name: string };
    expense_category?: { id: number; name: string };
}

export interface ExpenseCategory {
    id: number;
    name: string;
    type: 'opex' | 'capex';
}

export interface Event {
    id: number;
    title: string;
    organizer: string;
    business_types: string[];
    location: string;
    city: string;
    description: string | null;
    image: string | null;
    start_date: string;
    end_date: string;
    max_participants: number | null;
    registered_count: number;
    registration_fee: number;
    registration_url: string | null;
    allow_platform_registration: boolean;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    is_featured: boolean;
}

export interface Supplier {
    id: number;
    name: string;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    product_categories: string[];
    business_type: string | null;
    rating: number;
    review_count: number;
    logo: string | null;
    description: string | null;
    is_verified: boolean;
}

export interface CommunityPost {
    id: number;
    tenant_id: number;
    user_id: number;
    user?: { id: number; name: string };
    tenant?: { id: number; name: string };
    business_type: string | null;
    title: string;
    content: string;
    category: string;
    image: string | null;
    likes_count: number;
    replies_count: number;
    views_count: number;
    is_pinned: boolean;
    created_at: string;
}

export interface CommunityReply {
    id: number;
    post_id: number;
    user_id: number;
    user?: { id: number; name: string };
    parent_id: number | null;
    content: string;
    likes_count: number;
    created_at: string;
}

export interface TaxReport {
    id: number;
    period: string;
    tax_type: string;
    gross_amount: number;
    tax_amount: number;
    status: 'draft' | 'submitted' | 'paid';
    notes: string | null;
    due_date: string | null;
    submitted_at: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface InventoryFilters {
    search?: string;
    category?: string;
    low_stock?: string;
}

// ─── Resep & BOM ────────────────────────────────────────────────────────────

export interface RecipeIngredient {
    id: number;
    recipe_id: number;
    ingredient_id: number | null;
    ingredient_name: string;
    ingredient?: { id: number; name: string; unit: string; cost_price: number; current_stock: number };
    qty: number;
    unit: string;
    ingredient_cost: number;
}

export interface Recipe {
    id: number;
    tenant_id: number;
    name: string;
    description: string | null;
    portion_qty: number;
    ingredients?: RecipeIngredient[];
    total_cost?: number;
    hpp?: number;
    created_at?: string;
}

export interface VariantRecipe {
    id: number;
    variant_id: number;
    ingredient_id: number | null;
    ingredient_name: string;
    ingredient?: { id: number; name: string; unit: string; cost_price: number; current_stock: number };
    qty: number;
    unit: string;
    ingredient_cost: number;
    total_cost?: number;
}

export interface ProductVariant {
    id: number;
    tenant_id: number;
    recipe_id: number | null;
    recipe_qty: number;
    sku: string | null;
    name: string;
    sell_price: number;
    description: string | null;
    image: string | null;
    is_active: boolean;
    recipe?: Recipe;
    recipes?: VariantRecipe[];
    hpp?: number;
    margin?: number;
    profit?: number;
    created_at?: string;
}

// ─── Pesanan (Order) ─────────────────────────────────────────────────────────

export interface OrderItem {
    id: number;
    order_id: number;
    variant_id: number | null;
    variant?: ProductVariant;
    variant_name: string;
    qty: number;
    unit_price: number;
    unit_hpp: number;
    total: number;
    paket_isi: number | null;   // jumlah isi paket (1 / 3 / 6)
    paket_harga: number | null; // harga paket fix, bukan unit_price × qty
}

export interface Order {
    id: number;
    tenant_id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    status: 'pending' | 'processing' | 'done' | 'cancelled';
    payment_status: 'unpaid' | 'paid';
    payment_method: string | null;
    subtotal: number;
    discount: number;
    total: number;
    notes: string | null;
    transaction_id: number | null;
    transaction?: Transaction;
    items?: OrderItem[];
    ordered_at: string;
    created_at: string;
    user?: { id: number; name: string };
}

export interface OrderSummaryItem {
    variant_id: number;
    variant_name: string;
    total_qty: number;
}