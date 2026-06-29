'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DeleteConfirmDialog from '@/components/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Folder, Trash, Package } from 'lucide-react';
import { formatRupiah } from '@/lib/utils-mrp';
import { type Product } from '@/types/mrp';

const getStockBadge = (product: Product) => {
    const isOutOfStock = product.current_stock <= 0;
    const isLowStock = product.current_stock <= product.min_stock;

    if (isOutOfStock) {
        return (
            <Badge variant="destructive" className="bg-rose-150 text-rose-700 hover:bg-rose-150/80">
                Habis ({product.current_stock} {product.unit})
            </Badge>
        );
    }

    if (isLowStock) {
        return (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                Menipis ({product.current_stock} {product.unit})
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            Aman ({product.current_stock} {product.unit})
        </Badge>
    );
};

function ProductActions({ product }: { product: Product }) {
    const handleDelete = () => {
        router.delete(`/inventory/${product.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center justify-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/inventory/${product.id}/edit`}>
                            <Edit className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit Produk</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DeleteConfirmDialog
                            trigger={
                                <Button variant="link" size="icon" className="size-8 text-red-500 hover:cursor-pointer">
                                    <Trash size={16} />
                                    <span className="sr-only">Hapus Produk</span>
                                </Button>
                            }
                            title="Apakah Anda yakin ingin menghapus produk ini?"
                            itemName={product.name}
                            onConfirm={handleDelete}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hapus Produk</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export const columns: ColumnDef<Product>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Produk" />,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                        <Package size={16} />
                    </div>
                    <div>
                        <div className="font-medium text-sm text-foreground">{row.original.name}</div>
                        {row.original.sku && <div className="text-muted-foreground font-mono text-xs">{row.original.sku}</div>}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'category',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kategori" />,
        cell: ({ row }) => {
            return (
                <span className="text-muted-foreground text-sm">
                    {row.original.category?.name || '—'}
                </span>
            );
        },
    },
    {
        accessorKey: 'purchase_price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Beli Kemasan" />,
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="text-right">
                    <div className="font-medium">{formatRupiah(product.purchase_price)}</div>
                    <div className="text-[11px] text-muted-foreground">
                        per {parseFloat(String(product.purchase_qty))} {product.unit}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'sell_price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Jual" />,
        cell: ({ row }) => {
            return <div className="text-right font-semibold text-slate-900 dark:text-slate-50">{formatRupiah(row.original.sell_price)}</div>;
        },
    },
    {
        accessorKey: 'current_stock',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stok" />,
        cell: ({ row }) => {
            return <div className="text-center">{getStockBadge(row.original)}</div>;
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => <ProductActions product={row.original} />,
    },
];
