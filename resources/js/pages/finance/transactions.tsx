import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type ExpenseCategory, type PaginatedData, type Transaction } from '@/types/mrp';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '/finance' },
    { title: 'Transaksi', href: '/finance/transactions' },
];

interface TransactionSummary {
    total_income: number;
    total_expense: number;
}

interface Props {
    transactions: PaginatedData<Transaction>;
    summary: TransactionSummary;
    expense_categories: ExpenseCategory[];
    filters: { type?: string; from?: string; to?: string };
}

const transactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number().min(1, 'Jumlah transaksi minimal Rp 1'),
    description: z.string().optional(),
    category: z.string().optional(),
    expense_category_id: z.string().optional(),
    reference: z.string().optional(),
    date: z.string().min(1, 'Tanggal transaksi wajib diisi'),
    payment_method: z.enum(['cash', 'transfer', 'credit']),
});

export default function Transactions({ transactions, summary, expense_categories, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'income' as 'income' | 'expense',
        amount: 0,
        description: '',
        category: '',
        expense_category_id: '',
        reference: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = transactionSchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        post('/finance/transactions', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const displayError = (field: keyof typeof errors) => clientErrors[field] || errors[field];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi" />
            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
                        <p className="text-muted-foreground text-sm">Semua catatan pemasukan dan pengeluaran</p>
                    </div>
                    <Dialog open={showForm} onOpenChange={setShowForm}>
                        <DialogTrigger asChild>
                            <Button className="inline-flex items-center gap-2 rounded-xl">
                                <Plus size={16} /> Catat Transaksi
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Catat Transaksi Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan nominal dan detail transaksi keuangan Anda.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['income', 'expense'] as const).map((t) => (
                                            <Button
                                                key={t}
                                                type="button"
                                                variant={data.type === t ? "default" : "outline"}
                                                onClick={() => setData('type', t)}
                                                className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${data.type === t ? (t === 'income' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700') : ''}`}
                                            >
                                                {t === 'income' ? '+ Pemasukan' : '- Pengeluaran'}
                                            </Button>
                                        ))}
                                    </div>
                                     <div className="grid gap-1">
                                         <Label htmlFor="amount">Jumlah (Rp) *</Label>
                                         <Input
                                             id="amount"
                                             type="text"
                                             value={formatRupiah(data.amount)}
                                             onChange={(e) => setData('amount', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                                             className={displayError('amount') ? 'border-rose-500' : ''}
                                         />
                                         {displayError('amount') && <p className="text-xs text-rose-500 mt-1">{displayError('amount')}</p>}
                                     </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="description">Keterangan</Label>
                                        <Input
                                            id="description"
                                            type="text"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi transaksi"
                                            className={displayError('description') ? 'border-rose-500' : ''}
                                        />
                                        {displayError('description') && <p className="text-xs text-rose-500 mt-1">{displayError('description')}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1">
                                            <Label htmlFor="date">Tanggal *</Label>
                                            <DatePicker
                                                value={data.date}
                                                onChange={(val) => setData('date', val)}
                                            />
                                            {displayError('date') && <p className="text-xs text-rose-500 mt-1">{displayError('date')}</p>}
                                        </div>
                                        <div className="grid gap-1">
                                            <Label htmlFor="payment_method">Metode</Label>
                                            <Select
                                                value={data.payment_method}
                                                onValueChange={(val) => setData('payment_method', val as any)}
                                            >
                                                <SelectTrigger id="payment_method" className="rounded-xl">
                                                    <SelectValue placeholder="Metode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="transfer">Transfer</SelectItem>
                                                    <SelectItem value="credit">Kredit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }} className="rounded-xl">
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing} className="rounded-xl px-6">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4">
                        <p className="text-muted-foreground text-xs">Total Pemasukan</p>
                        <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.total_income)}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4">
                        <p className="text-muted-foreground text-xs">Total Pengeluaran</p>
                        <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">{formatRupiah(summary.total_expense)}</p>
                    </div>
                    <div className={`rounded-2xl p-4 ${summary.total_income - summary.total_expense >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                        <p className="text-muted-foreground text-xs">Net Profit</p>
                        <p className={`mt-1 text-lg font-bold ${summary.total_income - summary.total_expense >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {formatRupiah(summary.total_income - summary.total_expense)}
                        </p>
                    </div>
                </div>

                {/* Transactions list */}
                <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-border border-b">
                                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">Tanggal</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">Keterangan</th>
                                    <th className="text-muted-foreground px-4 py-3 text-center text-xs font-semibold uppercase">Metode</th>
                                    <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold uppercase">Jumlah</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {transactions.data.length === 0 ? (
                                    <tr><td colSpan={5} className="text-muted-foreground py-12 text-center text-sm">Belum ada transaksi.</td></tr>
                                ) : (
                                    transactions.data.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="text-muted-foreground px-4 py-3 text-sm">{t.date}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`rounded-lg p-1.5 ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                                                        {t.type === 'income'
                                                            ? <ArrowUpRight size={12} className="text-emerald-600" />
                                                            : <ArrowDownRight size={12} className="text-rose-600" />}
                                                    </div>
                                                    <span className="text-sm">{t.description || (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-muted-foreground text-xs capitalize">{t.payment_method}</span>
                                            </td>
                                            <td className={`px-4 py-3 text-right text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => router.delete(`/finance/transactions/${t.id}`, { preserveScroll: true })}
                                                    className="text-muted-foreground hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
