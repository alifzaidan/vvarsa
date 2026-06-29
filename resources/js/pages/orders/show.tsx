import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Order } from '@/types/mrp';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, ClipboardList, Clock, ShoppingBag, CheckCircle2,
    XCircle, Check, CreditCard, Banknote, Smartphone
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah, formatDate } from '@/lib/utils-mrp';

interface Props {
    order: Order;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; next?: string; nextLabel?: string }> = {
    pending:    { label: 'Menunggu', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, next: 'processing', nextLabel: 'Mulai Proses' },
    processing: { label: 'Sedang Diproses', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ShoppingBag, next: 'done', nextLabel: 'Tandai Selesai' },
    done:       { label: 'Selesai', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    cancelled:  { label: 'Dibatalkan', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: XCircle },
};

const PAYMENT_ICONS: Record<string, React.ElementType> = {
    cash: Banknote,
    transfer: CreditCard,
    qris: Smartphone,
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: 'Tunai (Cash)',
    transfer: 'Transfer Bank',
    qris: 'QRIS',
};

export default function OrderShow({ order }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pesanan', href: '/orders' },
        { title: order.order_number, href: `/orders/${order.id}` },
    ];

    const [showPayModal, setShowPayModal] = useState(false);
    const { data, setData, patch, processing } = useForm({ payment_method: 'cash' });
    const statusConfig = STATUS_CONFIG[order.status];
    const StatusIcon = statusConfig?.icon;

    const handleAdvanceStatus = () => {
        if (!statusConfig?.next) return;
        router.patch(`/orders/${order.id}/status`, { status: statusConfig.next });
    };

    const handleMarkPaid = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/orders/${order.id}/pay`, {
            onSuccess: () => setShowPayModal(false),
        });
    };

    const handleCancel = () => {
        if (!confirm(`Batalkan pesanan ${order.order_number}?`)) return;
        router.delete(`/orders/${order.id}`, {
            onSuccess: () => router.visit('/orders'),
        });
    };

    const totalHpp = (order.items ?? []).reduce((sum, item) => sum + Number(item.unit_hpp) * item.qty, 0);
    const totalProfit = order.total - totalHpp;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pesanan ${order.order_number}`} />

            <div className="mx-auto max-w-2xl p-4 md:p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/orders"><ArrowLeft size={18} /></Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <ClipboardList className="text-indigo-500" size={20} />
                            {order.order_number}
                        </h1>
                        <p className="text-muted-foreground text-sm">{formatDate(order.ordered_at)}</p>
                    </div>
                </div>

                {/* Status Card */}
                <div className={`rounded-2xl p-4 border flex items-center justify-between ${statusConfig?.color}`}>
                    <div className="flex items-center gap-3">
                        {StatusIcon && <StatusIcon size={22} />}
                        <div>
                            <div className="font-semibold">{statusConfig?.label}</div>
                            <div className="text-xs opacity-70">
                                {order.payment_status === 'paid'
                                    ? `Lunas via ${PAYMENT_LABELS[order.payment_method ?? ''] ?? order.payment_method}`
                                    : 'Belum dibayar'}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {statusConfig?.next && order.payment_status === 'unpaid' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl text-xs h-8"
                                onClick={handleAdvanceStatus}
                            >
                                {statusConfig.nextLabel}
                            </Button>
                        )}
                        {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
                            <Button
                                size="sm"
                                className="rounded-xl text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setShowPayModal(true)}
                            >
                                <Check size={12} className="mr-1" />
                                Tandai Lunas
                            </Button>
                        )}
                        {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl text-xs h-8 text-rose-500 border-rose-200 hover:bg-rose-50"
                                onClick={handleCancel}
                            >
                                Batalkan
                            </Button>
                        )}
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-semibold mb-3">Pelanggan</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-xs text-muted-foreground">Nama</div>
                            <div className="font-medium mt-0.5">{order.customer_name}</div>
                        </div>
                        {order.customer_phone && (
                            <div>
                                <div className="text-xs text-muted-foreground">No. HP</div>
                                <div className="font-medium mt-0.5">{order.customer_phone}</div>
                            </div>
                        )}
                        {order.notes && (
                            <div className="col-span-2">
                                <div className="text-xs text-muted-foreground">Catatan</div>
                                <div className="mt-0.5 text-muted-foreground italic">"{order.notes}"</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-semibold mb-3">Item Pesanan</h2>
                    <div className="space-y-2">
                        {(order.items ?? []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div>
                                    <div className="font-medium text-sm">{item.variant_name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatRupiah(item.unit_price)} × {item.qty} pcs
                                        {item.unit_hpp > 0 && (
                                            <span className="ml-2 text-muted-foreground">· HPP: {formatRupiah(Number(item.unit_hpp) * item.qty)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-sm">{formatRupiah(item.total)}</div>
                                    {item.unit_hpp > 0 && (
                                        <div className="text-xs text-emerald-600">
                                            +{formatRupiah((item.unit_price - item.unit_hpp) * item.qty)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Summary */}
                    <div className="mt-4 pt-3 border-t border-border space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatRupiah(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Diskon</span>
                                <span className="text-rose-500">-{formatRupiah(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                            <span>Total</span>
                            <span>{formatRupiah(order.total)}</span>
                        </div>
                        {totalHpp > 0 && (
                            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>Estimasi HPP</span>
                                <span>{formatRupiah(totalHpp)}</span>
                            </div>
                        )}
                        {totalProfit > 0 && (
                            <div className="flex justify-between text-xs font-medium text-emerald-600">
                                <span>Estimasi Untung</span>
                                <span>{formatRupiah(totalProfit)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction link */}
                {order.transaction && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={16} />
                            <span>Transaksi income otomatis dibuat</span>
                        </div>
                        <Link href="/finance/transactions" className="text-xs text-emerald-700 underline">Lihat transaksi</Link>
                    </div>
                )}
            </div>

            {/* Mark Paid Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-1">Tandai Pesanan Lunas</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Total: <span className="font-semibold text-foreground">{formatRupiah(order.total)}</span>
                        </p>
                        <form onSubmit={handleMarkPaid} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Metode Pembayaran</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['cash', 'transfer', 'qris'] as const).map((method) => {
                                        const Icon = PAYMENT_ICONS[method];
                                        return (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setData('payment_method', method)}
                                                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border text-xs font-medium transition-all ${
                                                    data.payment_method === method
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-muted hover:bg-muted/80 border-border'
                                                }`}
                                            >
                                                <Icon size={18} />
                                                {PAYMENT_LABELS[method].split(' ')[0]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowPayModal(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {processing ? 'Memproses...' : 'Konfirmasi Lunas'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
