import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductCategory } from '@/types/mrp';
import { Head, useForm, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventori', href: '/inventory' },
    { title: 'Tambah Produk', href: '/inventory/create' },
];

interface Props {
    categories: ProductCategory[];
}

const UNITS = ['pcs', 'kg', 'gram', 'liter', 'ml', 'box', 'karton', 'porsi', 'gelas', 'botol', 'pak', 'lusin'];

const productSchema = z.object({
    name: z.string().min(1, 'Nama produk wajib diisi'),
    sku: z.string().optional(),
    category_id: z.string().optional(),
    unit: z.string().min(1, 'Satuan wajib diisi'),
    min_stock: z.number().min(0, 'Stok minimum tidak boleh negatif'),
    purchase_price: z.number().min(0, 'Harga beli tidak boleh negatif'),
    purchase_qty: z.number().min(0.001, 'Isi kemasan tidak boleh kosong atau negatif'),
    sell_price: z.number().min(0, 'Harga jual tidak boleh negatif').optional().default(0),
    description: z.string().optional(),
});

export default function InventoryCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        category_id: '',
        unit: 'pcs',
        min_stock: 0,
        purchase_price: 0,
        purchase_qty: 1,
        sell_price: 0,
        description: '',
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = productSchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }
        
        post('/inventory');
    };

    const costPrice = data.purchase_qty > 0 ? data.purchase_price / data.purchase_qty : 0;
    const margin = data.sell_price > 0
        ? Math.round(((data.sell_price - costPrice) / data.sell_price) * 100)
        : 0;

    const displayError = (field: keyof typeof errors) => clientErrors[field] || errors[field];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Produk" />
            <div className="mx-auto max-w-2xl p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Produk</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Isi detail produk baru Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold text-foreground">Informasi Dasar</h2>
                        
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Produk *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="contoh: Nasi Goreng Spesial"
                                className={displayError('name') ? 'border-rose-500' : ''}
                                required
                            />
                            {displayError('name') && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle size={12} />
                                    {displayError('name')}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    type="text"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder="Kode produk (opsional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Kategori</Label>
                                <Select
                                    value={data.category_id || undefined}
                                    onValueChange={(val) => setData('category_id', val)}
                                >
                                    <SelectTrigger id="category_id" className="rounded-xl">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unit">Satuan *</Label>
                                <Select
                                    value={data.unit}
                                    onValueChange={(val) => setData('unit', val)}
                                >
                                    <SelectTrigger id="unit" className="rounded-xl">
                                        <SelectValue placeholder="Pilih satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNITS.map((u) => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min_stock">Stok Minimum</Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    min={0}
                                    value={data.min_stock}
                                    onChange={(e) => setData('min_stock', parseInt(e.target.value) || 0)}
                                />
                                <p className="text-muted-foreground text-[11px]">Peringatan dikirim saat stok ≤ nilai ini</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold text-foreground">Harga & Kemasan</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="purchase_price">Harga Beli Kemasan (Rp) *</Label>
                                <Input
                                    id="purchase_price"
                                    type="text"
                                    value={formatRupiah(data.purchase_price)}
                                    onChange={(e) => setData('purchase_price', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                                    className={displayError('purchase_price') ? 'border-rose-500' : ''}
                                    required
                                />
                                {displayError('purchase_price') && <p className="text-xs text-rose-500 mt-1">{displayError('purchase_price')}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchase_qty">Isi Kemasan *</Label>
                                <Input
                                    id="purchase_qty"
                                    type="number"
                                    step="any"
                                    min={0.1}
                                    value={data.purchase_qty}
                                    onChange={(e) => setData('purchase_qty', parseFloat(e.target.value) || 0)}
                                    className={displayError('purchase_qty') ? 'border-rose-500' : ''}
                                    required
                                />
                                {displayError('purchase_qty') && <p className="text-xs text-rose-500 mt-1">{displayError('purchase_qty')}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sell_price">Harga Jual (Rp) (Opsional)</Label>
                                <Input
                                    id="sell_price"
                                    type="text"
                                    value={formatRupiah(data.sell_price)}
                                    onChange={(e) => setData('sell_price', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                                    className={displayError('sell_price') ? 'border-rose-500' : ''}
                                />
                                {displayError('sell_price') && <p className="text-xs text-rose-500 mt-1">{displayError('sell_price')}</p>}
                            </div>
                        </div>
                        {data.purchase_qty > 0 && data.purchase_price > 0 && (
                            <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                                Estimasi Harga Modal per {data.unit}: <strong>{formatRupiah(data.purchase_price / data.purchase_qty)}</strong>
                            </div>
                        )}
                        {data.sell_price > 0 && costPrice > 0 && (
                            <div className={`rounded-xl p-3 text-sm ${margin >= 20 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                Margin keuntungan: <strong>{margin}%</strong>
                                {margin < 20 && ' — margin rendah, pertimbangkan kembali harga jual'}
                            </div>
                        )}
                    </div>

                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm space-y-2">
                        <Label htmlFor="description">Deskripsi (Opsional)</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tambahkan catatan atau deskripsi produk..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/inventory">
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl px-6"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Produk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
