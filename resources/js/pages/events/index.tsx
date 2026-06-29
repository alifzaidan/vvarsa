import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type Event, type PaginatedData } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, MapPin, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Event', href: '/events' },
];

interface Props {
    events: PaginatedData<Event>;
    registered_event_ids: number[];
    cities: string[];
    filters: { search?: string; city?: string; business_type?: string };
}

const BUSINESS_TYPES = [
    { value: '', label: 'Semua Kategori' },
    { value: 'makanan_minuman', label: 'Makanan & Minuman' },
    { value: 'jasa', label: 'Jasa' },
    { value: 'retail', label: 'Retail' },
    { value: 'lainnya', label: 'Lainnya' },
];

const STATUS_STYLES: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const STATUS_LABELS: Record<string, string> = {
    upcoming: 'Akan Datang',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function EventsIndex({ events, registered_event_ids, cities, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [city, setCity] = useState(filters.city || '');
    const [businessType, setBusinessType] = useState(filters.business_type || '');

    const applyFilter = () => {
        router.get('/events', { search, business_type: businessType, city }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Event Bisnis & Komunitas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Event Bisnis & Komunitas</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Ikuti event, webinar, dan pameran menarik untuk kembangkan bisnis Anda
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row items-center">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Cari event..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                            className="pl-9 rounded-xl h-10 w-full"
                        />
                    </div>
                    <Select
                        value={businessType || "all"}
                        onValueChange={(val) => setBusinessType(val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {BUSINESS_TYPES.map((t) => (
                                <SelectItem key={t.value || "all"} value={t.value || "all"}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={city || "all"}
                        onValueChange={(val) => setCity(val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10">
                            <SelectValue placeholder="Kota" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kota</SelectItem>
                            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={applyFilter}
                        className="rounded-xl h-10 w-full sm:w-auto px-6"
                    >
                        Filter
                    </Button>
                </div>

                {/* Event Cards */}
                {events.data.length === 0 ? (
                    <div className="bg-card border-border rounded-2xl border py-16 text-center">
                        <CalendarDays size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Tidak ada event ditemukan.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {events.data.map((event) => {
                            const isRegistered = registered_event_ids.includes(event.id);
                            const isFull = event.max_participants !== null && event.registered_count >= event.max_participants;
                            return (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="bg-card border-border group overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
                                >
                                    {/* Date banner */}
                                    <div className="from-primary/80 to-primary flex items-center justify-between bg-gradient-to-r px-5 py-3 text-white">
                                        <div>
                                            <p className="text-xs font-medium opacity-80">
                                                {new Date(event.start_date).toLocaleString('id-ID', { weekday: 'long' })}
                                            </p>
                                            <p className="text-lg font-bold">
                                                {formatDate(event.start_date, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white/90 ${STATUS_STYLES[event.status]}`}>
                                            {STATUS_LABELS[event.status]}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-semibold leading-snug group-hover:text-primary line-clamp-2 transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-muted-foreground mt-1 text-sm">{event.organizer}</p>

                                        <div className="mt-3 flex flex-col gap-1.5">
                                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                                <MapPin size={12} />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                                <Users size={12} />
                                                <span>
                                                    {event.registered_count} terdaftar
                                                    {event.max_participants && ` / ${event.max_participants} maks`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className={`text-sm font-semibold ${event.registration_fee === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                                {event.registration_fee === 0 ? 'Gratis' : formatRupiah(event.registration_fee)}
                                            </span>
                                            {isRegistered ? (
                                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    ✓ Terdaftar
                                                </span>
                                            ) : isFull ? (
                                                <span className="text-muted-foreground rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">
                                                    Penuh
                                                </span>
                                            ) : (
                                                <span className="text-primary text-xs font-medium">
                                                    Lihat Detail →
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
