'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DeleteConfirmDialog from '@/components/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, Package, ToggleLeft, ToggleRight } from 'lucide-react';
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

function ProductActions({
    product,
    onToggleActive,
}: {
    product: Product;
    onToggleActive: (product: Product) => void;
}) {
    const handleDelete = () => {
        router.delete(`/inventory/${product.id}`, { preserveScroll: true });
    };

    return (
        <div className="flex items-center justify-center gap-1">
            {/* Edit */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/inventory/${product.id}/edit`}>
                            <Edit className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit Produk</p></TooltipContent>
            </Tooltip>

            {/* Toggle Aktif / Nonaktif (SAMAKAN STYLE DENGAN TENANT) */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleActive(product)}
                        className={`h-8 w-8 hover:bg-muted ${product.is_active
                                ? 'text-rose-500'
                                : 'text-emerald-500'
                            }`}
                    >
                        {product.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </Button>
                </TooltipTrigger>

                <TooltipContent>
                    <p>{product.is_active ? 'Nonaktifkan' : 'Aktifkan'} Produk</p>
                </TooltipContent>
            </Tooltip>

            {/* Hapus */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DeleteConfirmDialog
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                >
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
                <TooltipContent><p>Hapus Produk</p></TooltipContent>
            </Tooltip>
        </div>
    );
}

export const columns = (
    onToggleActive: (product: Product) => void,
): ColumnDef<Product>[] => [
        {
            accessorKey: 'no',
            header: 'No',
            cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Produk" />,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${product.is_active ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>
                            <Package size={16} />
                        </div>
                        <div>
                            <div className={`font-medium text-sm ${product.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                                {product.name}
                            </div>
                            {product.sku && (
                                <div className="text-muted-foreground font-mono text-xs">{product.sku}</div>
                            )}
                        </div>
                        {!product.is_active && (
                            <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 ml-1">
                                Nonaktif
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Kategori" />,
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {row.original.category?.name || '—'}
                </span>
            ),
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
            cell: ({ row }) => (
                <div className="text-right font-semibold text-slate-900 dark:text-slate-50">
                    {formatRupiah(row.original.sell_price)}
                </div>
            ),
        },
        {
            accessorKey: 'current_stock',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Stok" />,
            cell: ({ row }) => (
                <div className="text-center">{getStockBadge(row.original)}</div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => (
                <ProductActions product={row.original} onToggleActive={onToggleActive} />
            ),
        },
    ];