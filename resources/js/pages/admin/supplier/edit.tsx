import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Supplier } from './columns'; // Pastikan import ini sesuai dengan file columns.tsx kamu

interface Props {
    supplier: Supplier;
}

export default function SupplierEdit({ supplier }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin' },
        { title: 'Supplier', href: '/admin/supplier' },
        { title: 'Edit Supplier', href: `/admin/supplier/${supplier.id}/edit` },
    ];

    // Inisialisasi form state menggunakan data bawaan supplier
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || '',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        website: supplier.website || '',
        city: supplier.city || '',
        address: supplier.address || '',
        business_type: supplier.business_type || '',
        description: supplier.description || '',
        is_verified: !!supplier.is_verified,
        is_active: !!supplier.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Gunakan method put untuk update data ke rute yang spesifik
        put(`/admin/supplier/${supplier.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Supplier" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Supplier</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Perbarui informasi detail mengenai supplier ini.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <form onSubmit={submit} className="p-6 space-y-8">

                        {/* Section: Informasi Dasar */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Nama Supplier <span className="text-red-500">*</span></label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="PT / CV / Nama Toko"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="business_type" className="text-sm font-medium">Tipe Bisnis</label>
                                    <select
                                        id="business_type"
                                        value={data.business_type}
                                        onChange={(e) => setData('business_type', e.target.value)}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Pilih Tipe Bisnis</option>
                                        <option value="FNB">F&B (Makanan/Minuman)</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Grosir">Grosir</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    {errors.business_type && <p className="text-xs text-red-500">{errors.business_type}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Kontak */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Kontak & Lokasi</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="contact_name" className="text-sm font-medium">Nama PIC / Kontak</label>
                                    <Input
                                        id="contact_name"
                                        value={data.contact_name}
                                        onChange={(e) => setData('contact_name', e.target.value)}
                                        placeholder="Nama orang yang bisa dihubungi"
                                    />
                                    {errors.contact_name && <p className="text-xs text-red-500">{errors.contact_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium">Nomor Telepon/WA</label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="0812xxxxxx"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@perusahaan.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="website" className="text-sm font-medium">Website</label>
                                    <Input
                                        id="website"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-sm font-medium">Kota</label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Nama Kota"
                                    />
                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="address" className="text-sm font-medium">Alamat Lengkap</label>
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    ></textarea>
                                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Pengaturan & Lainnya */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Lainnya</h2>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">Deskripsi / Catatan Tambahan</label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Catatan khusus tentang supplier ini..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                ></textarea>
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    <span className="text-sm font-medium">Supplier Aktif</span>
                                </label>

                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_verified}
                                        onChange={(e) => setData('is_verified', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    <span className="text-sm font-medium">Terverifikasi</span>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/supplier">Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Perbarui Supplier'}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}