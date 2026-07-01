import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type InventoryFilters, type PaginatedData, type Product, type ProductCategory } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Package, PackagePlus, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columns } from './columns';
import { DataTable } from './data-table';
import { goeyToast } from 'goey-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventori', href: '/inventory' },
    { title: 'Produk', href: '/inventory' },
];

interface Props {
    products: PaginatedData<Product>;
    categories: ProductCategory[];
    filters: InventoryFilters;
    low_stock_list: Product[];
    total_count: number;
    max_products: number;
}

export default function InventoryIndex({ products, categories, filters, low_stock_list, total_count, max_products }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');

    const applyFilter = () => {
        router.get('/inventory', {
            search,
            category: category === 'all' ? '' : category,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleToggleActive = (product: Product) => {
        const isActive = product.is_active;
        
        router.patch(`/inventory/${product.id}/toggle-active`, {}, {
            preserveScroll: true,
            onError: () => {
                goeyToast.error(`Gagal mengubah status produk "${product.name}"`);
            },
        });
    };

    const tableColumns = columns(handleToggleActive);

    const usagePercent = Math.round((total_count / max_products) * 100);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventori - Produk" />
            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Produk</h1>
                        <p className="text-muted-foreground text-sm">
                            {total_count} / {max_products} produk digunakan
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" asChild className="rounded-xl">
                            <Link href="/inventory/stock-in">Stok Masuk</Link>
                        </Button>
                        <Button asChild className="rounded-xl inline-flex items-center gap-2">
                            <Link href="/inventory/create">
                                <PackagePlus size={16} />
                                Tambah Produk
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Usage bar */}
                <div className="bg-card border-border rounded-2xl border p-4 shadow-sm">
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Kapasitas Produk (Paket Free)</span>
                        <span className="font-semibold text-foreground">{total_count}/{max_products}</span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                            className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    {usagePercent >= 90 && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-rose-500">
                            <AlertTriangle size={12} />
                            Mendekati batas produk.{' '}
                            <Link href="/subscription" className="underline">Upgrade paket</Link>{' '}
                            untuk menambah lebih banyak produk.
                        </p>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row items-center">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Cari nama produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                            className="pl-9 rounded-xl w-full"
                        />
                    </div>

                    <div className="w-full sm:w-48">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="rounded-xl w-full">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={applyFilter} className="rounded-xl w-full sm:w-auto px-6">
                        Filter
                    </Button>
                </div>

                {/* Products TanStack Table + Low Stock Panel */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        <DataTable columns={tableColumns} data={products.data} />

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="border-border flex items-center justify-between border-t bg-card px-4 py-3 rounded-xl border shadow-sm">
                                <p className="text-muted-foreground text-sm">
                                    Menampilkan {(products.current_page - 1) * products.per_page + 1}–{Math.min(products.current_page * products.per_page, products.total)} dari {products.total} produk
                                </p>
                                <div className="flex gap-1">
                                    {products.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className="h-8 px-3 rounded-lg text-xs"
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">Stok Menipis</h2>
                                <p className="text-muted-foreground text-xs">Produk yang perlu segera dibeli</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs">
                                <Link href="/inventory?low_stock=1">Lihat semua</Link>
                            </Button>
                        </div>

                        {low_stock_list.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package size={32} className="mb-2 text-emerald-500" />
                                <p className="text-muted-foreground text-sm">Semua stok aman</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {low_stock_list.map((product) => {
                                    const isEmpty = product.current_stock <= 0;

                                    return (
                                        <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    Batas {product.min_stock} {product.unit}
                                                </p>
                                            </div>
                                            <div className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${isEmpty ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                {product.current_stock} {product.unit}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}