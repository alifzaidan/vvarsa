import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData, type TaxReport } from '@/types/mrp';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { columns } from './columns';
import { DataTable } from './data-table';
import { z } from 'zod';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pajak', href: '/tax' },
];

interface Props {
    reports: PaginatedData<TaxReport>;
}

const TAX_TYPES = ['PPh 21', 'PPh 23', 'PPh Final UMKM (0.5%)', 'PPN', 'PPnBM'];

const taxSchema = z.object({
    period: z.string().min(1, 'Periode wajib diisi'),
    tax_type: z.string().min(1, 'Jenis pajak wajib diisi'),
    gross_amount: z.number().min(0, 'Omzet bruto tidak boleh negatif'),
    tax_amount: z.number().min(0, 'Jumlah pajak tidak boleh negatif'),
    status: z.enum(['draft', 'submitted', 'paid']),
    notes: z.string().optional(),
    due_date: z.string().optional(),
});

export default function TaxIndex({ reports }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors, reset } = useForm({
        period: '',
        tax_type: 'PPh Final UMKM (0.5%)',
        gross_amount: 0,
        tax_amount: 0,
        status: 'draft',
        notes: '',
        due_date: '',
    });

    const calculateTax = () => {
        const rate = data.tax_type === 'PPh Final UMKM (0.5%)' ? 0.005 : data.tax_type === 'PPN' ? 0.11 : 0;
        if (rate > 0) setData('tax_amount', Math.round(data.gross_amount * rate));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = taxSchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        post('/tax', { 
            onSuccess: () => { 
                reset(); 
                setIsAddOpen(false); 
            } 
        });
    };

    const displayError = (field: keyof typeof errors) => clientErrors[field] || errors[field];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Pajak" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Laporan Pajak</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Kelola kewajiban pajak bisnis Anda</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/tax/consultation">
                                Konsultasi Pajak
                            </Link>
                        </Button>
                        
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="inline-flex items-center gap-2 rounded-xl">
                                    <Plus size={16} /> Laporan Baru
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>Buat Laporan Pajak Baru</DialogTitle>
                                        <DialogDescription>
                                            Masukkan omzet bruto dan detail lainnya untuk menyimpan laporan perpajakan.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="period">Periode</Label>
                                                <Input 
                                                    id="period"
                                                    type="text" 
                                                    value={data.period} 
                                                    onChange={(e) => setData('period', e.target.value)} 
                                                    placeholder="2026-06" 
                                                    className={displayError('period') ? 'border-rose-500' : ''}
                                                    required 
                                                />
                                                {displayError('period') && <p className="text-xs text-rose-500">{displayError('period')}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="tax_type">Jenis Pajak</Label>
                                                <Select
                                                    value={data.tax_type}
                                                    onValueChange={(val) => setData('tax_type', val)}
                                                >
                                                    <SelectTrigger id="tax_type" className="rounded-xl h-9">
                                                        <SelectValue placeholder="Jenis Pajak" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TAX_TYPES.map((t) => (
                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="gross_amount">Omzet Bruto (Rp)</Label>
                                            <Input 
                                                id="gross_amount"
                                                type="text" 
                                                value={formatRupiah(data.gross_amount)} 
                                                onChange={(e) => setData('gross_amount', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)} 
                                                onBlur={calculateTax} 
                                                className={displayError('gross_amount') ? 'border-rose-500' : ''}
                                                required
                                            />
                                            {displayError('gross_amount') && <p className="text-xs text-rose-500">{displayError('gross_amount')}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="tax_amount">Jumlah Pajak (Rp)</Label>
                                            <Input 
                                                id="tax_amount"
                                                type="text" 
                                                value={formatRupiah(data.tax_amount)} 
                                                onChange={(e) => setData('tax_amount', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)} 
                                                className={displayError('tax_amount') ? 'border-rose-500' : ''}
                                                required
                                            />
                                            {displayError('tax_amount') && <p className="text-xs text-rose-500">{displayError('tax_amount')}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(val) => setData('status', val as any)}
                                                >
                                                    <SelectTrigger id="status" className="rounded-xl h-9">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="submitted">Dilaporkan</SelectItem>
                                                        <SelectItem value="paid">Lunas</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5 flex flex-col justify-end">
                                                <Label htmlFor="due_date" className="mb-0.5">Jatuh Tempo</Label>
                                                <DatePicker
                                                    value={data.due_date}
                                                    onChange={(val) => setData('due_date', val)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); reset(); }} className="rounded-xl">
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
                </div>

                {/* Tax Info Banner */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 dark:bg-indigo-950/10 dark:border-indigo-900/30">
                    <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">Info Pajak UMKM 2026</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        UMKM dengan omzet hingga <strong>Rp 4,8 miliar/tahun</strong> dikenakan PPh Final sebesar <strong>0,5%</strong> dari omzet bruto.
                        Dibayarkan paling lambat tanggal <strong>15 bulan berikutnya</strong>.
                    </p>
                </div>

                {/* Reports table */}
                <div className="space-y-4">
                    <DataTable columns={columns} data={reports.data} />

                    {/* Pagination */}
                    {reports.last_page > 1 && (
                        <div className="border-border flex items-center justify-between border-t bg-card px-4 py-3 rounded-xl border shadow-sm">
                            <p className="text-muted-foreground text-sm">
                                Menampilkan {(reports.current_page - 1) * reports.per_page + 1}–{Math.min(reports.current_page * reports.per_page, reports.total)} dari {reports.total} laporan
                            </p>
                            <div className="flex gap-1">
                                {reports.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? "default" : "outline"}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className="h-8 px-3 rounded-lg text-xs"
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
