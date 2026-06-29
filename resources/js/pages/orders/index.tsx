import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Order, type PaginatedData, type OrderSummaryItem } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList, PlusCircle, Search, ChevronDown, Check,
    ShoppingBag, Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah, formatDate } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesanan', href: '/orders' },
];

interface Props {
    orders: PaginatedData<Order>;
    summary: OrderSummaryItem[];
    filters: { status?: string; payment_status?: string; from?: string; to?: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending:    { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ShoppingBag },
    done:       { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    cancelled:  { label: 'Dibatalkan', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

export default function OrdersIndex({ orders, summary, filters }: Props) {
    const [search, setSearch] = useState('');

    const applyFilter = (key: string, value: string) => {
        router.get('/orders', { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    };

    const updateStatus = (order: Order, status: string) => {
        router.patch(`/orders/${order.id}/status`, { status });
    };

    const cancelOrder = (order: Order) => {
        if (!confirm(`Batalkan pesanan ${order.order_number}?`)) return;
        router.delete(`/orders/${order.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesanan" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ClipboardList className="text-indigo-500" size={26} />
                            Daftar Pesanan
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Kelola pesanan masuk & status pembayaran
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="rounded-xl gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                            <Link href="/pos"><ShoppingBag size={15} />POS Kasir</Link>
                        </Button>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5">
                            <Link href="/orders/create"><PlusCircle size={16} />Buat Pesanan</Link>
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                {summary.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={15} className="text-indigo-500" />
                            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                Ringkasan Produksi — Pesanan Aktif
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {summary.map((item) => (
                                <div key={item.variant_id ?? item.variant_name} className="flex items-center gap-2 bg-white dark:bg-indigo-900/40 rounded-xl px-3 py-2 shadow-sm border border-indigo-100 dark:border-indigo-800">
                                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-lg leading-none">{item.total_qty}×</span>
                                    <span className="text-sm text-foreground">{item.variant_name}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Total per varian dari semua pesanan pending & diproses yang belum selesai
                        </p>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter('status', v)}>
                        <SelectTrigger className="h-9 w-40 rounded-xl text-sm">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Diproses</SelectItem>
                            <SelectItem value="done">Selesai</SelectItem>
                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.payment_status ?? 'all'} onValueChange={(v) => applyFilter('payment_status', v)}>
                        <SelectTrigger className="h-9 w-44 rounded-xl text-sm">
                            <SelectValue placeholder="Semua Pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Pembayaran</SelectItem>
                            <SelectItem value="unpaid">Belum Dibayar</SelectItem>
                            <SelectItem value="paid">Lunas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {orders.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ClipboardList size={40} className="text-muted-foreground mb-3 opacity-40" />
                            <p className="font-medium text-muted-foreground">Belum ada pesanan</p>
                            <Button asChild className="mt-4 rounded-xl" variant="outline">
                                <Link href="/orders/create">+ Buat Pesanan Pertama</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pelanggan</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Bayar</th>
                                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {orders.data.map((order) => {
                                        const status = STATUS_LABELS[order.status];
                                        const StatusIcon = status?.icon;
                                        return (
                                            <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-mono text-xs font-medium text-indigo-600">{order.order_number}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {formatDate(order.ordered_at)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{order.customer_name}</div>
                                                    {order.customer_phone && (
                                                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(order.items ?? []).map((item, i) => (
                                                            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                                                {item.qty}× {item.variant_name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">
                                                    {formatRupiah(order.total)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {status && (
                                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                                                            {StatusIcon && <StatusIcon size={11} />}
                                                            {status.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {order.payment_status === 'paid' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            <Check size={11} />Lunas
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                            Belum Bayar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-1">
                                                        <Button variant="ghost" size="sm" asChild className="h-8 rounded-lg text-xs px-2.5">
                                                            <Link href={`/orders/${order.id}`}>Detail</Link>
                                                        </Button>
                                                        {order.status === 'cancelled' || order.status === 'done' ? null : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 rounded-lg text-xs px-2.5 text-rose-500 hover:bg-rose-50"
                                                                onClick={() => cancelOrder(order)}
                                                            >
                                                                Batalkan
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {orders.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-lg h-8 px-3 text-xs"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
