import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ProductVariant } from '@/types/mrp';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PackageModel {
    id: number;
    name: string;
    capacity: number;
    price: string | number;
    is_active: boolean;
    description: string | null;
    variants?: ProductVariant[];
}

interface Props {
    package: PackageModel;
    variants: ProductVariant[];
}

export default function PackageEdit({ package: pkg, variants }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name,
        capacity: pkg.capacity,
        price: pkg.price.toString(),
        is_active: pkg.is_active,
        description: pkg.description ?? '',
        variant_ids: (pkg.variants ?? []).map(v => v.id),
    });

    const [allVariantsAllowed, setAllVariantsAllowed] = useState(
        !pkg.variants || pkg.variants.length === 0
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Paket Produk', href: '/packages' },
        { title: `Edit ${pkg.name}`, href: `/packages/${pkg.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // If "all allowed", we pass an empty array to the backend to mean "no limits"
        const submissionData = {
            ...data,
            variant_ids: allVariantsAllowed ? [] : data.variant_ids,
        };

        put(`/packages/${pkg.id}`, {
            data: submissionData as any,
        });
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setData('variant_ids', [...data.variant_ids, id]);
        } else {
            setData('variant_ids', data.variant_ids.filter(vId => vId !== id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Paket ${pkg.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                        <Link href="/packages">
                            <ArrowLeft size={14} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Package className="text-indigo-500" size={22} />
                            Edit Paket Produk
                        </h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Ubah pengaturan paket harga atau batasan rasanya
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        {/* Name */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="name">Nama Paket *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="cth: Paket 3 Mix Mochi"
                                required
                                className="rounded-xl text-sm"
                            />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        {/* Capacity & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="capacity">Kapasitas Isi (Pcs) *</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min={1}
                                    value={data.capacity}
                                    onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)}
                                    required
                                    className="rounded-xl text-sm"
                                />
                                {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity}</p>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="price">Harga Bundle (Rp) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min={0}
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="cth: 18000"
                                    required
                                    className="rounded-xl text-sm"
                                />
                                {errors.price && <p className="text-xs text-rose-500">{errors.price}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Catatan opsional mengenai paket..."
                                className="rounded-xl text-sm min-h-[80px]"
                            />
                            {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Paket aktif dan dapat dipilih di Kasir</Label>
                        </div>
                    </div>

                    {/* Varian Mochi Pembatas */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Batasan Varian Rasa</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Pilih rasa mochi apa saja yang diperbolehkan di dalam paket ini
                                </p>
                            </div>
                        </div>

                        {/* Toggle All Allowed */}
                        <div className="flex items-center gap-2 border-b border-border pb-3">
                            <input
                                id="all_allowed"
                                type="checkbox"
                                checked={allVariantsAllowed}
                                onChange={(e) => setAllVariantsAllowed(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor="all_allowed" className="font-semibold text-sm cursor-pointer">
                                Bebas Mix (Semua rasa diperbolehkan)
                            </Label>
                        </div>

                        {/* Checkbox List of variants */}
                        {!allVariantsAllowed && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {variants.map((v) => (
                                    <div key={v.id} className="flex items-center gap-2 p-2 hover:bg-muted/40 rounded-xl transition-colors">
                                        <input
                                            id={`var-${v.id}`}
                                            type="checkbox"
                                            checked={data.variant_ids.includes(v.id)}
                                            onChange={(e) => handleCheckboxChange(v.id, e.target.checked)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Label htmlFor={`var-${v.id}`} className="text-sm cursor-pointer leading-tight">
                                            {v.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.variant_ids && <p className="text-xs text-rose-500">{errors.variant_ids}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/packages">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5">
                            <Save size={16} />
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
