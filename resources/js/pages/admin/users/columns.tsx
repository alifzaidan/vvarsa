'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, User as UserIcon, Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tenant {
    id: number;
    name: string;
}

export interface UserItem {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: { name: string }[];
    tenant?: Tenant | null;
}

export const getColumns = (
    onEdit: (user: UserItem) => void
): ColumnDef<UserItem>[] => [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama & Email" />,
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-foreground">{user.name}</div>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'tenant',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bisnis / Tenant" />,
        cell: ({ row }) => {
            const tenant = row.original.tenant;
            return tenant ? (
                <span className="text-sm font-medium text-foreground">{tenant.name}</span>
            ) : (
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
                    Platform Admin
                </Badge>
            );
        },
    },
    {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Peran (Role)" />,
        cell: ({ row }) => {
            const role = row.original.roles[0]?.name || 'staff';
            return (
                <Badge
                    variant={role === 'admin' ? 'destructive' : role === 'owner' ? 'default' : 'outline'}
                    className={`capitalize border-transparent ${
                        role === 'admin'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100'
                            : role === 'owner'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                    {role === 'admin' ? (
                        <span className="flex items-center gap-1">
                            <Shield size={12} />
                            Admin
                        </span>
                    ) : role === 'owner' ? (
                        <span className="flex items-center gap-1">
                            <Shield size={12} />
                            Owner
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <UserIcon size={12} />
                            Staff
                        </span>
                    )}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Bergabung" />,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Calendar size={14} className="opacity-60" />
                    <span>
                        {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        className="h-8 w-8 hover:bg-muted"
                        title="Edit Pengguna"
                    >
                        <Edit size={15} />
                    </Button>
                </div>
            );
        },
    },
];
