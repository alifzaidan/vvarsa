'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DeleteConfirmDialog from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, FlaskConical } from 'lucide-react';
import { formatRupiah } from '@/lib/utils-mrp';
import { type ProductVariant } from '@/types/mrp';
import { Badge } from '@/components/ui/badge';

function VariantActions({ variant }: { variant: ProductVariant }) {
    const handleDelete = () => {
        router.delete(`/variants/${variant.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center justify-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/variants/${variant.id}/edit`}>
                            <Edit className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit Varian</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DeleteConfirmDialog
                            trigger={
                                <Button variant="link" size="icon" className="size-8 text-red-500 hover:cursor-pointer">
                                    <Trash className="size-4" />
                                    <span className="sr-only">Hapus Varian</span>
                                </Button>
                            }
                            title="Apakah Anda yakin ingin menonaktifkan/menghapus varian ini?"
                            itemName={variant.name}
                            onConfirm={handleDelete}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hapus Varian</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export const columns: ColumnDef<ProductVariant & { hpp: number; margin: number; profit: number }>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Varian" />,
        cell: ({ row }) => {
            const variant = row.original;
            return (
                <div className="flex items-center gap-2">
                    <div className="bg-violet-50 dark:bg-violet-950/40 p-1.5 rounded-lg text-violet-500">
                        <FlaskConical size={16} />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{variant.name}</div>
                        {variant.sku && (
                            <div className="text-xs text-muted-foreground mt-0.5">SKU: {variant.sku}</div>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'recipe',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Resep" />,
        cell: ({ row }) => {
            const variant = row.original;
            return variant.recipe ? (
                <div>
                    <div className="font-semibold text-xs text-violet-600 dark:text-violet-400">
                        {variant.recipe.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        Porsi: x{Number(variant.recipe_qty)}
                    </div>
                </div>
            ) : (
                <span className="text-xs text-muted-foreground italic">Tidak ada resep</span>
            );
        },
    },
    {
        accessorKey: 'hpp',
        header: ({ column }) => <DataTableColumnHeader column={column} title="HPP" />,
        cell: ({ row }) => {
            return (
                <div className="text-right text-muted-foreground font-medium">
                    {formatRupiah(row.original.hpp ?? 0)}
                </div>
            );
        },
    },
    {
        accessorKey: 'sell_price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Jual" />,
        cell: ({ row }) => {
            return (
                <div className="text-right font-bold">
                    {formatRupiah(row.original.sell_price)}
                </div>
            );
        },
    },
    {
        accessorKey: 'margin',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Margin" />,
        cell: ({ row }) => {
            const margin = row.original.margin ?? 0;
            return (
                <div className="text-right">
                    <span className={`font-semibold text-sm ${
                        margin >= 20 ? 'text-emerald-600' :
                        margin >= 10 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                        {margin.toFixed(1)}%
                    </span>
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
        cell: ({ row }) => <VariantActions variant={row.original} />,
    },
];
