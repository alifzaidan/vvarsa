import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData, type Recipe } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { columns } from './columns';
import { DataTable } from './data-table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resep (BOM)', href: '/recipes' },
];

interface Props {
    recipes: PaginatedData<Recipe>;
    filters: { search?: string };
}

export default function RecipesIndex({ recipes, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/recipes', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resep / Bill of Materials (BOM)" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="text-violet-500" size={26} />
                            Resep / Bill of Materials (BOM)
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Formulasi bahan baku dan kalkulasi HPP dasar
                        </p>
                    </div>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5">
                        <Link href="/recipes/create">
                            <PlusCircle size={16} />
                            Tambah Resep
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
                            placeholder="Cari resep..."
                            className="pl-9 h-9 rounded-xl"
                        />
                    </div>
                    <Button type="submit" variant="outline" className="rounded-xl h-9">
                        Cari
                    </Button>
                </form>

                {/* Table */}
                <div className="w-full">
                    {recipes.data.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
                            <BookOpen size={40} className="text-muted-foreground mb-3 opacity-40 mx-auto" />
                            <p className="font-medium text-muted-foreground">Belum ada resep</p>
                            <p className="text-sm text-muted-foreground mt-1">Mulai tambahkan resep formula seperti "Resep Mochi Strawberry"</p>
                            <Button asChild className="mt-4 rounded-xl" variant="outline">
                                <Link href="/recipes/create">+ Tambah Resep Pertama</Link>
                            </Button>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={recipes.data} />
                    )}
                </div>

                {/* Pagination */}
                {recipes.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {recipes.links.map((link, i) => (
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
