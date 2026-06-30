import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Order, type PaginatedData, type OrderSummaryItem } from '@/types/mrp';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ClipboardList, PlusCircle, Search,
    ShoppingBag, AlertCircle, Banknote, CreditCard, Smartphone
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columns } from './columns';
import { DataTable } from './data-table';
import { formatRupiah } from '@/lib/utils-mrp';
import { goeyToast } from 'goey-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesanan', href: '/orders' },
];

interface PaymentMethod {
    id: number;
    name: string;
    account_name: string | null;
    account_number: string | null;
    is_active: boolean;
}

interface Props {
    orders: PaginatedData<Order>;
    summary: OrderSummaryItem[];
    filters: { status?: string; payment_status?: string; from?: string; to?: string };
    paymentMethods: PaymentMethod[];
}

export default function OrdersIndex({ orders, summary, filters, paymentMethods = [] }: Props) {
    const [showPayModal, setShowPayModal] = useState<Order | null>(null);

    const { data: payData, setData: setPayData, patch: patchPay, processing: payProcessing } = useForm({
        payment_method: '',
    });

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

    const openPayModal = (order: Order) => {
        const defaultPayment = paymentMethods.length > 0
            ? (paymentMethods[0].account_number ? `${paymentMethods[0].name} (${paymentMethods[0].account_number})` : paymentMethods[0].name)
            : 'Tunai (Cash)';

        setPayData('payment_method', defaultPayment);
        setShowPayModal(order);
    };

    const handleMarkPaid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showPayModal) return;
        patchPay(`/orders/${showPayModal.id}/pay`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowPayModal(null);
                goeyToast.success('Pesanan berhasil ditandai lunas!');
            }
        });
    };

    const tableColumns = columns(updateStatus, cancelOrder, openPayModal);

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
                {orders.data.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardList size={40} className="text-muted-foreground mb-3 opacity-40" />
                        <p className="font-medium text-muted-foreground">Belum ada pesanan</p>
                        <Button asChild className="mt-4 rounded-xl" variant="outline">
                            <Link href="/orders/create">+ Buat Pesanan Pertama</Link>
                        </Button>
                    </div>
                ) : (
                    <DataTable columns={tableColumns} data={orders.data} />
                )}

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

            {/* ── Modal Tandai Lunas ── */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm text-foreground">
                        <h2 className="text-lg font-bold mb-1">Tandai Pesanan Lunas</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Total: <span className="font-semibold text-foreground">{formatRupiah(Number(showPayModal.total))}</span>
                        </p>
                        <form onSubmit={handleMarkPaid} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Metode Pembayaran</label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {paymentMethods.length > 0 ? (
                                        paymentMethods.map((pm) => {
                                            const lowerName = pm.name.toLowerCase();
                                            const Icon = lowerName.includes('tunai') || lowerName.includes('cash')
                                                ? Banknote
                                                : (lowerName.includes('qris') || lowerName.includes('shopee') || lowerName.includes('gopay') || lowerName.includes('ovo') || lowerName.includes('wallet')
                                                    ? Smartphone
                                                    : CreditCard);

                                            const value = pm.account_number ? `${pm.name} (${pm.account_number})` : pm.name;

                                            return (
                                                <button
                                                    key={pm.id}
                                                    type="button"
                                                    onClick={() => setPayData('payment_method', value)}
                                                    className={`flex flex-col items-center justify-center text-center gap-1.5 p-2.5 border rounded-xl text-xs font-medium transition-all ${payData.payment_method === value
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-muted hover:bg-muted/80 border-border'
                                                        }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="line-clamp-1">{pm.name}</span>
                                                    {pm.account_number && (
                                                        <span className="text-[10px] opacity-80 block truncate max-w-full font-mono">
                                                            {pm.account_number}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        [
                                            { key: 'cash', label: 'Tunai', icon: Banknote },
                                            { key: 'transfer', label: 'Transfer', icon: CreditCard },
                                            { key: 'qris', label: 'QRIS', icon: Smartphone }
                                        ].map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <button
                                                    key={method.key}
                                                    type="button"
                                                    onClick={() => setPayData('payment_method', method.key)}
                                                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border text-xs font-medium transition-all ${payData.payment_method === method.key
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-muted hover:bg-muted/80 border-border'
                                                        }`}
                                                >
                                                    <Icon size={18} />
                                                    {method.label}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={() => setShowPayModal(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={payProcessing}
                                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {payProcessing ? 'Memproses...' : 'Konfirmasi Lunas'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
