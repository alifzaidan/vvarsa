'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, User as UserIcon, Mail, Trash2 } from 'lucide-react';

export interface Member {
    id: number;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
}

export const getColumns = (
    authUserId: number,
    onUpdateRole: (memberId: number, currentRole: string) => void,
    onDeleteMember: (memberId: number, name: string) => void,
    isUpdateProcessing: boolean,
    isDeleteProcessing: boolean
): ColumnDef<Member>[] => [
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
            const member = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                        {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                            {member.name}
                            {member.id === authUserId && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                    Anda
                                </Badge>
                            )}
                        </div>
                        <span className="text-muted-foreground text-xs">{member.email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kontak" />,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Mail size={14} className="opacity-60" />
                    {row.original.email}
                </div>
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
                    variant={role === 'owner' ? 'default' : 'outline'}
                    className={`capitalize border-transparent ${
                        role === 'owner'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                    {role === 'owner' ? (
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
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => {
            const member = row.original;
            const role = member.roles[0]?.name || 'staff';

            return (
                <div className="flex items-center justify-center gap-2">
                    {member.id !== authUserId ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateRole(member.id, role)}
                                disabled={isUpdateProcessing}
                                className="text-xs hover:bg-muted"
                            >
                                Ubah Peran ({role === 'owner' ? 'Staff' : 'Owner'})
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteMember(member.id, member.name)}
                                disabled={isDeleteProcessing}
                                className="text-destructive hover:bg-destructive/10 h-8 w-8 hover:text-destructive hover:cursor-pointer"
                            >
                                <Trash2 size={15} />
                            </Button>
                        </>
                    ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                    )}
                </div>
            );
        },
    },
];
