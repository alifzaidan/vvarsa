import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Product } from '@/types/mrp';
import { Head, useForm, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useState } from 'react';
import { z } from 'zod';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventori', href: '/inventory' },
    { title: 'Stok Masuk', href: '/inventory/stock-in' },
];

interface Props {
    products: Product[];
}

const stockInSchema = z.object({
    product_id: z.string().min(1, 'Produk wajib dipilih'),
    qty: z.number().min(1, 'Jumlah masuk minimal 1'),
    unit_cost: z.number().min(0, 'Harga modal/unit tidak boleh negatif'),
    reference: z.string().optional(),
    note: z.string().optional(),
    movement_date: z.string().min(1, 'Tanggal wajib diisi'),
});

export default function StockIn({ products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        qty: 1,
        unit_cost: 0,
        reference: '',
        note: '',
        movement_date: new Date().toISOString().split('T')[0],
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const selectedProduct = products.find((p) => p.id === parseInt(data.product_id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = stockInSchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }
        
        post('/inventory/stock-in');
    };

    const displayError = (field: keyof typeof errors) => clientErrors[field] || errors[field];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok Masuk" />
            <div className="mx-auto max-w-xl p-4 md:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/inventory">
                            <ArrowLeft size={18} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Stok Masuk</h1>
                        <p className="text-muted-foreground text-sm">Catat penerimaan stok baru</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <div className="space-y-4">
                             <div>
                                <Label htmlFor="product_id" className="mb-1.5 block">Produk *</Label>
                                <Select
                                    value={data.product_id}
                                    onValueChange={(val) => {
                                        setData('product_id', val);
                                        const p = products.find((x) => x.id === parseInt(val));
                                        if (p) setData('unit_cost', p.cost_price);
                                    }}
                                >
                                    <SelectTrigger id="product_id" className={`rounded-xl h-10 ${displayError('product_id') ? 'border-rose-500' : ''}`}>
                                        <SelectValue placeholder="Pilih produk..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} (Stok: {p.current_stock} {p.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {displayError('product_id') && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                        <AlertCircle size={12} />
                                        {displayError('product_id')}
                                    </p>
                                )}
                            </div>

                            {selectedProduct && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm">
                                    <p className="font-medium text-blue-700 dark:text-blue-400">{selectedProduct.name}</p>
                                    <p className="text-blue-600 dark:text-blue-300 mt-0.5 text-xs">
                                        Stok sekarang: {selectedProduct.current_stock} {selectedProduct.unit} |
                                        Minimum: {selectedProduct.min_stock} {selectedProduct.unit}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="qty" className="mb-1.5 block">Jumlah Masuk *</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min={1}
                                        value={data.qty}
                                        onChange={(e) => setData('qty', parseInt(e.target.value) || 1)}
                                        className={displayError('qty') ? 'border-rose-500' : ''}
                                    />
                                    {selectedProduct && (
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Stok setelah: {selectedProduct.current_stock + (data.qty || 0)} {selectedProduct.unit}
                                        </p>
                                    )}
                                    {displayError('qty') && <p className="mt-1 text-xs text-rose-500">{displayError('qty')}</p>}
                                </div>
                                <div>
                                     <Label htmlFor="unit_cost" className="mb-1.5 block">Harga Modal/Unit (Rp)</Label>
                                     <Input
                                         id="unit_cost"
                                         type="text"
                                         value={formatRupiah(data.unit_cost)}
                                         onChange={(e) => setData('unit_cost', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                                     />
                                 </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="movement_date" className="block">Tanggal *</Label>
                                <DatePicker
                                    value={data.movement_date}
                                    onChange={(val) => setData('movement_date', val)}
                                />
                                {displayError('movement_date') && <p className="mt-1 text-xs text-rose-500">{displayError('movement_date')}</p>}
                            </div>

                            <div>
                                <Label htmlFor="reference" className="mb-1.5 block">No. Referensi</Label>
                                <Input
                                    id="reference"
                                    type="text"
                                    value={data.reference}
                                    onChange={(e) => setData('reference', e.target.value)}
                                    placeholder="No. PO / Invoice (opsional)"
                                />
                            </div>

                            <div>
                                <Label htmlFor="note" className="mb-1.5 block">Catatan</Label>
                                <Textarea
                                    id="note"
                                    rows={2}
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Catatan tambahan (opsional)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/inventory">
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.product_id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70 rounded-xl px-5"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Stok Masuk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
