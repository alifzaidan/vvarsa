'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Clock, ShoppingBag, CheckCircle2, XCircle, Check } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils-mrp';
import { type Order } from '@/types/mrp';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending:    { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ShoppingBag },
    done:       { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    cancelled:  { label: 'Dibatalkan', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

export const columns = (
    updateStatus: (order: Order, status: string) => void,
    cancelOrder: (order: Order) => void,
    openPayModal?: (order: Order) => void
): ColumnDef<Order>[] => [
    {
        accessorKey: 'no',
        header: 'No',
        cell: ({ row }) => {
            const index = row.index + 1;
            return <div className="font-medium">{index}</div>;
        },
    },
    {
        accessorKey: 'order_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div>
                    <div className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{order.order_number}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.ordered_at)}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'customer_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pelanggan" />,
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div>
                    <div className="font-medium text-sm text-slate-800 dark:text-slate-100">{order.customer_name}</div>
                    {order.customer_phone && (
                        <div className="text-xs text-muted-foreground mt-0.5">{order.customer_phone}</div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'items',
        header: 'Item',
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {(order.items ?? []).map((item, i) => (
                        <span key={i} className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-medium text-slate-600 dark:text-slate-300">
                            {item.qty}× {item.variant_name}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'total',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
        cell: ({ row }) => {
            const order = row.original;
            return <div className="font-bold text-sm text-right">{formatRupiah(Number(order.total))}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const order = row.original;
            const status = STATUS_LABELS[order.status];
            const StatusIcon = status?.icon;
            return status ? (
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                    {StatusIcon && <StatusIcon size={11} />}
                    {status.label}
                </span>
            ) : null;
        },
    },
    {
        accessorKey: 'payment_status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bayar" />,
        cell: ({ row }) => {
            const order = row.original;
            return order.payment_status === 'paid' ? (
                <div className="flex flex-col items-center gap-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-105 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Check size={10} />Lunas
                    </span>
                    {order.payment_method && (
                        <span className="text-[10px] text-muted-foreground block max-w-[120px] truncate text-center font-medium">
                            {order.payment_method}
                        </span>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => openPayModal?.(order)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 transition-colors cursor-pointer border-none"
                >
                    Belum Bayar
                </button>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => {
            const order = row.original;
            const canCancel = order.payment_status === 'unpaid' && order.status !== 'cancelled';
            const canPay = order.payment_status === 'unpaid' && order.status !== 'cancelled';
            return (
                <div className="flex items-center justify-center gap-1.5">
                    <Button variant="ghost" size="sm" asChild className="h-8 rounded-lg text-xs px-2.5">
                        <Link href={`/orders/${order.id}`}>Detail</Link>
                    </Button>

                    {canPay && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPayModal?.(order)}
                            className="h-8 rounded-lg text-xs px-2.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                        >
                            Bayar
                        </Button>
                    )}

                    {order.status === 'pending' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(order, 'processing')}
                            className="h-8 rounded-lg text-xs px-2.5 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        >
                            Proses
                        </Button>
                    )}

                    {order.status === 'processing' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(order, 'done')}
                            className="h-8 rounded-lg text-xs px-2.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                        >
                            Selesai
                        </Button>
                    )}

                    {canCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelOrder(order)}
                            className="h-8 rounded-lg text-xs px-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                            Batalkan
                        </Button>
                    )}
                </div>
            );
        },
    },
];
