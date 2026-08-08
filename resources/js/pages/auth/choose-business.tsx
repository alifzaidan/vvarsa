import { Head, useForm } from '@inertiajs/react';
import { Check, Info, LoaderCircle, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ── Types ──────────────────────────────────────────────────────────────────────

type Plan = {
    id: string;
    name: string;
    slug: string;
    price: number;
    max_users: number;
    max_products: number;
    features: string[];
};

type Props = {
    plans: Plan[];
    alreadySetup?: boolean;
};

type FormData = {
    plan_slug: string;
    business_name: string;
    business_type: string;
};

// ── Plan config (visual metadata) ─────────────────────────────────────────────

const planMeta: Record<string, {
    badge?: string;
    badgeColor?: string;
    gradient: string;
    border: string;
    activeBorder: string;
    glow: string;
    icon: React.ReactNode;
    highlight?: boolean;
}> = {
    free: {
        gradient: 'from-slate-500/10 to-zinc-500/10',
        border: 'border-slate-300/30 dark:border-slate-600/30',
        activeBorder: 'border-slate-400',
        glow: 'shadow-slate-400/20',
        icon: <span className="text-2xl">🆓</span>,
    },
    pro: {
        badge: 'Paling Populer',
        badgeColor: 'bg-violet-500 text-white',
        gradient: 'from-violet-500/15 to-purple-500/15',
        border: 'border-violet-300/40 dark:border-violet-500/40',
        activeBorder: 'border-violet-500',
        glow: 'shadow-violet-500/30',
        icon: <Zap className="h-6 w-6 text-violet-500" />,
        highlight: true,
    },
    enterprise: {
        badge: 'Terlengkap',
        badgeColor: 'bg-amber-500 text-white',
        gradient: 'from-amber-500/10 to-orange-500/10',
        border: 'border-amber-300/40 dark:border-amber-500/40',
        activeBorder: 'border-amber-500',
        glow: 'shadow-amber-500/25',
        icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    },
};

// ── Feature label map ──────────────────────────────────────────────────────────

const featureLabels: Record<string, string> = {
    inventory:          'Manajemen Inventori',
    stock_in:           'Stok Masuk',
    stock_out:          'Stok Keluar',
    stock_opname:       'Stock Opname',
    finance_daily:      'Laporan Keuangan Harian',
    finance_monthly:    'Laporan Keuangan Bulanan',
    finance_export:     'Export Laporan Keuangan',
    events_view:        'Lihat Event',
    events_register:    'Daftar Event',
    events_organizer:   'Kelola Event',
    community_read:     'Baca Forum Komunitas',
    community_join:     'Bergabung Forum',
    community_post:     'Posting di Forum',
    suppliers_view:     'Lihat Supplier',
    suppliers_add:      'Tambah Supplier',
    tax_reports:        'Laporan Pajak',
    tax_consultation:   'Konsultasi Pajak',
    tax_priority:       'Konsultasi Pajak Prioritas',
    multi_user:         'Multi Pengguna',
    export_pdf:         'Export PDF',
    api_access:         'Akses API',
    dedicated_support:  'Dukungan Khusus',
};

// Key features to highlight per plan (max 5)
const planHighlights: Record<string, string[]> = {
    free:       ['inventory', 'stock_in', 'stock_out', 'finance_daily', 'events_view'],
    pro:        ['multi_user', 'finance_export', 'tax_reports', 'tax_consultation', 'export_pdf'],
    enterprise: ['api_access', 'dedicated_support', 'tax_priority', 'events_organizer', 'suppliers_add'],
};

// ── Business type cards ────────────────────────────────────────────────────────

const businessTypes = [
    {
        value: 'fnb',
        label: 'Food & Beverage',
        emoji: '🍜',
        description: 'Restoran, kafe, warung makan, catering, atau usaha kuliner lainnya.',
        gradient: 'from-orange-500/20 to-amber-500/20',
        border: 'border-orange-400/40',
        activeBorder: 'border-orange-400',
        activeGlow: 'shadow-orange-500/30',
        iconBg: 'bg-orange-500/10',
    },
    {
        value: 'retail',
        label: 'Retail / Toko',
        emoji: '🛍️',
        description: 'Toko kelontong, minimarket, toko fashion, elektronik, dan sejenisnya.',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-400/40',
        activeBorder: 'border-blue-400',
        activeGlow: 'shadow-blue-500/30',
        iconBg: 'bg-blue-500/10',
    },
    {
        value: 'services',
        label: 'Jasa / Services',
        emoji: '🔧',
        description: 'Salon, laundry, bengkel, percetakan, konsultasi, atau layanan jasa lainnya.',
        gradient: 'from-violet-500/20 to-purple-500/20',
        border: 'border-violet-400/40',
        activeBorder: 'border-violet-400',
        activeGlow: 'shadow-violet-500/30',
        iconBg: 'bg-violet-500/10',
    },
    {
        value: 'fashion',
        label: 'Fashion & Tekstil',
        emoji: '👗',
        description: 'Butik, konveksi, aksesoris, sepatu, tas, atau usaha fashion lainnya.',
        gradient: 'from-pink-500/20 to-rose-500/20',
        border: 'border-pink-400/40',
        activeBorder: 'border-pink-400',
        activeGlow: 'shadow-pink-500/30',
        iconBg: 'bg-pink-500/10',
    },
    {
        value: 'general',
        label: 'Manufaktur / Umum',
        emoji: '🏭',
        description: 'Produksi, kerajinan, atau bisnis yang belum masuk kategori di atas.',
        gradient: 'from-slate-500/20 to-zinc-500/20',
        border: 'border-slate-400/40',
        activeBorder: 'border-slate-400',
        activeGlow: 'shadow-slate-500/30',
        iconBg: 'bg-slate-500/10',
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
    return (
        <div className="mb-8 flex items-center justify-center gap-3">
            {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-3">
                    <div
                        className={[
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                            s === step
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/40'
                                : s < step
                                    ? 'bg-green-500 text-white'
                                    : 'bg-muted text-muted-foreground',
                        ].join(' ')}
                    >
                        {s < step ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span
                        className={[
                            'text-sm font-medium hidden sm:block',
                            s === step ? 'text-foreground' : 'text-muted-foreground',
                        ].join(' ')}
                    >
                        {s === 1 ? 'Pilih Paket' : 'Detail Bisnis'}
                    </span>
                    {s < 2 && (
                        <div className={['h-px w-8 transition-colors duration-300', step > 1 ? 'bg-green-500' : 'bg-border'].join(' ')} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ChooseBusiness({ plans = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        plan_slug: '',
        business_name: '',
        business_type: '',
    });

    const [step, setStep] = useState<1 | 2>(1);
    const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
    const [hoveredType, setHoveredType] = useState<string | null>(null);
    const [detailPlan, setDetailPlan] = useState<Plan | null>(null);

    const handlePlanNext = () => {
        if (data.plan_slug) setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('choose-business.store'));
    };

    return (
        <>
            <Head title="Setup Bisnis" />

            <div className="bg-background min-h-svh w-full">
                {/* ── Decorative background ── */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-500/8 to-pink-500/8 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-500/8 to-cyan-500/8 blur-3xl" />
                </div>

                <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-10 sm:py-16">
                    {/* ── Header ── */}
                    <div className="mb-6 text-center">
                        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl shadow-lg shadow-violet-500/30">
                            🏢
                        </div>
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                            {step === 1 ? 'Pilih Paket Langganan' : 'Detail Bisnis Anda'}
                        </h1>
                        <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                            {step === 1
                                ? 'Mulai gratis, upgrade kapan saja sesuai kebutuhan bisnis Anda.'
                                : 'Isi informasi bisnis Anda untuk personalisasi pengalaman.'}
                        </p>
                    </div>

                    {/* ── Step indicator ── */}
                    <StepIndicator step={step} />

                    {/* ═══════════════ STEP 1: Plan selection ═══════════════ */}
                    {step === 1 && (
                        <div className="w-full space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {plans.map((plan) => {
                                    const meta      = planMeta[plan.slug] ?? planMeta.free;
                                    const isSelected = data.plan_slug === plan.slug;
                                    const isHovered  = hoveredPlan === plan.slug;
                                    const highlights = planHighlights[plan.slug] ?? plan.features.slice(0, 5);

                                    return (
                                        <div
                                            key={plan.slug}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setData('plan_slug', plan.slug)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setData('plan_slug', plan.slug);
                                                }
                                            }}
                                            onMouseEnter={() => setHoveredPlan(plan.slug)}
                                            onMouseLeave={() => setHoveredPlan(null)}
                                            className={[
                                                'relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-200 bg-gradient-to-br cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                                                meta.gradient,
                                                isSelected
                                                    ? `${meta.activeBorder} shadow-xl ${meta.glow} ring-2 ring-inset ring-current scale-[1.02]`
                                                    : isHovered
                                                        ? `${meta.border} shadow-lg scale-[1.01]`
                                                        : `${meta.border} shadow-sm`,
                                            ].join(' ')}
                                        >
                                            {/* Badge */}
                                            {meta.badge && (
                                                <span className={['absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold whitespace-nowrap', meta.badgeColor].join(' ')}>
                                                    {meta.badge}
                                                </span>
                                            )}

                                            {/* Selected checkmark */}
                                            {isSelected && (
                                                <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-current text-xs text-white">
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                            )}

                                            {/* Plan icon */}
                                            <div className="mb-3">{meta.icon}</div>

                                            {/* Name & price */}
                                            <p className="text-foreground text-base font-bold">{plan.name}</p>
                                            <p className={['text-xl font-extrabold mt-0.5', isSelected ? '' : 'text-foreground'].join(' ')}>
                                                {formatPrice(plan.price)}
                                                {plan.price > 0 && (
                                                    <span className="text-muted-foreground ml-1 text-sm font-normal">/bulan</span>
                                                )}
                                            </p>

                                            {/* Limits */}
                                            <div className="text-muted-foreground mt-2 flex gap-3 text-xs">
                                                <span>👤 {plan.max_users === 99 ? 'Unlimited' : plan.max_users} user</span>
                                                <span>📦 {plan.max_products >= 9999 ? 'Unlimited' : plan.max_products} produk</span>
                                            </div>

                                            {/* Features */}
                                            <ul className="mt-3 space-y-1.5 flex-1">
                                                {highlights.map((feat) => (
                                                    <li key={feat} className="flex items-start gap-1.5 text-xs">
                                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                                                        <span className="text-foreground/80">{featureLabels[feat] ?? feat}</span>
                                                    </li>
                                                ))}
                                                {plan.features.length > highlights.length && (
                                                    <li className="text-muted-foreground text-xs pl-5">
                                                        +{plan.features.length - highlights.length} fitur lainnya
                                                    </li>
                                                )}
                                            </ul>

                                            {/* Button to view plan details */}
                                            <div className="mt-4 pt-3 border-t border-border/40">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs gap-1.5 h-8 font-medium hover:bg-background/80"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailPlan(plan);
                                                    }}
                                                >
                                                    <Info className="h-3.5 w-3.5" />
                                                    Lihat Detail Paket
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {errors.plan_slug && (
                                <p className="text-destructive text-sm">{errors.plan_slug}</p>
                            )}

                            <Button
                                type="button"
                                size="lg"
                                className="w-full"
                                disabled={!data.plan_slug}
                                onClick={handlePlanNext}
                            >
                                Lanjutkan →
                            </Button>
                        </div>
                    )}

                    {/* ═══════════════ STEP 2: Business detail ═══════════════ */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="w-full space-y-7">
                            {/* Back button */}
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
                            >
                                ← Kembali pilih paket
                            </button>

                            {/* Selected plan summary */}
                            {(() => {
                                const p    = plans.find((p) => p.slug === data.plan_slug);
                                const meta = planMeta[data.plan_slug] ?? planMeta.free;
                                return p ? (
                                    <div className={['flex items-center gap-3 rounded-xl border px-4 py-3 bg-gradient-to-r', meta.gradient, meta.border].join(' ')}>
                                        <div>{meta.icon}</div>
                                        <div>
                                            <p className="text-foreground text-sm font-semibold">Paket {p.name}</p>
                                            <p className="text-muted-foreground text-xs">{formatPrice(p.price)}{p.price > 0 ? '/bulan' : ''}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setDetailPlan(p)}
                                                className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition-colors"
                                            >
                                                <Info className="h-3 w-3" />
                                                Detail
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="text-muted-foreground hover:text-foreground text-xs underline transition-colors"
                                            >
                                                Ganti
                                            </button>
                                        </div>
                                    </div>
                                ) : null;
                            })()}

                            {/* Business name */}
                            <div className="space-y-2">
                                <Label htmlFor="business_name" className="text-sm font-medium">
                                    Nama Bisnis <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="business_name"
                                    type="text"
                                    required
                                    autoFocus
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="contoh: Warung Mochi Bahagia"
                                    className="h-11 text-base"
                                />
                                <InputError message={errors.business_name} />
                            </div>

                            {/* Business type cards */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    Tipe Bisnis <span className="text-destructive">*</span>
                                </Label>
                                <InputError message={errors.business_type} />

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {businessTypes.map((type) => {
                                        const isSelected = data.business_type === type.value;
                                        const isHovered  = hoveredType === type.value;

                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setData('business_type', type.value)}
                                                onMouseEnter={() => setHoveredType(type.value)}
                                                onMouseLeave={() => setHoveredType(null)}
                                                disabled={processing}
                                                className={[
                                                    'group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200 bg-gradient-to-br',
                                                    type.gradient,
                                                    isSelected
                                                        ? `${type.activeBorder} shadow-lg ${type.activeGlow} ring-1 ring-inset ring-current scale-[1.02]`
                                                        : isHovered
                                                            ? `${type.border} shadow-md scale-[1.01]`
                                                            : `${type.border} shadow-xs`,
                                                    'disabled:cursor-not-allowed disabled:opacity-60',
                                                ].join(' ')}
                                            >
                                                {isSelected && (
                                                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-current text-xs text-white">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                                <span
                                                    className={[
                                                        'flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-transform duration-200',
                                                        type.iconBg,
                                                        isSelected || isHovered ? 'scale-110' : '',
                                                    ].join(' ')}
                                                >
                                                    {type.emoji}
                                                </span>
                                                <div>
                                                    <p className="text-foreground text-sm font-semibold leading-tight">{type.label}</p>
                                                    <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{type.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={processing || !data.business_type || !data.business_name.trim()}
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Menyiapkan bisnis Anda…
                                    </>
                                ) : (
                                    'Mulai Menggunakan MRP 🚀'
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            {/* ── Dialog Detail Paket ── */}
            <Dialog open={!!detailPlan} onOpenChange={(open) => !open && setDetailPlan(null)}>
                {detailPlan && (
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                {planMeta[detailPlan.slug]?.icon}
                                <div>
                                    <DialogTitle className="text-xl font-bold">
                                        Paket {detailPlan.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm">
                                        {formatPrice(detailPlan.price)}{detailPlan.price > 0 ? ' / bulan' : ' (Gratis Selamanya)'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Limit Box */}
                            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3 text-center text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Maksimal User</p>
                                    <p className="font-semibold text-foreground">
                                        {detailPlan.max_users === 99 ? 'Unlimited' : `${detailPlan.max_users} Pengguna`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Maksimal Produk</p>
                                    <p className="font-semibold text-foreground">
                                        {detailPlan.max_products >= 9999 ? 'Unlimited' : `${detailPlan.max_products} Produk`}
                                    </p>
                                </div>
                            </div>

                            {/* Fitur Lengkap */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Daftar Fitur Lengkap ({detailPlan.features.length})
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                    {detailPlan.features.map((feat) => (
                                        <div key={feat} className="flex items-center gap-2 text-sm">
                                            <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span className="text-foreground">{featureLabels[feat] ?? feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="default"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    setData('plan_slug', detailPlan.slug);
                                    setDetailPlan(null);
                                    if (step === 1) {
                                        setStep(2);
                                    }
                                }}
                            >
                                Pilih Paket {detailPlan.name}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}

