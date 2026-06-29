import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData, type Supplier } from '@/types/mrp';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, ExternalLink, MapPin, Phone, Search, Star } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supplier', href: '/suppliers' },
];

interface Props {
    suppliers: PaginatedData<Supplier>;
    cities: string[];
    filters: { search?: string; business_type?: string; city?: string };
    business_type: string;
}

const BUSINESS_TYPES = [
    { value: '', label: 'Semua' },
    { value: 'fnb', label: 'FnB' },
    { value: 'retail', label: 'Retail' },
    { value: 'fashion', label: 'Fashion' },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={12}
                    className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                />
            ))}
            <span className="text-muted-foreground ml-1 text-xs">{rating.toFixed(1)}</span>
        </div>
    );
}

export default function SuppliersIndex({ suppliers, cities, filters, business_type }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [city, setCity] = useState(filters.city || '');
    const [bType, setBType] = useState(filters.business_type || business_type || '');

    const applyFilter = () => {
        router.get('/suppliers', { search, city, business_type: bType }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekomendasi Supplier" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rekomendasi Supplier</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Temukan supplier terpercaya sesuai kebutuhan bisnis Anda
                    </p>
                </div>

                {/* Business type filter */}
                <div className="flex gap-2">
                    {BUSINESS_TYPES.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => { setBType(t.value); router.get('/suppliers', { search, city, business_type: t.value }, { preserveState: true, replace: true }); }}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${bType === t.value ? 'bg-primary text-primary-foreground' : 'border-border border hover:bg-muted'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Search & city filter */}
                <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama supplier atau produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                            className="border-border bg-background w-full rounded-xl border py-2 pr-4 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="border-border bg-background rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Kota</option>
                        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={applyFilter}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                    >
                        Cari
                    </button>
                </div>

                {/* Supplier Cards */}
                {suppliers.data.length === 0 ? (
                    <div className="bg-card border-border rounded-2xl border py-16 text-center">
                        <p className="text-muted-foreground text-sm">Tidak ada supplier ditemukan.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {suppliers.data.map((supplier) => (
                            <div key={supplier.id} className="bg-card border-border flex flex-col rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md">
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="truncate font-semibold">{supplier.name}</h3>
                                            {supplier.is_verified && (
                                                <span title="Terverifikasi" className="inline-flex shrink-0">
                                                    <CheckCircle size={14} className="text-blue-500" />
                                                </span>
                                            )}
                                        </div>
                                        <StarRating rating={supplier.rating} />
                                    </div>
                                    <span className="text-muted-foreground shrink-0 text-xs">{supplier.review_count} ulasan</span>
                                </div>

                                {supplier.description && (
                                    <p className="text-muted-foreground mb-3 text-sm line-clamp-2">{supplier.description}</p>
                                )}

                                {supplier.product_categories && supplier.product_categories.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {supplier.product_categories.slice(0, 3).map((cat) => (
                                            <span key={cat} className="bg-muted rounded-full px-2 py-0.5 text-xs">{cat}</span>
                                        ))}
                                        {supplier.product_categories.length > 3 && (
                                            <span className="text-muted-foreground rounded-full px-2 py-0.5 text-xs">+{supplier.product_categories.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto space-y-1.5 border-t pt-3">
                                    {supplier.city && (
                                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                            <MapPin size={11} />
                                            <span>{supplier.city}</span>
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                            <Phone size={11} />
                                            <a href={`tel:${supplier.phone}`} className="hover:text-primary">{supplier.phone}</a>
                                        </div>
                                    )}
                                    {supplier.website && (
                                        <a
                                            href={supplier.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary mt-2 flex items-center gap-1 text-xs hover:underline"
                                        >
                                            <ExternalLink size={11} />
                                            Kunjungi Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
