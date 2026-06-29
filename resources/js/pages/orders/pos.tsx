import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant } from '@/types/mrp';
import { Head, router } from '@inertiajs/react';
import {
    ShoppingBag, Trash2, Plus, Minus, Check,
    Banknote, CreditCard, Smartphone, ShoppingCart
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesanan', href: '/orders' },
    { title: 'POS Kasir', href: '/pos' },
];

interface CartItem {
    variant_id: number;
    name: string;
    price: number;
    hpp: number;
    qty: number;
}

interface Props {
    variants: (ProductVariant & { hpp: number; margin: number; profit: number })[];
}

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Tunai', icon: Banknote },
    { value: 'transfer', label: 'Transfer', icon: CreditCard },
    { value: 'qris', label: 'QRIS', icon: Smartphone },
];

export default function PosPage({ variants }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [successOrder, setSuccessOrder] = useState<string | null>(null);

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalHpp = cart.reduce((sum, i) => sum + i.hpp * i.qty, 0);
    const change = cashReceived - subtotal;

    const addToCart = (variant: typeof variants[number]) => {
        setCart((prev) => {
            const idx = prev.findIndex(c => c.variant_id === variant.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx].qty++;
                return updated;
            }
            return [...prev, {
                variant_id: variant.id,
                name: variant.name,
                price: Number(variant.sell_price),
                hpp: variant.hpp ?? 0,
                qty: 1,
            }];
        });
    };

    const updateQty = (idx: number, delta: number) => {
        setCart((prev) => {
            const updated = [...prev];
            updated[idx].qty += delta;
            if (updated[idx].qty <= 0) return updated.filter((_, i) => i !== idx);
            return updated;
        });
    };

    const removeItem = (idx: number) => {
        setCart((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setCashReceived(0);
        setSuccessOrder(null);
    };

    const handleCheckout = () => {
        if (!customerName.trim() || cart.length === 0) return;
        setProcessing(true);

        router.post('/orders', {
            customer_name: customerName,
            customer_phone: customerPhone,
            notes: notes,
            payment_method: paymentMethod,
            items: cart.map(c => ({ variant_id: c.variant_id, qty: c.qty })),
        }, {
            onSuccess: (page: any) => {
                setProcessing(false);
                const flash = (page.props as any).flash;
                setSuccessOrder(flash?.success ?? 'Pesanan berhasil dibuat!');
                setTimeout(() => {
                    clearCart();
                }, 3000);
            },
            onError: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="POS Kasir" />

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Left: Product Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingBag className="text-indigo-500" size={22} />
                            POS Kasir
                        </h1>
                        <p className="text-sm text-muted-foreground">Klik produk untuk menambah ke keranjang</p>
                    </div>

                    {variants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                            <ShoppingBag size={40} className="mb-3 opacity-30" />
                            <p>Belum ada varian produk aktif.</p>
                            <Button asChild variant="outline" className="mt-4 rounded-xl">
                                <a href="/variants/create">+ Tambah Varian</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {variants.map((v) => {
                                const inCart = cart.find(c => c.variant_id === v.id);
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => addToCart(v)}
                                        className={`relative group text-left rounded-2xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                                            inCart
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 shadow-sm'
                                                : 'bg-card border-border hover:border-indigo-200'
                                        }`}
                                    >
                                        {inCart && (
                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                {inCart.qty}
                                            </div>
                                        )}
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-3">
                                            <ShoppingBag size={18} className="text-indigo-500" />
                                        </div>
                                        <div className="font-medium text-sm leading-tight mb-1">{v.name}</div>
                                        <div className="text-indigo-600 font-bold text-sm">{formatRupiah(v.sell_price)}</div>
                                        {(v.margin ?? 0) > 0 && (
                                            <div className="text-xs text-muted-foreground mt-0.5">margin {v.margin?.toFixed(0)}%</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Cart & Checkout */}
                <div className="w-80 lg:w-96 border-l border-border flex flex-col bg-card">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <ShoppingCart size={16} />
                            Keranjang
                            {cart.length > 0 && (
                                <span className="bg-indigo-600 text-white text-xs rounded-full px-1.5 py-0.5">{cart.reduce((s, c) => s + c.qty, 0)}</span>
                            )}
                        </h2>
                        {cart.length > 0 && (
                            <button onClick={clearCart} className="text-xs text-rose-400 hover:text-rose-600">Kosongkan</button>
                        )}
                    </div>

                    {/* Success Banner */}
                    {successOrder && (
                        <div className="m-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                            <Check size={15} className="shrink-0 mt-0.5" />
                            {successOrder}
                        </div>
                    )}

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {cart.length === 0 && !successOrder && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm">
                                <ShoppingCart size={28} className="mb-2 opacity-30" />
                                Keranjang kosong.<br />Klik produk untuk menambah.
                            </div>
                        )}
                        {cart.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-background rounded-xl p-3 border border-border">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{formatRupiah(item.price)}/pcs</div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => updateQty(i, -1)} className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold">
                                        <Minus size={11} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                                    <button onClick={() => updateQty(i, 1)} className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold">
                                        <Plus size={11} />
                                    </button>
                                </div>
                                <div className="text-right shrink-0 min-w-[60px]">
                                    <div className="font-semibold text-xs">{formatRupiah(item.price * item.qty)}</div>
                                </div>
                                <button onClick={() => removeItem(i)} className="text-rose-400 hover:text-rose-600 shrink-0">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Customer & Payment */}
                    {cart.length > 0 && (
                        <div className="border-t border-border p-4 space-y-4">
                            {/* Customer */}
                            <div className="space-y-2">
                                <Input
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Nama pelanggan *"
                                    className="h-9 text-sm rounded-xl"
                                />
                                <Input
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="No. HP (opsional)"
                                    className="h-9 text-sm rounded-xl"
                                />
                                <Input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Catatan (opsional)"
                                    className="h-9 text-sm rounded-xl"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5">Metode Pembayaran</Label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setPaymentMethod(value)}
                                            className={`flex flex-col items-center gap-1 rounded-xl p-2 border text-xs font-medium transition-all ${
                                                paymentMethod === value
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-muted hover:bg-muted/80 border-border'
                                            }`}
                                        >
                                            <Icon size={15} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cash Received (for cash payment) */}
                            {paymentMethod === 'cash' && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Uang Diterima (Rp)</Label>
                                    <Input
                                        type="text"
                                        value={cashReceived > 0 ? formatRupiah(cashReceived) : ''}
                                        onChange={(e) => setCashReceived(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                                        placeholder={`Min: ${formatRupiah(subtotal)}`}
                                        className="h-9 text-sm rounded-xl"
                                    />
                                    {cashReceived >= subtotal && (
                                        <div className="text-sm font-semibold text-emerald-600">
                                            Kembalian: {formatRupiah(change)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Total */}
                            <div className="bg-muted/50 rounded-xl p-3 space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal ({cart.reduce((s, c) => s + c.qty, 0)} item)</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span className="text-indigo-600">{formatRupiah(subtotal)}</span>
                                </div>
                                {totalHpp > 0 && (
                                    <div className="flex justify-between text-xs text-emerald-600 pt-0.5">
                                        <span>Est. Untung</span>
                                        <span>+{formatRupiah(subtotal - totalHpp)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Checkout Button */}
                            <Button
                                onClick={handleCheckout}
                                disabled={processing || !customerName.trim()}
                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm"
                            >
                                {processing ? 'Memproses...' : `Buat Pesanan — ${formatRupiah(subtotal)}`}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
