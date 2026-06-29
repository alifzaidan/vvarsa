import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant } from '@/types/mrp';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesanan', href: '/orders' },
    { title: 'Buat Pesanan', href: '/orders/create' },
];

// ─── Konfigurasi paket isi ────────────────────────────────────────────────────
const PAKET_ISI = [
    { isi: 1, harga: 7000 },
    { isi: 3, harga: 18000 },
    { isi: 6, harga: 35000 },
] as const;

type Isi = (typeof PAKET_ISI)[number]['isi']; // 1 | 3 | 6

// ─── Tipe data ────────────────────────────────────────────────────────────────
interface SlotVarian {
    variant_id: number;
    variant_name: string;
}

interface CartItem {
    id: number;           // key unik tiap baris cart
    isi: Isi;
    harga: number;
    slots: SlotVarian[];  // panjang = isi, isi dengan varian yang dipilih
    hpp: number;          // total hpp semua slot
}

interface Props {
    variants: (ProductVariant & { hpp: number; margin: number })[];
}

let nextId = 1;

export default function OrderCreate({ variants }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        notes: '',
        items: [] as { variant_id: number; qty: number; paket_isi: number; paket_harga: number }[],
    });

    const [cart, setCart] = useState<CartItem[]>([]);

    // ── Ringkasan ──────────────────────────────────────────────────────────────
    const subtotal = cart.reduce((sum, item) => sum + item.harga, 0);
    const totalHpp = cart.reduce((sum, item) => sum + item.hpp, 0);
    const cartComplete = cart.every(item => item.slots.every(s => s.variant_id !== 0));

    // ── Tambah paket ke cart ───────────────────────────────────────────────────
    const addPaket = (isi: Isi) => {
        const paket = PAKET_ISI.find(p => p.isi === isi)!;
        const emptySlots: SlotVarian[] = Array.from({ length: isi }, () => ({
            variant_id: 0,
            variant_name: '',
        }));
        setCart(prev => [
            ...prev,
            { id: nextId++, isi, harga: paket.harga, slots: emptySlots, hpp: 0 },
        ]);
    };

    // ── Set varian untuk satu slot ─────────────────────────────────────────────
    const setSlotVarian = (cartId: number, slotIdx: number, variantId: number) => {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) return;
        setCart(prev =>
            prev.map(item => {
                if (item.id !== cartId) return item;
                const newSlots = item.slots.map((s, i) =>
                    i === slotIdx
                        ? { variant_id: variant.id, variant_name: variant.name }
                        : s,
                );
                // Hitung hpp dari rata2 hpp per slot × isi
                const filledSlots = newSlots.filter(s => s.variant_id !== 0);
                const avgHpp = filledSlots.reduce((sum, s) => {
                    const v = variants.find(vv => vv.id === s.variant_id);
                    return sum + (v?.hpp ?? 0);
                }, 0);
                return { ...item, slots: newSlots, hpp: avgHpp };
            }),
        );
    };

    // ── Hapus baris dari cart ──────────────────────────────────────────────────
    const removeItem = (cartId: number) => {
        setCart(prev => prev.filter(item => item.id !== cartId));
    };

    // ── Sync ke form data ──────────────────────────────────────────────────────
    useEffect(() => {
        // Flatten: tiap slot jadi 1 baris item dengan paket_isi & paket_harga
        // Backend bisa menggunakan paket_isi & paket_harga untuk grouping harga
        const items = cart.flatMap(item =>
            item.slots
                .filter(s => s.variant_id !== 0)
                .map(s => ({
                    variant_id: s.variant_id,
                    qty: 1,
                    paket_isi: item.isi,
                    paket_harga: item.harga,
                })),
        );
        setData('items', items);
    }, [cart]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pesanan" />

            <div className="mx-auto max-w-2xl p-4 md:p-6">
                {/* Header */}
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

                    {/* ── Data Pelanggan ──────────────────────────────────────── */}
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
                                {errors.customer_name && (
                                    <p className="text-xs text-rose-500">{errors.customer_name}</p>
                                )}
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

                    {/* ── Pilih Paket ─────────────────────────────────────────── */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold">Tambah Paket</h2>
                        {errors.items && (
                            <p className="text-xs text-rose-500">{errors.items as string}</p>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            {PAKET_ISI.map(({ isi, harga }) => (
                                <button
                                    key={isi}
                                    type="button"
                                    onClick={() => addPaket(isi)}
                                    className="group flex flex-col items-center gap-1 border border-border hover:border-indigo-400 bg-muted hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl p-4 transition-all"
                                >
                                    <Package size={18} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-lg font-bold">{isi}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                        {isi === 1 ? 'Pcs' : 'Mix'}
                                    </span>
                                    <span className="text-sm font-semibold text-indigo-600 mt-1">
                                        {formatRupiah(harga)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Cart / Item Pesanan ──────────────────────────────────── */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold">Item Pesanan</h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <ShoppingCart size={28} className="mx-auto mb-2 opacity-30" />
                                Pilih paket di atas untuk mulai mencatat pesanan
                            </div>
                        ) : (
                            <>
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border border-border rounded-xl p-4 space-y-3"
                                    >
                                        {/* Header baris */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                                                    Isi {item.isi}
                                                </span>
                                                <span className="text-sm font-semibold">
                                                    {formatRupiah(item.harga)}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>

                                        {/* Slot varian */}
                                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(item.isi, 3)}, 1fr)` }}>
                                            {item.slots.map((slot, slotIdx) => (
                                                <div key={slotIdx} className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                        {item.isi === 1 ? 'Varian' : `Slot ${slotIdx + 1}`}
                                                    </label>
                                                    <select
                                                        className={`w-full text-sm rounded-lg border px-2 py-1.5 bg-background transition-colors
                                                            ${slot.variant_id === 0
                                                                ? 'border-amber-300 dark:border-amber-600 text-muted-foreground'
                                                                : 'border-border'
                                                            }`}
                                                        value={slot.variant_id || ''}
                                                        onChange={(e) => setSlotVarian(item.id, slotIdx, Number(e.target.value))}
                                                    >
                                                        <option value="" disabled>Pilih varian…</option>
                                                        {variants.map(v => (
                                                            <option key={v.id} value={v.id}>{v.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Peringatan slot belum terisi */}
                                        {item.slots.some(s => s.variant_id === 0) && (
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                                ⚠ Pilih varian untuk semua slot sebelum menyimpan
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {/* Subtotal */}
                                <div className="border-t border-border pt-3 mt-1 flex items-end justify-between">
                                    <div className="text-xs text-muted-foreground leading-5">
                                        Estimasi HPP: {formatRupiah(totalHpp)}<br />
                                        Estimasi untung: {formatRupiah(subtotal - totalHpp)}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Total</div>
                                        <div className="text-xl font-bold">{formatRupiah(subtotal)}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Aksi ────────────────────────────────────────────────── */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/orders">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || cart.length === 0 || !cartComplete}
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