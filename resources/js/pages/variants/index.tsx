import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData, type ProductVariant } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Edit, FlaskConical, Package, PlusCircle, Search, Trash2
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Varian Produk', href: '/variants' },
];

interface Props {
    variants: PaginatedData<ProductVariant & { hpp: number; margin: number; profit: number }>;
    filters: { search?: string };
}

export default function VariantsIndex({ variants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/variants', { search }, { preserveState: true });
    };

    const handleDelete = (id: number, name: string) => {
        if (!confirm(`Nonaktifkan varian "${name}"?`)) return;
        router.delete(`/variants/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Varian Produk" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FlaskConical className="text-violet-500" size={26} />
                            Varian Produk
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Produk yang dijual beserta resep & kalkulasi HPP otomatis
                        </p>
                    </div>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5">
                        <Link href="/variants/create">
                            <PlusCircle size={16} />
                            Tambah Varian
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari varian..."
                            className="pl-9 h-9 rounded-xl"
                        />
                    </div>
                    <Button type="submit" variant="outline" className="rounded-xl h-9">
                        Cari
                    </Button>
                </form>

                {/* Table */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {variants.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FlaskConical size={40} className="text-muted-foreground mb-3 opacity-40" />
                            <p className="font-medium text-muted-foreground">Belum ada varian produk</p>
                            <p className="text-sm text-muted-foreground mt-1">Mulai tambahkan varian seperti "Mochi Strawberry Choco"</p>
                            <Button asChild className="mt-4 rounded-xl" variant="outline">
                                <Link href="/variants/create">+ Tambah Varian Pertama</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Varian</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resep</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">HPP</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Harga Jual</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Margin</th>
                                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {variants.data.map((variant) => (
                                        <tr key={variant.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{variant.name}</div>
                                                {variant.sku && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">SKU: {variant.sku}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {variant.recipe ? (
                                                    <div>
                                                        <div className="font-medium text-xs text-violet-600 dark:text-violet-400">
                                                            {variant.recipe.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            Porsi: x{variant.recipe_qty}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Tidak ada resep</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">
                                                {formatRupiah(variant.hpp ?? 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {formatRupiah(variant.sell_price)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`font-semibold text-sm ${
                                                    (variant.margin ?? 0) >= 20 ? 'text-emerald-600' :
                                                    (variant.margin ?? 0) >= 10 ? 'text-amber-600' : 'text-rose-600'
                                                }`}>
                                                    {(variant.margin ?? 0).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={variant.is_active ? 'default' : 'secondary'} className="text-xs">
                                                    {variant.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-1">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg">
                                                        <Link href={`/variants/${variant.id}/edit`}>
                                                            <Edit size={14} />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                        onClick={() => handleDelete(variant.id, variant.name)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {variants.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {variants.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-lg h-8 px-3 text-xs"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
