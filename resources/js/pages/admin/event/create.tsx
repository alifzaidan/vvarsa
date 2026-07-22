import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Events', href: '/admin/events' },
    { title: 'Tambah Event', href: '/admin/events/create' },
];

const BUSINESS_TYPES = [
    { id: 'fnb', label: 'FnB (Makanan & Minuman)' },
    { id: 'retail', label: 'Retail' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'general', label: 'Umum' },
    { id: 'service', label: 'Jasa' },
];

export default function EventCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        organizer: '',
        business_types: [] as string[],
        location: '',
        city: '',
        description: '',
        image: null as File | null,
        start_date: '',
        end_date: '',
        max_participants: '' as string | number,
        registration_fee: 0 as number,
        registration_url: '',
        allow_platform_registration: true as boolean,
        status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
        is_featured: false as boolean,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/events');
    };

    const handleBusinessTypeChange = (id: string, checked: boolean) => {
        if (checked) {
            setData('business_types', [...data.business_types, id]);
        } else {
            setData('business_types', data.business_types.filter((t) => t !== id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Event Baru" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Buat Event Baru</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Masukkan rincian informasi untuk membuat event baru bagi para tenant.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <form onSubmit={submit} className="p-6 space-y-8">
                        {/* Section: Informasi Event */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Informasi Event</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="title" className="text-sm font-medium">Judul Event <span className="text-red-500">*</span></label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Webinar Pelatihan Finansial UKM"
                                        autoFocus
                                    />
                                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="organizer" className="text-sm font-medium">Penyelenggara / Organizer <span className="text-red-500">*</span></label>
                                    <Input
                                        id="organizer"
                                        value={data.organizer}
                                        onChange={(e) => setData('organizer', e.target.value)}
                                        placeholder="Contoh: VVarsa Community"
                                    />
                                    {errors.organizer && <p className="text-xs text-red-500">{errors.organizer}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="status" className="text-sm font-medium">Status Event <span className="text-red-500">*</span></label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'upcoming' | 'ongoing' | 'completed' | 'cancelled')}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="upcoming">Mendatang (Upcoming)</option>
                                        <option value="ongoing">Berjalan (Ongoing)</option>
                                        <option value="completed">Selesai (Completed)</option>
                                        <option value="cancelled">Dibatalkan (Cancelled)</option>
                                    </select>
                                    {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium block">Target Tipe Bisnis</label>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {BUSINESS_TYPES.map((type) => (
                                            <div key={type.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`type-${type.id}`}
                                                    checked={data.business_types.includes(type.id)}
                                                    onCheckedChange={(checked) => handleBusinessTypeChange(type.id, !!checked)}
                                                />
                                                <label htmlFor={`type-${type.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    {type.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.business_types && <p className="text-xs text-red-500">{errors.business_types}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Waktu & Lokasi */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Waktu & Lokasi</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="start_date" className="text-sm font-medium">Tanggal Mulai <span className="text-red-500">*</span></label>
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="end_date" className="text-sm font-medium">Tanggal Selesai <span className="text-red-500">*</span></label>
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="location" className="text-sm font-medium">Tempat / Lokasi <span className="text-red-500">*</span></label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Gedung Graha UKM Lt. 3 / Zoom Cloud Meetings"
                                    />
                                    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-sm font-medium">Kota</label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Jakarta Selatan (kosongkan jika online)"
                                    />
                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Registrasi & Biaya */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Registrasi & Biaya</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="registration_fee" className="text-sm font-medium">Biaya Pendaftaran (IDR) <span className="text-red-500">*</span></label>
                                    <Input
                                        id="registration_fee"
                                        type="number"
                                        value={data.registration_fee}
                                        onChange={(e) => setData('registration_fee', Number(e.target.value))}
                                        placeholder="0 untuk Gratis"
                                    />
                                    {errors.registration_fee && <p className="text-xs text-red-500">{errors.registration_fee}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="max_participants" className="text-sm font-medium">Kapasitas Maksimal Peserta</label>
                                    <Input
                                        id="max_participants"
                                        type="number"
                                        value={data.max_participants}
                                        onChange={(e) => setData('max_participants', e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Kosongkan jika tak terbatas"
                                    />
                                    {errors.max_participants && <p className="text-xs text-red-500">{errors.max_participants}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="registration_url" className="text-sm font-medium">Link Registrasi Eksternal</label>
                                    <Input
                                        id="registration_url"
                                        type="url"
                                        value={data.registration_url}
                                        onChange={(e) => setData('registration_url', e.target.value)}
                                        placeholder="https://link-pendaftaran.com/detail (Opsional)"
                                    />
                                    {errors.registration_url && <p className="text-xs text-red-500">{errors.registration_url}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Deskripsi & Media */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Rincian Tambahan & Media</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="image" className="text-sm font-medium">Poster Event (Gambar)</label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('image', file);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
                                    {data.image && data.image instanceof File && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            File terpilih: {data.image.name} ({Math.round(data.image.size / 1024)} KB)
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium">Deskripsi Lengkap Event</label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Jelaskan mengenai agenda, pembicara, fasilitas, dan detail lainnya..."
                                        rows={5}
                                    />
                                    {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="allow_platform_registration"
                                            type="checkbox"
                                            checked={data.allow_platform_registration}
                                            onChange={(e) => setData('allow_platform_registration', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="allow_platform_registration" className="text-sm font-medium cursor-pointer">
                                            Izinkan Pendaftaran via Platform
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="is_featured"
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                                            Tampilkan Sebagai Event Pilihan (Featured)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t animate-in fade-in duration-300">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/events">Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded-xl">
                                {processing ? 'Menyimpan...' : 'Simpan Event'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
