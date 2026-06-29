'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DeleteConfirmDialog from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, Package } from 'lucide-react';
import { formatRupiah } from '@/lib/utils-mrp';
import { Badge } from '@/components/ui/badge';
import { type ProductVariant } from '@/types/mrp';

interface PackageModel {
    id: number;
    name: string;
    capacity: number;
    price: string | number;
    is_active: boolean;
    description: string | null;
    variants?: ProductVariant[];
}

function PackageActions({ pkg }: { pkg: PackageModel }) {
    const handleDelete = () => {
        router.delete(`/packages/${pkg.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center justify-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/packages/${pkg.id}/edit`}>
                            <Edit className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit Paket</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DeleteConfirmDialog
                            trigger={
                                <Button variant="link" size="icon" className="size-8 text-red-500 hover:cursor-pointer">
                                    <Trash className="size-4" />
                                    <span className="sr-only">Hapus Paket</span>
                                </Button>
                            }
                            title="Apakah Anda yakin ingin menghapus paket produk ini?"
                            itemName={pkg.name}
                            onConfirm={handleDelete}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hapus Paket</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export const columns: ColumnDef<PackageModel>[] = [
    {
        accessorKey: 'no',
        header: 'No',
        cell: ({ row }) => {
            const index = row.index + 1;
            return <div className="font-medium">{index}</div>;
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Paket" />,
        cell: ({ row }) => {
            const pkg = row.original;
            return (
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 p-1.5 rounded-lg text-indigo-500">
                        <Package size={16} />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{pkg.name}</div>
                        {pkg.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{pkg.description}</div>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'capacity',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kapasitas (Isi)" />,
        cell: ({ row }) => {
            return (
                <div className="font-semibold">
                    {row.original.capacity} Pcs
                </div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Bundle" />,
        cell: ({ row }) => {
            return (
                <div className="text-indigo-600 font-bold">
                    {formatRupiah(Number(row.original.price))}
                </div>
            );
        },
    },
    {
        accessorKey: 'variants',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Batasan Rasa" />,
        cell: ({ row }) => {
            const pkg = row.original;
            return !pkg.variants || pkg.variants.length === 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Bebas Mix
                </span>
            ) : (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {pkg.variants.map((v) => (
                        <span
                            key={v.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                        >
                            {v.name.replace('Mochi ', '')}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const active = row.original.is_active;
            return (
                <div className="text-center">
                    <Badge variant={active ? 'default' : 'secondary'} className="text-xs">
                        {active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => <PackageActions pkg={row.original} />,
    },
];
