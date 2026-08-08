'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, User as UserIcon, Mail, Trash2, ShieldCheck } from 'lucide-react';

export interface Member {
    id: number;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
}

const ROLE_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    owner: {
        label: 'Owner',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100',
        icon: <Shield size={12} />,
    },
    supervisor: {
        label: 'Supervisor',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100',
        icon: <ShieldCheck size={12} />,
    },
    staff: {
        label: 'Staff',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
        icon: <UserIcon size={12} />,
    },
};

const ROLE_CYCLE: Record<string, string> = {
    owner: 'supervisor',
    supervisor: 'staff',
    staff: 'owner',
};

export const getColumns = (
    authUserId: number,
    authRole: string,
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
            const meta = ROLE_BADGE[role] ?? ROLE_BADGE.staff;
            return (
                <Badge
                    variant="outline"
                    className={`capitalize border-transparent ${meta.className}`}
                >
                    <span className="flex items-center gap-1">
                        {meta.icon}
                        {meta.label}
                    </span>
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
            const isOwnerViewer = authRole === 'owner';
            const nextRole = ROLE_CYCLE[role] ?? 'staff';
            const nextRoleMeta = ROLE_BADGE[nextRole];

            return (
                <div className="flex items-center justify-center gap-2">
                    {member.id !== authUserId ? (
                        isOwnerViewer ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onUpdateRole(member.id, role)}
                                    disabled={isUpdateProcessing}
                                    className="text-xs hover:bg-muted"
                                    title={`Ubah ke ${nextRoleMeta?.label ?? nextRole}`}
                                >
                                    → {nextRoleMeta?.label ?? nextRole}
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
                            <span className="text-muted-foreground text-xs">Hanya owner</span>
                        )
                    ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                    )}
                </div>
            );
        },
    },
];
