'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, ToggleLeft, ToggleRight, Edit } from 'lucide-react';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    business_type: string;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    users_count: number;
    products_count: number;
    plan?: {
        id: number;
        name: string;
    };
}

export const getColumns = (
    onEdit: (tenant: Tenant) => void
): ColumnDef<Tenant>[] => [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tenant / Bisnis" />,
        cell: ({ row }) => {
            const tenant = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                        {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-foreground">{tenant.name}</div>
                        <span className="text-muted-foreground text-xs">{tenant.slug}.vvarsa.com</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'plan',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Paket" />,
        cell: ({ row }) => {
            return (
                <Badge variant="outline" className="capitalize">
                    {row.original.plan?.name || 'Free'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'products_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Produk" />,
        cell: ({ row }) => {
            return <div className="text-center font-medium">{row.original.products_count}</div>;
        },
    },
    {
        accessorKey: 'users_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pengguna" />,
        cell: ({ row }) => {
            return <div className="text-center font-medium">{row.original.users_count}</div>;
        },
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const tenant = row.original;
            return (
                <Badge
                    variant={tenant.is_active ? 'default' : 'destructive'}
                    className={
                        tenant.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100'
                    }
                >
                    {tenant.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => {
            const tenant = row.original;
            
            const handleToggleActive = () => {
                router.post(`/admin/tenants/${tenant.id}/toggle`, {}, {
                    preserveScroll: true,
                });
            };

            return (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(tenant)}
                        className="h-8 w-8 hover:bg-muted"
                        title="Edit Tenant"
                    >
                        <Edit size={15} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 hover:bg-muted"
                        title="Detail Tenant"
                    >
                        <Link href={`/admin/tenants/${tenant.id}`}>
                            <Eye size={15} />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleActive}
                        className={`h-8 w-8 hover:bg-muted ${
                            tenant.is_active ? 'text-rose-500' : 'text-emerald-500'
                        }`}
                        title={tenant.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                        {tenant.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </Button>
                </div>
            );
        },
    },
];
