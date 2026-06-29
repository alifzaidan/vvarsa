import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Product } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventori', href: '/inventory' },
    { title: 'Stok Opname', href: '/inventory/opname' },
];

interface Props {
    products: Product[];
}

interface OpnameItem {
    product_id: number;
    actual_stock: number;
    note: string;
}

const opnameSchema = z.object({
    opname_date: z.string().min(1, 'Tanggal opname wajib diisi'),
    items: z.array(
        z.object({
            product_id: z.number(),
            actual_stock: z.number().min(0, 'Stok aktual tidak boleh negatif'),
            note: z.string().optional(),
        })
    ),
});

export default function Opname({ products }: Props) {
    const [items, setItems] = useState<OpnameItem[]>(
        products.map((p) => ({
            product_id: p.id,
            actual_stock: p.current_stock,
            note: '',
        }))
    );
    const [opname_date, setOpnameDate] = useState(new Date().toISOString().split('T')[0]);
    const [processing, setProcessing] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const updateItem = (productId: number, field: keyof OpnameItem, value: number | string) => {
        setItems((prev) => prev.map((item) => item.product_id === productId ? { ...item, [field]: value } : item));
    };

    const getDifference = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        const item = items.find((i) => i.product_id === productId);
        if (!product || !item) return 0;
        return item.actual_stock - product.current_stock;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = opnameSchema.safeParse({ opname_date, items });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        setProcessing(true);
        router.post('/inventory/opname', { items: items as any, opname_date }, {
            onFinish: () => setProcessing(false),
        });
    };

    const changedCount = items.filter((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return product && item.actual_stock !== product.current_stock;
    }).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok Opname" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl">
                            <Link href="/inventory">
                                <ArrowLeft size={18} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Stok Opname</h1>
                            <p className="text-muted-foreground text-sm">
                                Cocokkan stok sistem dengan stok fisik aktual
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <DatePicker
                            value={opname_date}
                            onChange={(val) => setOpnameDate(val)}
                        />
                    </div>
                </div>

                {changedCount > 0 && (
                    <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        {changedCount} produk akan diupdate stoknya.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4 py-3">Produk</TableHead>
                                    <TableHead className="px-4 py-3 text-center">Stok Sistem</TableHead>
                                    <TableHead className="px-4 py-3 text-center">Stok Aktual</TableHead>
                                    <TableHead className="px-4 py-3 text-center">Selisih</TableHead>
                                    <TableHead className="px-4 py-3">Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product, idx) => {
                                    const item = items.find((i) => i.product_id === product.id)!;
                                    const diff = getDifference(product.id);
                                    return (
                                        <TableRow key={product.id} className={`${diff !== 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                                            <TableCell className="px-4 py-3">
                                                <p className="text-sm font-medium">{product.name}</p>
                                                <p className="text-muted-foreground text-xs">{product.category?.name}</p>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <span className="text-muted-foreground text-sm">{product.current_stock} {product.unit}</span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.actual_stock}
                                                    onChange={(e) => updateItem(product.id, 'actual_stock', parseInt(e.target.value) || 0)}
                                                    className="w-24 text-center rounded-xl mx-auto h-9"
                                                />
                                                {clientErrors[`items.${idx}.actual_stock`] && (
                                                    <p className="text-xs text-rose-500 mt-1">{clientErrors[`items.${idx}.actual_stock`]}</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <span className={`text-sm font-semibold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                                                    {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Input
                                                    type="text"
                                                    value={item.note}
                                                    onChange={(e) => updateItem(product.id, 'note', e.target.value)}
                                                    placeholder="Catatan..."
                                                    className="w-full rounded-xl h-9"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/inventory">
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || changedCount === 0}
                            className="inline-flex items-center gap-2 rounded-xl"
                        >
                            <Save size={16} />
                            {processing ? 'Menyimpan...' : `Simpan Opname (${changedCount} perubahan)`}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
