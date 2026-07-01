import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant } from '@/types/mrp';
import { Head, router } from '@inertiajs/react';
import {
    ShoppingBag, Trash2, Plus, Minus, Check,
    Banknote, CreditCard, Smartphone, ShoppingCart, Package
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/utils-mrp';
import { goeyToast } from 'goey-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesanan', href: '/orders' },
    { title: 'POS Kasir', href: '/pos' },
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

interface PaymentMethod {
    id: number;
    name: string;
    account_name: string | null;
    account_number: string | null;
    is_active: boolean;
}

interface Props {
    variants: (ProductVariant & { hpp: number; margin: number; profit: number })[];
    packages: PackageModel[];
    paymentMethods: PaymentMethod[];
}

export default function PosPage({ variants, packages, paymentMethods = [] }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCartItemId, setActiveCartItemId] = useState<number | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');

    const defaultPayment = paymentMethods.length > 0
        ? (paymentMethods[0].account_number ? `${paymentMethods[0].name} (${paymentMethods[0].account_number})` : paymentMethods[0].name)
        : 'Tunai (Cash)';

    const [paymentMethod, setPaymentMethod] = useState(defaultPayment);
    const isCash = paymentMethod.toLowerCase().includes('tunai') || paymentMethod.toLowerCase().includes('cash');

    const [cashReceived, setCashReceived] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [successOrder, setSuccessOrder] = useState<string | null>(null);

    // Sync activeCartItemId: if the current active package is deleted or cart becomes empty
    useEffect(() => {
        if (cart.length === 0) {
            setActiveCartItemId(null);
            return;
        }
        if (activeCartItemId !== null && !cart.some(item => item.id === activeCartItemId)) {
            // Only set next active item if there are package items
            const packageItems = cart.filter(item => item.package_id > 0);
            if (packageItems.length > 0) {
                setActiveCartItemId(packageItems[packageItems.length - 1].id);
            } else {
                setActiveCartItemId(null);
            }
        }
    }, [cart, activeCartItemId]);

    // Calculate subtotal & HPP
    const subtotal = cart.reduce((sum, item) => sum + item.harga, 0);

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
    const totalHpp = cart.reduce((sum, item) => sum + getCartItemHpp(item), 0);
    const change = cashReceived - subtotal;

    // Check if all packages in cart are full
    const isCartComplete = cart.length > 0 && cart.every(item => {
        if (item.package_id === 0) return true; // Direct variant is always complete
        const selectedQty = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);
        return selectedQty === item.isi;
    });

    const addPackageToCart = (pkg: PackageModel) => {
        const allowed = pkg.variants && pkg.variants.length > 0
            ? pkg.variants
            : variants.filter(v => Number(v.recipe_qty) === 1);

        const initialQuantities: Record<number, number> = {};
        allowed.forEach(v => {
            initialQuantities[v.id] = 0;
        });

        const newId = Date.now() + Math.random();

        setCart(prev => [
            ...prev,
            {
                id: newId,
                package_id: pkg.id,
                name: pkg.name,
                isi: pkg.capacity,
                harga: Number(pkg.price),
                quantities: initialQuantities
            }
        ]);
        setActiveCartItemId(newId);
    };

    const handleVariantClick = (variant: typeof variants[number]) => {
        if (packages.length > 0) {
            // Package-based mode: User must select a package first
            let targetItemIdx = -1;
            if (activeCartItemId !== null) {
                targetItemIdx = cart.findIndex(item => item.id === activeCartItemId);
            }

            if (targetItemIdx >= 0) {
                const item = cart[targetItemIdx];
                const currentTotal = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);
                if (currentTotal < item.isi) {
                    setCart(prev =>
                        prev.map((c, idx) => {
                            if (idx !== targetItemIdx) return c;
                            return {
                                ...c,
                                quantities: {
                                    ...c.quantities,
                                    [variant.id]: (c.quantities[variant.id] ?? 0) + 1
                                }
                            };
                        })
                    );
                } else {
                    goeyToast.warning("Paket terpilih sudah penuh! Silakan buat atau klik paket lain di keranjang.");
                }
            } else {
                goeyToast.warning("Silakan pilih/klik paket di keranjang terlebih dahulu untuk mengisi rasa!");
            }
        } else {
            // Direct mode: No packages exist, direct add variant
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
                    const newId = Date.now() + Math.random();
                    return [
                        ...prev,
                        {
                            id: newId,
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
        }
    };

    const adjustQty = (cartId: number, variantId: number, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id !== cartId) return item;

                const currentQty = item.quantities[variantId] ?? 0;
                const newQty = Math.max(0, currentQty + delta);

                const currentTotal = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);
                const newTotal = currentTotal - currentQty + newQty;

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

    const removeItem = (cartId: number) => {
        setCart(prev => prev.filter(item => item.id !== cartId));
    };

    const clearCart = () => {
        setCart([]);
        setActiveCartItemId(null);
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setCashReceived(0);
        setSuccessOrder(null);
    };

    const handleCheckout = () => {
        if (!customerName.trim() || cart.length === 0 || !isCartComplete) return;
        setProcessing(true);

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

        router.post('/orders', {
            customer_name: customerName,
            customer_phone: customerPhone,
            notes: notes,
            payment_method: paymentMethod,
            items: items,
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
                {/* Left: Product & Package Grid */}
                <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 bg-background space-y-6">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingBag className="text-indigo-500" size={22} />
                            POS Kasir
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {packages.length > 0
                                ? 'Pilih paket di bawah, lalu isi varian rasanya'
                                : 'Pilih varian rasa langsung untuk memesan'}
                        </p>
                    </div>

                    {/* Section 1: Pilih Paket (hanya muncul jika ada paket aktif) */}
                    {packages.length > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                            <h2 className="text-sm font-semibold flex items-center gap-1.5">
                                <Package className="text-indigo-500" size={16} />
                                Pilih Paket Mochi
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        type="button"
                                        onClick={() => addPackageToCart(pkg)}
                                        className="group flex flex-col items-center gap-1 border border-border hover:border-indigo-400 bg-muted hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl p-4 transition-all text-center"
                                    >
                                        <Package size={18} className="text-muted-foreground group-hover:text-indigo-500 transition-colors mb-1" />
                                        <span className="text-sm font-bold truncate max-w-full">{pkg.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                                            Isi {pkg.capacity} Pcs
                                        </span>
                                        <span className="text-sm font-bold text-indigo-600 mt-1">
                                            {formatRupiah(Number(pkg.price))}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Varian Rasa */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold">Pilih Varian Rasa</h2>
                        {variants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                <ShoppingBag size={40} className="mb-3 opacity-30" />
                                <p>Belum ada varian produk aktif.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {variants.map((v) => {
                                    // Calculate quantity in cart
                                    let currentQty = 0;
                                    if (packages.length > 0) {
                                        const activeItem = cart.find(c => c.id === activeCartItemId);
                                        currentQty = activeItem?.quantities[v.id] ?? 0;
                                    } else {
                                        cart.forEach(item => {
                                            if (item.package_id === 0) {
                                                currentQty += item.quantities[v.id] ?? 0;
                                            }
                                        });
                                    }

                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => handleVariantClick(v)}
                                            className={`relative group text-left rounded-xl border p-3.5 transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 ${currentQty > 0
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 shadow-sm'
                                                    : 'bg-card border-border hover:border-indigo-200'
                                                }`}
                                        >
                                            {currentQty > 0 && (
                                                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                                                    {currentQty}
                                                </div>
                                            )}
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-2">
                                                <ShoppingBag size={14} className="text-indigo-500" />
                                            </div>
                                            <div className="font-medium text-xs leading-tight mb-1 truncate">{v.name.replace('Mochi ', '')}</div>
                                            <div className="text-indigo-600 font-bold text-xs">{formatRupiah(v.sell_price)}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Cart & Checkout */}
                <div className="w-full sm:w-[22rem] lg:w-[26rem] xl:w-[30rem] shrink-0 border-l border-border flex flex-col bg-card">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <ShoppingCart size={16} />
                            Keranjang
                            {cart.length > 0 && (
                                <span className="bg-indigo-600 text-white text-xs rounded-full px-1.5 py-0.5">
                                    {packages.length > 0 ? `${cart.length} paket` : `${cart.reduce((s, i) => s + i.quantities[Number(Object.keys(i.quantities)[0])], 0)} item`}
                                </span>
                            )}
                        </h2>
                        {cart.length > 0 && (
                            <button onClick={clearCart} className="text-xs text-rose-400 hover:text-rose-600 font-medium">Kosongkan</button>
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
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                        {cart.length === 0 && !successOrder && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm">
                                <ShoppingCart size={28} className="mb-2 opacity-30" />
                                Keranjang kosong.<br />
                                {packages.length > 0 ? 'Pilih paket di kiri untuk memulai.' : 'Pilih varian rasa di kiri untuk memulai.'}
                            </div>
                        )}

                        {cart.map((item) => {
                            if (item.package_id === 0) {
                                // Direct variant item layout
                                const variantId = Number(Object.keys(item.quantities)[0]);
                                const qty = item.quantities[variantId];
                                const v = variants.find(vv => vv.id === variantId);
                                if (!v) return null;

                                return (
                                    <div key={item.id} className="flex flex-col gap-2.5 bg-background rounded-xl p-3.5 border border-border">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-medium text-sm truncate">{v.name.replace('Mochi ', '')}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{formatRupiah(Number(v.sell_price))}/pcs</div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeItem(item.id);
                                                }}
                                                className="text-rose-400 hover:text-rose-600 shrink-0 p-0.5"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        adjustDirectQty(item.id, variantId, -1);
                                                    }}
                                                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        adjustDirectQty(item.id, variantId, 1);
                                                    }}
                                                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <div className="font-semibold text-sm">{formatRupiah(item.harga)}</div>
                                        </div>
                                    </div>
                                );
                            }

                            // Package item layout
                            const isActive = item.id === activeCartItemId;
                            const totalSelected = Object.values(item.quantities).reduce((sum, q) => sum + q, 0);
                            const isComplete = totalSelected === item.isi;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setActiveCartItemId(item.id)}
                                    className={`flex flex-col gap-2.5 rounded-xl p-3.5 border cursor-pointer transition-all ${isActive
                                            ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
                                            : 'border-border bg-background hover:border-indigo-200'
                                        }`}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {item.name}
                                            </span>
                                            <span className="text-xs font-semibold text-foreground truncate">
                                                {formatRupiah(item.harga)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeItem(item.id);
                                            }}
                                            className="text-rose-400 hover:text-rose-600 transition-colors shrink-0 p-0.5"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Selected Flavor Counts */}
                                    <div className="space-y-1.5">
                                        {Object.entries(item.quantities).map(([vId, qty]) => {
                                            if (qty === 0) return null;
                                            const v = variants.find(vv => vv.id === Number(vId));
                                            if (!v) return null;
                                            return (
                                                <div key={vId} className="flex items-center justify-between gap-2 text-xs bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/40">
                                                    <span className="font-medium truncate">{v.name.replace('Mochi ', '')}</span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                adjustQty(item.id, v.id, -1);
                                                            }}
                                                            className="w-5 h-5 rounded bg-background hover:bg-muted border border-border flex items-center justify-center text-[10px]"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-bold w-4 text-center">{qty}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                adjustQty(item.id, v.id, 1);
                                                            }}
                                                            disabled={isComplete}
                                                            className="w-5 h-5 rounded bg-background hover:bg-muted border border-border flex items-center justify-center text-[10px] disabled:opacity-40"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Status */}
                                    <div className="flex justify-between items-center text-[10px] mt-0.5 border-t border-dashed border-border pt-2">
                                        <span className={isComplete ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                                            {isComplete ? "✓ Lengkap" : `⚠ Kurang ${item.isi - totalSelected} Pcs`} ({totalSelected}/{item.isi})
                                        </span>
                                        {isActive && !isComplete && (
                                            <span className="text-indigo-600 font-medium animate-pulse">Pilih rasa...</span>
                                        )}
                                        {!isActive && !isComplete && (
                                            <span className="text-muted-foreground">Klik untuk isi rasa</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Customer & Payment */}
                    {cart.length > 0 && (
                        <div className="border-t border-border p-4 space-y-4 max-h-[55vh] overflow-y-auto">
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
                                <Label className="text-xs text-muted-foreground mb-1.5 block">Metode Pembayaran</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
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
                                                    onClick={() => setPaymentMethod(value)}
                                                    className={`flex flex-col items-center justify-center text-center gap-1 p-2.5 border rounded-xl text-[11px] font-medium transition-all ${paymentMethod === value
                                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                                            : 'bg-muted hover:bg-muted/80 border-border'
                                                        }`}
                                                >
                                                    <Icon size={14} />
                                                    <span className="line-clamp-1">{pm.name}</span>
                                                    {pm.account_number && (
                                                        <span className="text-[9px] opacity-80 block truncate max-w-full font-mono">
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
                                                    onClick={() => setPaymentMethod(method.key)}
                                                    className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-xs font-medium transition-all ${paymentMethod === method.key
                                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                                            : 'bg-muted hover:bg-muted/80 border-border'
                                                        }`}
                                                >
                                                    <Icon size={14} />
                                                    {method.label}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Cash Received (for cash payment) */}
                            {isCash && (
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
                            <div className="bg-muted/50 rounded-xl p-3.5 space-y-1.5">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal ({packages.length > 0 ? `${cart.length} paket` : `${cart.reduce((s, i) => s + i.quantities[Number(Object.keys(i.quantities)[0])], 0)} item`})</span>
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
                                disabled={processing || !customerName.trim() || !isCartComplete}
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