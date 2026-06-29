import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant, type PaginatedData } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { Package, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { columns } from './columns';
import { DataTable } from './data-table';

interface PackageModel {
    id: number;
    name: string;
    capacity: number;
    price: string | number;
    is_active: boolean;
    description: string | null;
    variants?: ProductVariant[];
}

interface Props {
    packages: PaginatedData<PackageModel>;
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Paket Produk', href: '/packages' },
];

export default function PackagesIndex({ packages, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/packages', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Paket Produk" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Package className="text-indigo-500" size={26} />
                            Manajemen Paket Produk
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Konfigurasi paket isi mochi (kapasitas, harga bundle, dan batas varian)
                        </p>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5">
                        <Link href="/packages/create">
                            <PlusCircle size={16} />
                            Tambah Paket
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
                            placeholder="Cari paket..."
                            className="pl-9 h-9 rounded-xl text-sm"
                        />
                    </div>
                </form>

                {/* Data Table */}
                <DataTable columns={columns} data={packages.data} />

                {/* Pagination */}
                {packages.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {packages.links.map((link, i) => (
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
