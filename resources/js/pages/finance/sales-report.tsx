import AppLayout from '@/layouts/app-layout';
import { formatRupiah, MONTHS_ID } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '/finance' },
    { title: 'Laporan Penjualan', href: '/finance/sales-report' },
];

interface Props {
    data: { day?: number; month?: number; year?: number; total: number; count: number }[];
    total_sales: number;
    period: string;
    year: number;
    month: number;
    today_sales: number;
    month_sales: number;
}

export default function SalesReport({ data, total_sales, period, year, month, today_sales, month_sales }: Props) {
    const chartData = data.map((d) => ({
        label: period === 'daily' ? `${d.day}` : period === 'monthly' ? MONTHS_ID[(d.month ?? 1) - 1] : String(d.year),
        total: d.total,
        count: d.count,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Penjualan" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Penjualan</h1>
                        <p className="text-muted-foreground text-sm">Analisis tren pendapatan bisnis Anda</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? "default" : "outline"}
                                onClick={() => router.get('/finance/sales-report', { period: p, year, month })}
                                className="h-8 rounded-xl px-3 text-xs"
                            >
                                {p === 'daily' ? 'Harian' : p === 'monthly' ? 'Bulanan' : 'Tahunan'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Period selector */}
                {period !== 'yearly' && (
                    <div className="bg-card border-border flex gap-3 rounded-2xl border p-4">
                        {period === 'daily' && (
                            <Select
                                value={String(month)}
                                onValueChange={(val) => router.get('/finance/sales-report', { period, year, month: val })}
                            >
                                <SelectTrigger className="w-[140px] rounded-xl">
                                    <SelectValue placeholder="Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS_ID.map((m, i) => (
                                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Select
                            value={String(year)}
                            onValueChange={(val) => router.get('/finance/sales-report', { period, year: val, month })}
                        >
                            <SelectTrigger className="w-[100px] rounded-xl">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026].map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border-border rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs">Penjualan Hari Ini</p>
                        <p className="mt-1 text-xl font-bold text-emerald-600">{formatRupiah(today_sales)}</p>
                    </div>
                    <div className="bg-card border-border rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs">Penjualan Bulan Ini</p>
                        <p className="mt-1 text-xl font-bold text-blue-600">{formatRupiah(month_sales)}</p>
                    </div>
                    <div className="bg-card border-border rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs">Total Periode Ini</p>
                        <p className="mt-1 text-xl font-bold">{formatRupiah(total_sales)}</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold">Grafik Penjualan</h2>
                    {chartData.length === 0 ? (
                        <div className="flex h-48 items-center justify-center text-center">
                            <p className="text-muted-foreground text-sm">Tidak ada data penjualan untuk periode ini.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRupiah(v, true)} />
                                <Tooltip formatter={(v: any) => [formatRupiah(Number(v)), 'Penjualan']} />
                                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} fill="url(#grad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
