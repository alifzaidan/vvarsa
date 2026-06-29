import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant } from '@/types/mrp';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesanan', href: '/orders' },
    { title: 'Buat Pesanan', href: '/orders/create' },
];

interface CartItem {
    variant_id: number;
    variant_name: string;
    qty: number;
    unit_price: number;
    hpp: number;
}

interface Props {
    variants: (ProductVariant & { hpp: number; margin: number })[];
}

export default function OrderCreate({ variants }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        notes: '',
        items: [] as { variant_id: number; qty: number }[],
    });

    const [cart, setCart] = useState<CartItem[]>([]);
    const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.qty, 0);
    const totalHpp = cart.reduce((sum, item) => sum + item.hpp * item.qty, 0);

    const addToCart = (variantId: number) => {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) return;
        const existing = cart.findIndex(c => c.variant_id === variantId);
        if (existing >= 0) {
            const updated = [...cart];
            updated[existing].qty++;
            setCart(updated);
        } else {
            setCart([...cart, {
                variant_id: variant.id,
                variant_name: variant.name,
                qty: 1,
                unit_price: Number(variant.sell_price),
                hpp: variant.hpp ?? 0,
            }]);
        }
    };

    const updateQty = (index: number, qty: number) => {
        if (qty < 1) return;
        const updated = [...cart];
        updated[index].qty = qty;
        setCart(updated);
    };

    const removeItem = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    useEffect(() => {
        setData('items', cart.map(c => ({ variant_id: c.variant_id, qty: c.qty })));
    }, [cart]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pesanan" />

            <div className="mx-auto max-w-2xl p-4 md:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/orders"><ArrowLeft size={18} /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ClipboardList className="text-indigo-500" size={22} />
                            Buat Pesanan Baru
                        </h1>
                        <p className="text-muted-foreground text-sm">Catat pesanan masuk dari pelanggan</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Info Pelanggan */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold">Data Pelanggan</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                                <Label htmlFor="customer_name">Nama Pelanggan *</Label>
                                <Input
                                    id="customer_name"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    placeholder="cth: Budi Santoso"
                                    className={errors.customer_name ? 'border-rose-500' : ''}
                                    required
                                />
                                {errors.customer_name && <p className="text-xs text-rose-500">{errors.customer_name}</p>}
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                                <Label htmlFor="customer_phone">No. HP (opsional)</Label>
                                <Input
                                    id="customer_phone"
                                    type="tel"
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    placeholder="cth: 0812xxxx"
                                />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={2}
                                    placeholder="Catatan khusus pesanan (opsional)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pilih Item */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold">Pilih Item Pesanan *</h2>
                        {errors.items && <p className="text-xs text-rose-500">{errors.items as string}</p>}

                        {/* Quick add buttons */}
                        <div className="flex flex-wrap gap-2">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => addToCart(v.id)}
                                    className="group flex items-center gap-2 bg-muted hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-border hover:border-indigo-300 rounded-xl px-3 py-2 text-sm transition-all"
                                >
                                    <Plus size={12} className="text-muted-foreground group-hover:text-indigo-600" />
                                    <span className="font-medium">{v.name}</span>
                                    <span className="text-xs text-muted-foreground">{formatRupiah(v.sell_price)}</span>
                                </button>
                            ))}
                        </div>

                        {/* Cart */}
                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <ShoppingCart size={28} className="mx-auto mb-2 opacity-30" />
                                Klik item di atas untuk menambah ke pesanan
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.variant_name}</div>
                                            <div className="text-xs text-muted-foreground">{formatRupiah(item.unit_price)}/pcs</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg text-xs"
                                                onClick={() => updateQty(i, item.qty - 1)}
                                            >-</Button>
                                            <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg text-xs"
                                                onClick={() => updateQty(i, item.qty + 1)}
                                            >+</Button>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <div className="font-semibold text-sm">{formatRupiah(item.unit_price * item.qty)}</div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                            onClick={() => removeItem(i)}
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                ))}

                                {/* Subtotal */}
                                <div className="mt-3 border-t border-border pt-3 flex items-end justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        Estimasi HPP: {formatRupiah(totalHpp)}<br />
                                        Estimasi untung: {formatRupiah(subtotal - totalHpp)}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Total</div>
                                        <div className="text-xl font-bold">{formatRupiah(subtotal)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/orders">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || cart.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5"
                        >
                            {processing ? 'Menyimpan...' : 'Buat Pesanan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
