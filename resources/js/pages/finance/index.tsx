import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '/finance' },
];

interface MonthData {
    label: string;
    income: number;
    expense: number;
    profit: number;
}

interface Props {
    twelve_months: MonthData[];
    today: { income: number; expense: number };
    this_month: { income: number; expense: number };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border-border rounded-xl border px-4 py-3 shadow-lg">
                <p className="text-muted-foreground mb-2 text-xs font-medium">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} className="text-xs" style={{ color: p.color }}>
                        {p.name}: {formatRupiah(p.value, true)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function FinanceIndex({ twelve_months, today, this_month }: Props) {
    const netToday = today.income - today.expense;
    const netMonth = this_month.income - this_month.expense;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ringkasan Keuangan" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ringkasan Keuangan</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Pantau arus kas dan performa finansial bisnis Anda</p>
                </div>

                {/* Today & Month Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { title: 'Penjualan Hari Ini', value: today.income, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                        { title: 'Pengeluaran Hari Ini', value: today.expense, color: 'text-rose-600', bg: 'bg-rose-500/10' },
                        { title: 'Penjualan Bulan Ini', value: this_month.income, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                        { title: 'Pengeluaran Bulan Ini', value: this_month.expense, color: 'text-orange-600', bg: 'bg-orange-500/10' },
                    ].map(({ title, value, color, bg }) => (
                        <div key={title} className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                            <p className="text-muted-foreground mb-2 text-sm">{title}</p>
                            <p className={`text-xl font-bold ${color}`}>{formatRupiah(value, true)}</p>
                        </div>
                    ))}
                </div>

                {/* Net profit highlight */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className={`rounded-2xl p-5 ${netToday >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <p className="text-sm font-medium">Net Profit Hari Ini</p>
                        <p className={`text-2xl font-bold ${netToday >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {netToday >= 0 ? '+' : ''}{formatRupiah(netToday)}
                        </p>
                    </div>
                    <div className={`rounded-2xl p-5 ${netMonth >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <p className="text-sm font-medium">Net Profit Bulan Ini</p>
                        <p className={`text-2xl font-bold ${netMonth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {netMonth >= 0 ? '+' : ''}{formatRupiah(netMonth)}
                        </p>
                    </div>
                </div>

                {/* 12-Month Chart */}
                <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">Tren 12 Bulan Terakhir</h2>
                            <p className="text-muted-foreground text-xs">Perbandingan pendapatan vs pengeluaran</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={twelve_months} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => formatRupiah(v, true)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="income" name="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Transaksi', href: '/finance/transactions', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                        { label: 'Laporan Penjualan', href: '/finance/sales-report', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                        { label: 'Laporan Pengeluaran', href: '/finance/expense-report', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400' },
                    ].map(({ label, href, color }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`rounded-2xl p-4 text-center text-sm font-medium transition-opacity hover:opacity-80 ${color}`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
