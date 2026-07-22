import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Users, DollarSign, Award, ToggleLeft } from 'lucide-react';
import { useState } from 'react';
import { formatRupiah, formatDateTime } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Events', href: '/admin/events' },
];

export interface Event {
    id: string;
    title: string;
    organizer: string;
    business_types: string[] | null;
    location: string;
    city: string | null;
    description: string | null;
    image: string | null;
    start_date: string;
    end_date: string;
    max_participants: number | null;
    registered_count: number;
    registration_fee: string | number;
    registration_url: string | null;
    allow_platform_registration: boolean;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    events: {
        data: Event[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const statusLabels: Record<string, string> = {
    upcoming: 'Mendatang',
    ongoing: 'Berjalan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    completed: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
};

export default function EventIndex({ events, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get('/admin/events', {
            search,
            status: status === 'all' ? '' : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus event "${title}"?`)) {
            router.delete(`/admin/events/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Event" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Event</h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola semua acara, webinar, dan pameran bisnis untuk member platform.
                        </p>
                    </div>
                    
                    <Link href="/admin/events/create">
                        <Button className="inline-flex items-center gap-2 rounded-xl">
                            <Plus size={16} />
                            Buat Event Baru
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row items-center shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Cari judul event atau penyelenggara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="pl-9 rounded-xl w-full"
                        />
                    </div>
                    
                    <div className="w-full sm:w-48">
                        <Select
                            value={status}
                            onValueChange={(val) => setStatus(val)}
                        >
                            <SelectTrigger className="rounded-xl w-full">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="upcoming">Mendatang</SelectItem>
                                <SelectItem value="ongoing">Berjalan</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleFilter} className="rounded-xl w-full sm:w-auto px-6">
                        Filter
                    </Button>
                </div>

                {/* Events Table */}
                <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                    <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-800/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Tanggal & Waktu</th>
                                <th className="px-6 py-4">Lokasi / Kota</th>
                                <th className="px-6 py-4 text-center">Peserta</th>
                                <th className="px-6 py-4">Biaya</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {events.data.length > 0 ? (
                                events.data.map((event) => (
                                    <tr key={event.id} className="hover:bg-muted/30 border-b border-border transition-colors">
                                        {/* Event Detail */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {event.image ? (
                                                    <img
                                                        src={event.image}
                                                        alt={event.title}
                                                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-dashed border-muted-foreground/30">
                                                        <Calendar size={18} className="text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground">{event.title}</span>
                                                        {event.is_featured && (
                                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 py-0">
                                                                Pilihan
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Penyelenggara: {event.organizer}</span>
                                                    {event.business_types && event.business_types.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {event.business_types.map((type) => (
                                                                <Badge key={type} variant="outline" className="text-[10px] px-1 py-0 uppercase">
                                                                    {type}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Date */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col text-xs text-foreground">
                                                <span className="font-medium">{formatDateTime(event.start_date)}</span>
                                                <span className="text-muted-foreground">s.d. {formatDateTime(event.end_date)}</span>
                                            </div>
                                        </td>
                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs">
                                                <span className="font-medium text-foreground">{event.location}</span>
                                                {event.city && <span className="text-muted-foreground">{event.city}</span>}
                                            </div>
                                        </td>
                                        {/* Capacity */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span className="font-semibold text-foreground">{event.registered_count}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    dari {event.max_participants ? event.max_participants : '∞'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Fee */}
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                            {Number(event.registration_fee) === 0 ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Gratis</span>
                                            ) : (
                                                formatRupiah(Number(event.registration_fee))
                                            )}
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <Badge className={`border uppercase text-[10px] px-2 py-0.5 rounded-full ${statusColors[event.status] || ''}`}>
                                                {statusLabels[event.status] || event.status}
                                            </Badge>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/events/${event.id}/edit`}>
                                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                                                        <Edit size={14} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(event.id, event.title)}
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                                        Tidak ada event ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="border-border flex items-center justify-between border-t bg-card px-4 py-3 rounded-xl border shadow-sm">
                        <p className="text-muted-foreground text-sm">
                            Menampilkan {(events.current_page - 1) * events.per_page + 1}–
                            {Math.min(events.current_page * events.per_page, events.total)} dari{' '}
                            {events.total} event
                        </p>
                        <div className="flex gap-1">
                            {events.links.map((link, i) => (
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
        </AppLayout>
    );
}
