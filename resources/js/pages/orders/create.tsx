import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant } from '@/types/mrp';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Plus, Minus, Trash2, ShoppingCart, Package, ShoppingBag } from 'lucide-react';
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

interface PackageModel {
    id: number;
    name: string;
    capacity: number;
    price: string | number;
    is_active: boolean;
    description: string | null;
    variants?: ProductVariant[];
}

interface CartItem {
    id: number;           // key unik tiap baris cart
    package_id: number;   // id paket dari database (atau 0 jika direct variant)
    name: string;
    isi: number;
    harga: number;
    quantities: Record<number, number>; // variant_id -> qty
}

interface Props {
    variants: (ProductVariant & { hpp: number; margin: number })[];
    packages: PackageModel[];
}

let nextId = 1;

export default function OrderCreate({ variants, packages }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        notes: '',
        items: [] as { variant_id: number; qty: number; paket_isi: number; paket_harga: number }[],
    });

    const [cart, setCart] = useState<CartItem[]>([]);

    // ── Helper: Hitung HPP untuk satu baris cart ──────────────────────────────
    const getCartItemHpp = (item: CartItem) => {
        let total = 0;
        Object.entries(item.quantities).forEach(([vId, qty]) => {
            const v = variants.find(vv => vv.id === Number(vId));
            if (v) {
                total += (v.hpp ?? 0) * qty;
            }
        });
        return total;
    };

    // ── Ringkasan ──────────────────────────────────────────────────────────────
    const subtotal = cart.reduce((sum, item) => sum + item.harga, 0);
    const totalHpp = cart.reduce((sum, item) => sum + getCartItemHpp(item), 0);
    
    // Paket lengkap jika total qty rasa terpilih === kapasitas paket
    const cartComplete = cart.every(item => {
        if (item.package_id === 0) return true; // Direct variant is always complete
        const selectedQty = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);
        return selectedQty === item.isi;
    });

    // ── Tambah paket ke cart ───────────────────────────────────────────────────
    const addPaket = (pkg: PackageModel) => {
        const allowed = pkg.variants && pkg.variants.length > 0
            ? pkg.variants
            : variants.filter(v => Number(v.recipe_qty) === 1);

        const initialQuantities: Record<number, number> = {};
        allowed.forEach(v => {
            initialQuantities[v.id] = 0;
        });

        setCart(prev => [
            ...prev,
            { 
                id: nextId++, 
                package_id: pkg.id, 
                name: pkg.name, 
                isi: pkg.capacity, 
                harga: Number(pkg.price), 
                quantities: initialQuantities,
            },
        ]);
    };

    const addDirectVariant = (variant: typeof variants[number]) => {
        setCart(prev => {
            const existingIdx = prev.findIndex(item => item.package_id === 0 && item.quantities[variant.id] !== undefined);
            if (existingIdx >= 0) {
                const updated = [...prev];
                const item = updated[existingIdx];
                const newQty = (item.quantities[variant.id] ?? 0) + 1;
                updated[existingIdx] = {
                    ...item,
                    harga: Number(variant.sell_price) * newQty,
                    quantities: {
                        [variant.id]: newQty
                    }
                };
                return updated;
            } else {
                return [
                    ...prev,
                    {
                        id: nextId++,
                        package_id: 0,
                        name: variant.name,
                        isi: 1,
                        harga: Number(variant.sell_price),
                        quantities: {
                            [variant.id]: 1
                        }
                    }
                ];
            }
        });
    };

    // ── Sesuaikan Qty Rasa dalam Paket ──────────────────────────────────────────
    const adjustQty = (cartId: number, variantId: number, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id !== cartId) return item;

                const currentQty = item.quantities[variantId] ?? 0;
                const newQty = Math.max(0, currentQty + delta);

                const currentTotal = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);
                const newTotal = currentTotal - currentQty + newQty;

                // Jangan sampai melebihi kapasitas paket
                if (newTotal > item.isi) return item;

                return {
                    ...item,
                    quantities: {
                        ...item.quantities,
                        [variantId]: newQty,
                    }
                };
            })
        );
    };

    const adjustDirectQty = (cartId: number, variantId: number, delta: number) => {
        setCart(prev => {
            const updated = prev.map(item => {
                if (item.id !== cartId) return item;
                const v = variants.find(vv => vv.id === variantId);
                if (!v) return item;

                const currentQty = item.quantities[variantId] ?? 0;
                const newQty = Math.max(0, currentQty + delta);
                return {
                    ...item,
                    harga: Number(v.sell_price) * newQty,
                    quantities: {
                        [variantId]: newQty
                    }
                };
            });
            return updated.filter(item => {
                const vId = Number(Object.keys(item.quantities)[0]);
                return (item.quantities[vId] ?? 0) > 0;
            });
        });
    };

    // ── Hapus baris dari cart ──────────────────────────────────────────────────
    const removeItem = (cartId: number) => {
        setCart(prev => prev.filter(item => item.id !== cartId));
    };

    // ── Sync ke form data ──────────────────────────────────────────────────────
    useEffect(() => {
        // Flatten: tiap qty rasa jadi 1 baris item dengan paket_isi & paket_harga
        const items = cart.flatMap(item => {
            const result: { variant_id: number; qty: number; paket_isi: number; paket_harga: number }[] = [];
            Object.entries(item.quantities).forEach(([vId, qty]) => {
                for (let i = 0; i < qty; i++) {
                    result.push({
                        variant_id: Number(vId),
                        qty: 1,
                        paket_isi: item.isi,
                        paket_harga: item.package_id === 0 ? item.harga / qty : item.harga,
                    });
                }
            });
            return result;
        });
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

                    {/* ── Pilih Paket / Varian Rasa ───────────────────────────── */}
                    {packages.length > 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                            <h2 className="text-sm font-semibold">Tambah Paket</h2>
                            {errors.items && (
                                <p className="text-xs text-rose-500">{errors.items as string}</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        type="button"
                                        onClick={() => addPaket(pkg)}
                                        className="group flex flex-col items-center gap-1 border border-border hover:border-indigo-400 bg-muted hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl p-4 transition-all text-center"
                                    >
                                        <Package size={18} className="text-muted-foreground group-hover:text-indigo-500 transition-colors mb-1" />
                                        <span className="text-sm font-bold truncate max-w-full">{pkg.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                                            Isi {pkg.capacity} Pcs
                                        </span>
                                        {pkg.description && (
                                            <span className="text-[10px] text-muted-foreground/80 line-clamp-2 max-w-full leading-snug px-1">
                                                {pkg.description}
                                            </span>
                                        )}
                                        <span className="text-sm font-bold text-indigo-600 mt-1">
                                            {formatRupiah(Number(pkg.price))}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                            <h2 className="text-sm font-semibold">Pilih Varian Rasa</h2>
                            {errors.items && (
                                <p className="text-xs text-rose-500">{errors.items as string}</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {variants.map((v) => {
                                    let currentQty = 0;
                                    cart.forEach(item => {
                                        if (item.package_id === 0) {
                                            currentQty += item.quantities[v.id] ?? 0;
                                        }
                                    });

                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => addDirectVariant(v)}
                                            className="group flex flex-col items-center gap-1 border border-border hover:border-indigo-400 bg-muted hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl p-4 transition-all text-center relative"
                                        >
                                            {currentQty > 0 && (
                                                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                    {currentQty}
                                                </div>
                                            )}
                                            <ShoppingBag size={18} className="text-muted-foreground group-hover:text-indigo-500 transition-colors mb-1" />
                                            <span className="text-sm font-bold truncate max-w-full">{v.name.replace('Mochi ', '')}</span>
                                            <span className="text-sm font-bold text-indigo-600 mt-1">
                                                {formatRupiah(Number(v.sell_price))}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Cart / Item Pesanan ──────────────────────────────────── */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold">Item Pesanan</h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <ShoppingCart size={28} className="mx-auto mb-2 opacity-30" />
                                {packages.length > 0
                                    ? "Pilih paket di atas untuk mulai mencatat pesanan"
                                    : "Pilih varian rasa di atas untuk mulai mencatat pesanan"}
                            </div>
                        ) : (
                            <>
                                {cart.map((item) => {
                                    if (item.package_id === 0) {
                                        // Direct variant layout in cart
                                        const variantId = Number(Object.keys(item.quantities)[0]);
                                        const qty = item.quantities[variantId];
                                        const v = variants.find(vv => vv.id === variantId);
                                        if (!v) return null;

                                        return (
                                            <div key={item.id} className="flex items-center gap-2 bg-background rounded-xl p-3 border border-border">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{v.name.replace('Mochi ', '')}</div>
                                                    <div className="text-xs text-muted-foreground">{formatRupiah(Number(v.sell_price))}/pcs</div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            adjustDirectQty(item.id, variantId, -1);
                                                        }}
                                                        className="h-6 w-6 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            adjustDirectQty(item.id, variantId, 1);
                                                        }}
                                                        className="h-6 w-6 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                                <div className="text-right shrink-0 min-w-[60px]">
                                                    <div className="font-semibold text-xs">{formatRupiah(item.harga)}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeItem(item.id);
                                                    }}
                                                    className="text-rose-400 hover:text-rose-600 shrink-0 ml-2"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        );
                                    }

                                    const pkg = packages.find(p => p.id === item.package_id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="border border-border rounded-xl p-4 space-y-3"
                                        >
                                            {/* Header baris */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                                                            {item.name}
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
                                                {pkg?.description && (
                                                    <p className="text-[11px] text-muted-foreground/80 pl-1 leading-normal">
                                                        {pkg.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* List Rasa & Stepper */}
                                            <div className="space-y-2.5 pt-1">
                                                {(() => {
                                                    const pkg = packages.find(p => p.id === item.package_id);
                                                    const allowedVariants = pkg?.variants && pkg.variants.length > 0
                                                        ? pkg.variants
                                                        : variants.filter(v => Number(v.recipe_qty) === 1);
                                                    const totalSelected = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);

                                                    return (
                                                        <>
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-1.5 mb-1">
                                                                <span>Pilih Varian Rasa</span>
                                                                <span className={totalSelected === item.isi ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                                                                    {totalSelected === item.isi ? "✓ Lengkap" : `⚠ Kurang ${item.isi - totalSelected}`} ({totalSelected}/{item.isi} Pcs)
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {allowedVariants.map(v => {
                                                                    const qty = item.quantities[v.id] ?? 0;
                                                                    return (
                                                                        <div key={v.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-xl border border-border/60">
                                                                            <span className="text-xs font-medium truncate pr-2">{v.name.replace('Mochi ', '')}</span>
                                                                            <div className="flex items-center gap-2.5 shrink-0">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => adjustQty(item.id, v.id, -1)}
                                                                                    disabled={qty === 0}
                                                                                    className="h-6 w-6 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center disabled:opacity-40 transition-colors"
                                                                                >
                                                                                    <Minus size={11} className="text-muted-foreground" />
                                                                                </button>
                                                                                <span className={`text-xs font-bold w-4 text-center ${qty > 0 ? "text-indigo-600" : "text-muted-foreground/60"}`}>
                                                                                    {qty}
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => adjustQty(item.id, v.id, 1)}
                                                                                    disabled={totalSelected >= item.isi}
                                                                                    className="h-6 w-6 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center disabled:opacity-40 transition-colors"
                                                                                >
                                                                                    <Plus size={11} className="text-muted-foreground" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })}

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