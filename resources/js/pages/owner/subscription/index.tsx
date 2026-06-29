import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type SubscriptionPlan } from '@/types/mrp';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, Crown, Package, Users, XCircle, Zap } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Langganan', href: '/subscription' },
];

interface TenantPlan {
    name: string;
    slug: string;
    features: string[];
}

interface Props {
    plans: SubscriptionPlan[];
    current_plan: TenantPlan | null;
    subscription: { status: string; ends_at: string | null } | null;
    product_count: number;
    user_count: number;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
    free: Package,
    pro: Zap,
    enterprise: Crown,
};

const PLAN_COLORS: Record<string, string> = {
    free: 'border-slate-200 dark:border-slate-700',
    pro: 'border-blue-400 shadow-blue-100 dark:border-blue-500 dark:shadow-blue-900/20',
    enterprise: 'border-purple-400 shadow-purple-100 dark:border-purple-500 dark:shadow-purple-900/20',
};

const FEATURE_LABELS: Record<string, string> = {
    inventory: 'Manajemen Inventori',
    stock_in: 'Stok Masuk',
    stock_out: 'Stok Keluar',
    stock_opname: 'Stok Opname',
    finance_daily: 'Laporan Keuangan Harian',
    finance_monthly: 'Laporan Keuangan Bulanan',
    finance_export: 'Export Laporan',
    events_view: 'Lihat Event',
    events_register: 'Daftar Event',
    events_organizer: 'Selenggarakan Event',
    community_read: 'Baca Diskusi Komunitas',
    community_join: 'Bergabung Komunitas',
    community_post: 'Posting Diskusi',
    suppliers_view: 'Lihat Rekomendasi Supplier',
    suppliers_add: 'Tambah Supplier',
    tax_reports: 'Laporan Pajak',
    tax_consultation: 'Konsultasi Pajak',
    tax_priority: 'Konsultasi Pajak Prioritas',
    multi_user: 'Multi Pengguna',
    export_pdf: 'Export PDF',
    api_access: 'Akses API',
    dedicated_support: 'Dedicated Support',
};

// Features to highlight comparison
const COMPARISON_FEATURES = [
    'inventory', 'stock_opname', 'finance_daily', 'finance_monthly', 'finance_export',
    'events_view', 'events_register', 'community_post', 'suppliers_view', 'tax_reports',
    'tax_consultation', 'multi_user', 'export_pdf', 'api_access', 'dedicated_support',
];

export default function SubscriptionIndex({ plans, current_plan, subscription, product_count, user_count }: Props) {
    const currentSlug = current_plan?.slug || 'free';
    const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

    const handleUpgrade = (planId: number) => {
        setLoadingPlanId(planId);
        router.post('/subscription/upgrade', {
            plan_id: planId
        }, {
            onFinish: () => setLoadingPlanId(null)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Langganan" />
            <div className="flex flex-col gap-8 p-4 md:p-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Pilih Paket yang Tepat</h1>
                    <p className="text-muted-foreground mt-2">
                        Mulai gratis, upgrade kapan saja sesuai kebutuhan bisnis Anda
                    </p>
                </div>

                {/* Current status */}
                {current_plan && (
                    <div className="bg-card border-border mx-auto w-full max-w-2xl rounded-2xl border p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Paket Aktif</p>
                                <p className="text-lg font-bold">{current_plan.name}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Package size={14} />
                                        {product_count} produk
                                    </span>
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Users size={14} />
                                        {user_count} pengguna
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
                    {plans.map((plan) => {
                        const Icon = PLAN_ICONS[plan.slug] || Package;
                        const isCurrent = plan.slug === currentSlug;
                        const isPopular = plan.slug === 'pro';
                        const isLoading = loadingPlanId === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`bg-card relative flex flex-col rounded-2xl border-2 p-6 shadow-sm transition-shadow hover:shadow-md ${PLAN_COLORS[plan.slug]}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                                            Paling Populer
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <div className={`mb-3 inline-flex rounded-xl p-2.5 ${plan.slug === 'free' ? 'bg-slate-100 dark:bg-slate-800' : plan.slug === 'pro' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                                        <Icon size={20} className={plan.slug === 'free' ? 'text-slate-600' : plan.slug === 'pro' ? 'text-blue-600' : 'text-purple-600'} />
                                    </div>
                                    <h2 className="text-xl font-bold">{plan.name}</h2>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold">
                                            {plan.price === 0 || Number(plan.price) === 0 ? 'Gratis' : formatRupiah(plan.price)}
                                        </span>
                                        {Number(plan.price) > 0 && <span className="text-muted-foreground text-sm">/bulan</span>}
                                    </div>
                                </div>

                                {/* Limits */}
                                <div className="mb-4 space-y-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Pengguna</span>
                                        <span className="font-semibold">{plan.max_users === 99 || plan.max_users >= 99 ? 'Tak Terbatas' : plan.max_users}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Produk</span>
                                        <span className="font-semibold">{plan.max_products >= 9999 ? 'Tak Terbatas' : plan.max_products}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-6 flex-1 space-y-2">
                                    {COMPARISON_FEATURES.map((feat) => {
                                        const hasFeature = plan.features?.includes(feat);
                                        return (
                                            <div key={feat} className="flex items-center gap-2 text-sm">
                                                {hasFeature
                                                    ? <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                                                    : <XCircle size={14} className="text-muted-foreground/30 shrink-0" />}
                                                <span className={hasFeature ? '' : 'text-muted-foreground/50'}>
                                                    {FEATURE_LABELS[feat] || feat}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={isCurrent || isLoading}
                                    onClick={() => handleUpgrade(plan.id)}
                                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                                        isCurrent
                                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                            : plan.slug === 'pro'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : plan.slug === 'enterprise'
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'border-border border hover:bg-muted'
                                    }`}
                                >
                                    {isLoading ? 'Memproses...' : isCurrent ? '✓ Paket Aktif' : plan.price === 0 || Number(plan.price) === 0 ? 'Mulai Gratis' : 'Upgrade Sekarang'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ */}
                <div className="bg-card border-border mx-auto w-full max-w-2xl rounded-2xl border p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold">Pertanyaan Umum</h2>
                    <div className="space-y-4">
                        {[
                            { q: 'Apakah bisa upgrade/downgrade kapan saja?', a: 'Ya, Anda bisa upgrade atau downgrade paket kapan saja. Perubahan berlaku di periode tagihan berikutnya.' },
                            { q: 'Metode pembayaran apa yang diterima?', a: 'Kami menerima transfer bank, kartu kredit/debit, dan dompet digital (GoPay, OVO, DANA).' },
                            { q: 'Apakah ada uji coba gratis untuk paket berbayar?', a: 'Paket Free sudah bisa digunakan selamanya tanpa biaya. Anda bisa upgrade kapan saja saat bisnis Anda berkembang.' },
                        ].map((item, i) => (
                            <div key={i} className="border-border border-b pb-4 last:border-0 last:pb-0">
                                <p className="mb-1 text-sm font-semibold">{item.q}</p>
                                <p className="text-muted-foreground text-sm">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
