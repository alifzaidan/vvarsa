import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type Event, type Product, type Transaction } from '@/types/mrp';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Package,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardStats {
    total_products: number;
    low_stock_products: number;
    sales_today: number;
    sales_month: number;
    expense_today: number;
    expense_month: number;
    net_today: number;
    net_month: number;
}

interface ChartDataPoint {
    date: string;
    sales: number;
}

interface Props {
    stats: DashboardStats;
    chart_data: ChartDataPoint[];
    recent_transactions: Transaction[];
    upcoming_events: Event[];
    low_stock_list: Product[];
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
}) {
    return (
        <div className="bg-card border-border rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm font-medium">{title}</p>
                <div className={`rounded-xl p-2.5 ${color}`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : null}
                    </div>
                )}
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border-border rounded-xl border px-4 py-3 shadow-lg">
                <p className="text-muted-foreground mb-1 text-xs">{label}</p>
                <p className="text-sm font-semibold text-emerald-500">{formatRupiah(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard({ stats, chart_data, recent_transactions, upcoming_events, low_stock_list }: Props) {
    const netPositive = stats.net_today >= 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* ── Header ──────────────────────────────────────────── */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Ringkasan performa bisnis Anda hari ini
                    </p>
                </div>

                {/* ── Stats Cards ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        title="Penjualan Hari Ini"
                        value={formatRupiah(stats.sales_today, true)}
                        subtitle={`Bulan ini: ${formatRupiah(stats.sales_month, true)}`}
                        icon={TrendingUp}
                        color="bg-emerald-500"
                        trend="up"
                    />
                    <StatCard
                        title="Pengeluaran Hari Ini"
                        value={formatRupiah(stats.expense_today, true)}
                        subtitle={`Bulan ini: ${formatRupiah(stats.expense_month, true)}`}
                        icon={TrendingDown}
                        color="bg-rose-500"
                        trend="down"
                    />
                    <StatCard
                        title="Net Profit Hari Ini"
                        value={formatRupiah(Math.abs(stats.net_today), true)}
                        subtitle={netPositive ? 'Untung' : 'Rugi'}
                        icon={Wallet}
                        color={netPositive ? 'bg-blue-500' : 'bg-orange-500'}
                        trend={netPositive ? 'up' : 'down'}
                    />
                    <StatCard
                        title="Stok Kritis"
                        value={String(stats.low_stock_products)}
                        subtitle={`dari ${stats.total_products} produk`}
                        icon={stats.low_stock_products > 0 ? AlertTriangle : Package}
                        color={stats.low_stock_products > 0 ? 'bg-amber-500' : 'bg-slate-500'}
                    />
                </div>

                {/* ── Chart + Low Stock ────────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Chart */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm lg:col-span-2">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">Penjualan 7 Hari Terakhir</h2>
                                <p className="text-muted-foreground text-xs">Tren pendapatan mingguan</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chart_data}>
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => formatRupiah(v, true)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    fill="url(#salesGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Stok Kritis</h2>
                            <Link href="/inventory?low_stock=1" className="text-primary text-xs hover:underline">
                                Lihat semua
                            </Link>
                        </div>
                        {low_stock_list.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package size={32} className="text-emerald-500 mb-2" />
                                <p className="text-muted-foreground text-sm">Semua stok aman!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {low_stock_list.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{p.name}</p>
                                            <p className="text-muted-foreground text-xs">{p.category?.name}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${p.current_stock <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                {p.current_stock} {p.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Recent Transactions + Events ─────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Transactions */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Transaksi Terbaru</h2>
                            <Link href="/finance/transactions" className="text-primary text-xs hover:underline">
                                Lihat semua
                            </Link>
                        </div>
                        {recent_transactions.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">Belum ada transaksi.</p>
                        ) : (
                            <div className="space-y-3">
                                {recent_transactions.map((t) => (
                                    <div key={t.id} className="flex items-center gap-3">
                                        <div className={`rounded-xl p-2 ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                                            {t.type === 'income'
                                                ? <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                : <ArrowDownRight size={14} className="text-rose-600 dark:text-rose-400" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{t.description || (t.type === 'income' ? 'Penjualan' : 'Pengeluaran')}</p>
                                            <p className="text-muted-foreground text-xs">{t.date}</p>
                                        </div>
                                        <span className={`shrink-0 text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount, true)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Event Mendatang</h2>
                            <Link href="/events" className="text-primary text-xs hover:underline">
                                Lihat semua
                            </Link>
                        </div>
                        {upcoming_events.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">Tidak ada event mendatang.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcoming_events.map((e) => (
                                    <Link key={e.id} href={`/events/${e.id}`} className="hover:bg-muted/50 -mx-2 flex items-start gap-3 rounded-xl p-2 transition-colors">
                                        <div className="bg-primary/10 text-primary flex flex-col items-center rounded-xl px-3 py-2 text-center">
                                            <span className="text-xs font-semibold">
                                                {new Date(e.start_date).toLocaleString('id-ID', { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold leading-none">
                                                {new Date(e.start_date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{e.title}</p>
                                            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                                                <CalendarDays size={11} />
                                                <span>{e.city}</span>
                                                {e.registration_fee === 0 && (
                                                    <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        GRATIS
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ─────────────────────────────────────── */}
                <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: 'Tambah Produk', href: '/inventory/create', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400', icon: Package },
                            { label: 'Stok Masuk', href: '/inventory/stock-in', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400', icon: TrendingUp },
                            { label: 'Catat Transaksi', href: '/finance/transactions', color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-400', icon: Wallet },
                            { label: 'Lihat Event', href: '/events', color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400', icon: CalendarDays },
                        ].map(({ label, href, color, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center transition-colors ${color}`}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-medium">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
