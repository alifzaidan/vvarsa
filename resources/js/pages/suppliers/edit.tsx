import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Supplier } from '@/types/mrp';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

const BUSINESS_TYPES = [
    { value: '', label: 'Pilih Jenis Bisnis' },
    { value: 'fnb', label: 'Food & Beverage (FnB)' },
    { value: 'retail', label: 'Retail' },
    { value: 'fashion', label: 'Fashion' },
];

interface Props {
    supplier: Supplier;
}

export default function SupplierEdit({ supplier }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Supplier', href: '/suppliers' },
        { title: 'Edit', href: `/suppliers/${supplier.id}/edit` },
    ];

    // Inisialisasi state form dengan data supplier yang sudah ada
    const { data, setData, put, processing, errors, transform, reset } = useForm({
        name: supplier.name || '',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        website: supplier.website || '',
        address: supplier.address || '',
        city: supplier.city || '',
        business_type: supplier.business_type || '',
        // Ubah array/JSON product_categories dari database kembali menjadi string (koma)
        product_categories: Array.isArray(supplier.product_categories)
            ? supplier.product_categories.join(', ')
            : '',
        description: supplier.description || '',
    });

    // Ubah string product_categories menjadi array sebelum dikirim kembali ke backend
    transform((data) => ({
        ...data,
        product_categories: data.product_categories
            ? data.product_categories.split(',').map((cat) => cat.trim()).filter(Boolean)
            : [],
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Menggunakan method PUT untuk update data
        put(`/suppliers/${supplier.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Supplier" />

            <div className="mx-auto max-w-4xl p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Supplier</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Perbarui informasi untuk supplier <span className="font-semibold text-foreground">{supplier.name}</span>.
                        </p>
                    </div>
                    <Link
                        href="/suppliers"
                        className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>
                </div>

                <div className="bg-card border-border rounded-2xl border p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Basic Information */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold">Informasi Dasar</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-sm font-medium">Nama Supplier <span className="text-red-500">*</span></label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="business_type" className="text-sm font-medium">Jenis Bisnis</label>
                                    <select
                                        id="business_type"
                                        value={data.business_type}
                                        onChange={(e) => setData('business_type', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {BUSINESS_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.business_type && <p className="text-xs text-red-500">{errors.business_type}</p>}
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label htmlFor="product_categories" className="text-sm font-medium">Kategori Produk</label>
                                    <input
                                        id="product_categories"
                                        type="text"
                                        placeholder="Contoh: Sayuran, Daging, Bumbu Dapur (pisahkan dengan koma)"
                                        value={data.product_categories}
                                        onChange={(e) => setData('product_categories', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.product_categories && <p className="text-xs text-red-500">{errors.product_categories}</p>}
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label htmlFor="description" className="text-sm font-medium">Deskripsi Singkat</label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-border" />

                        {/* Contact & Location Info */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold">Kontak & Lokasi</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label htmlFor="contact_name" className="text-sm font-medium">Nama Kontak (PIC)</label>
                                    <input
                                        id="contact_name"
                                        type="text"
                                        value={data.contact_name}
                                        onChange={(e) => setData('contact_name', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.contact_name && <p className="text-xs text-red-500">{errors.contact_name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="phone" className="text-sm font-medium">Nomor Telepon</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="website" className="text-sm font-medium">Website / Social Media</label>
                                    <input
                                        id="website"
                                        type="url"
                                        placeholder="https://..."
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label htmlFor="city" className="text-sm font-medium">Kota</label>
                                    <input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label htmlFor="address" className="text-sm font-medium">Alamat Lengkap</label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="border-border bg-background w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="border-border bg-background hover:bg-muted rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Kembalikan (Reset)
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-70"
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan...' : 'Perbarui Supplier'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}