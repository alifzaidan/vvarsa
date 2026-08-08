import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData, type Supplier } from '@/types/mrp';
import { Button } from '@/components/ui/button';
import { Plus, Search, MapPin, Phone, Edit, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Supplier', href: '/suppliers' }];

const BUSINESS_TYPE_LABELS: Record<string, string> = {
    fnb: 'Food & Beverage',
    retail: 'Retail / Toko',
    fashion: 'Fashion & Tekstil',
    services: 'Jasa / Services',
    general: 'Manufaktur / Umum',
};

interface Props {
    suppliers: PaginatedData<Supplier>;
    cities: string[];
    filters: { search?: string; city?: string };
    business_type: string; // Business type dari tenant
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className={star <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}>
                    ★
                </div>
            ))}
            <span className="text-muted-foreground ml-1 text-xs">{rating.toFixed(1)}</span>
        </div>
    );
}

export default function SuppliersIndex({ suppliers, cities, filters, business_type }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [city, setCity] = useState(filters.city || '');

    const applyFilter = () => {
        router.get('/suppliers', { search, city }, { preserveState: true, replace: true });
    };

    const businessTypeLabel = BUSINESS_TYPE_LABELS[business_type] ?? business_type;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekomendasi Supplier" />
            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* Header & Add Button */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Rekomendasi Supplier</h1>
                        <p className="text-muted-foreground text-sm">
                            Supplier untuk kategori bisnis:{' '}
                            <span className="font-semibold text-foreground">{businessTypeLabel}</span>
                        </p>
                    </div>
                    <Link href="/suppliers/create" className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/90">
                        <Plus size={16} /> Tambah Supplier
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-card border border-border rounded-2xl p-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <input className="border rounded-xl px-9 py-2 text-sm w-full" placeholder="Cari supplier..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilter()} />
                    </div>
                    <select className="border rounded-xl px-4 py-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)}>
                        <option value="">Semua Kota</option>
                        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Button onClick={() => applyFilter()}>Cari</Button>
                </div>

                {/* Grid Cards */}
                {suppliers.data.length === 0 ? (
                    <div className="text-center py-20 border rounded-2xl bg-card text-muted-foreground">Tidak ada data ditemukan.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suppliers.data.map((supplier) => (
                            <div key={supplier.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            {supplier.name}
                                            {supplier.is_verified && <CheckCircle size={14} className="text-blue-500" />}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">{supplier.business_type}</p>
                                    </div>
                                    <Link href={`/suppliers/${supplier.id}/edit`} className="p-2 hover:bg-muted rounded-lg"><Edit size={16} /></Link>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-2"><MapPin size={14} /> {supplier.city}</div>
                                    <div className="flex items-center gap-2"><Phone size={14} /> {supplier.phone}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginasi */}
                {suppliers.last_page > 1 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {suppliers.links.map((link, i) => (
                            <Button key={i} variant={link.active ? "default" : "outline"} disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })} className="h-8 px-3">
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}