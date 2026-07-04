'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DeleteConfirmDialog from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, CheckCircle2 } from 'lucide-react';

// Kita pindahkan interface kesini agar bisa di-import oleh index.tsx
export interface Supplier {
    id: string;
    name: string;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    business_type: string | null;
    rating: number;
    is_verified: boolean;
    is_active: boolean;
    website: string | null;
    city: string | null;
    address: string | null;
    description: string | null;
}

function SupplierActions({ supplier }: { supplier: Supplier }) {
    const handleDelete = () => {
        // Sesuaikan route delete dengan yang ada di web.php (jika sudah ada)
        router.delete(`/admin/supplier/${supplier.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center justify-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/supplier/${supplier.id}/edit`}>
                            <Edit className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit Supplier</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DeleteConfirmDialog
                            trigger={
                                <Button variant="link" size="icon" className="size-8 text-red-500 hover:cursor-pointer">
                                    <Trash className="size-4" />
                                    <span className="sr-only">Hapus Supplier</span>
                                </Button>
                            }
                            title="Apakah Anda yakin ingin menghapus supplier ini?"
                            itemName={supplier.name}
                            onConfirm={handleDelete}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hapus Supplier</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export const columns: ColumnDef<Supplier>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Supplier" />,
        cell: ({ row }) => {
            const supplier = row.original;
            return (
                <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{supplier.name}</div>
                    {supplier.is_verified && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CheckCircle2 className="size-4 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Supplier Terverifikasi</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'contact_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kontak" />,
        cell: ({ row }) => {
            const supplier = row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{supplier.contact_name || '-'}</span>
                    <span className="text-xs text-muted-foreground">{supplier.phone || supplier.email || ''}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'business_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tipe Bisnis" />,
        cell: ({ row }) => {
            return (
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                    {row.original.business_type || 'Umum'}
                </span>
            );
        },
    },
    {
        accessorKey: 'rating',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
        cell: ({ row }) => {
            return (
                <div className="text-center">
                    <span className="font-semibold text-amber-500">{row.original.rating}</span>
                    <span className="text-xs text-muted-foreground"> / 5</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const isActive = row.original.is_active;
            return (
                <div className="text-center">
                    {isActive ? (
                        <span className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full">
                            Aktif
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400 rounded-full">
                            Nonaktif
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => <SupplierActions supplier={row.original} />,
    },
];