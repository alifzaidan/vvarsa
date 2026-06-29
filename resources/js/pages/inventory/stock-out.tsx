import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Product } from '@/types/mrp';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useState } from 'react';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventori', href: '/inventory' },
    { title: 'Stok Keluar', href: '/inventory/stock-out' },
];

interface Props {
    products: Product[];
}

const stockOutSchema = z.object({
    product_id: z.string().min(1, 'Produk wajib dipilih'),
    qty: z.number().min(1, 'Jumlah keluar minimal 1'),
    reference: z.string().optional(),
    note: z.string().optional(),
    movement_date: z.string().min(1, 'Tanggal wajib diisi'),
});

export default function StockOut({ products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        qty: 1,
        reference: '',
        note: '',
        movement_date: new Date().toISOString().split('T')[0],
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const selectedProduct = products.find((p) => p.id === parseInt(data.product_id));
    const isInsufficientStock = selectedProduct && data.qty > selectedProduct.current_stock;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = stockOutSchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        if (isInsufficientStock) {
            setClientErrors((prev) => ({ ...prev, qty: 'Stok tidak mencukupi!' }));
            return;
        }
        
        post('/inventory/stock-out');
    };

    const displayError = (field: keyof typeof errors) => clientErrors[field] || errors[field];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok Keluar" />
            <div className="mx-auto max-w-xl p-4 md:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/inventory">
                            <ArrowLeft size={18} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Stok Keluar</h1>
                        <p className="text-muted-foreground text-sm">Catat penggunaan atau pengeluaran stok</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm space-y-4">
                        <div>
                            <Label htmlFor="product_id" className="mb-1.5 block">Produk *</Label>
                            <Select
                                value={data.product_id}
                                onValueChange={(val) => setData('product_id', val)}
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
                            <div className={`rounded-xl p-3 text-sm ${isInsufficientStock ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                <p className={`font-medium ${isInsufficientStock ? 'text-rose-700 dark:text-rose-400' : ''}`}>{selectedProduct.name}</p>
                                <p className={`mt-0.5 text-xs ${isInsufficientStock ? 'text-rose-600 dark:text-rose-300' : 'text-muted-foreground'}`}>
                                    Stok tersedia: {selectedProduct.current_stock} {selectedProduct.unit}
                                    {isInsufficientStock && ' — Stok tidak mencukupi!'}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="qty" className="mb-1.5 block">Jumlah Keluar *</Label>
                                <Input
                                    id="qty"
                                    type="number"
                                    min={1}
                                    max={selectedProduct?.current_stock}
                                    value={data.qty}
                                    onChange={(e) => setData('qty', parseInt(e.target.value) || 1)}
                                    className={displayError('qty') ? 'border-rose-500' : ''}
                                />
                                {selectedProduct && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Stok setelah: {Math.max(0, selectedProduct.current_stock - (data.qty || 0))} {selectedProduct.unit}
                                    </p>
                                )}
                                {displayError('qty') && <p className="mt-1 text-xs text-rose-500">{displayError('qty')}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="movement_date" className="block">Tanggal *</Label>
                                <DatePicker
                                    value={data.movement_date}
                                    onChange={(val) => setData('movement_date', val)}
                                />
                                {displayError('movement_date') && <p className="mt-1 text-xs text-rose-500">{displayError('movement_date')}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="reference" className="mb-1.5 block">No. Referensi</Label>
                            <Input
                                id="reference"
                                type="text"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                placeholder="No. pesanan / keperluan (opsional)"
                            />
                        </div>

                        <div>
                            <Label htmlFor="note" className="mb-1.5 block">Catatan</Label>
                            <Textarea
                                id="note"
                                rows={2}
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                placeholder="Alasan pengeluaran stok (opsional)"
                            />
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
                            disabled={processing || !data.product_id || !!isInsufficientStock}
                            className="bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-70 rounded-xl px-5"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Stok Keluar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
