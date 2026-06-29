import AppLayout from '@/layouts/app-layout';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type Event } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, CheckCircle, Clock, MapPin, Users, XCircle } from 'lucide-react';

interface Registration {
    id: number;
    user: { id: number; name: string; tenant_id: number };
    tenant: { id: number; name: string };
    status: string;
    registered_at: string;
}

interface Props {
    event: Event;
    is_registered: boolean;
    recent_registrations: Registration[];
}

const breadcrumbs = (event: Event): BreadcrumbItem[] => [
    { title: 'Event', href: '/events' },
    { title: event.title, href: `/events/${event.id}` },
];

export default function EventShow({ event, is_registered, recent_registrations }: Props) {
    const isFull = event.max_participants !== null && event.registered_count >= event.max_participants;
    const canRegister = event.allow_platform_registration && event.status === 'upcoming' && !isFull;

    const handleRegister = () => {
        router.post(`/events/${event.id}/register`, {}, {
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        if (confirm('Batalkan pendaftaran event ini?')) {
            router.delete(`/events/${event.id}/register`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(event)}>
            <Head title={event.title} />
            <div className="p-4 md:p-6">
                <div className="mb-6">
                    <Link href="/events" className="hover:bg-muted inline-flex items-center gap-2 rounded-xl p-2 text-sm transition-colors">
                        <ArrowLeft size={16} />
                        Kembali ke Daftar Event
                    </Link>
                </div>

                <div className="mx-auto max-w-4xl">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Event Header */}
                            <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                                <div className="from-primary to-primary/70 flex items-end bg-gradient-to-br p-6 text-white" style={{ minHeight: '160px' }}>
                                    <div>
                                        <div className="mb-2 flex gap-2">
                                            {event.business_types?.map((type) => (
                                                <span key={type} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium uppercase">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                        <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
                                        <p className="mt-1 text-white/80">{event.organizer}</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        <div className="flex items-start gap-2">
                                            <CalendarDays size={16} className="text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground text-xs">Tanggal</p>
                                                <p className="text-sm font-medium">{formatDate(event.start_date, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                {event.end_date !== event.start_date && (
                                                    <p className="text-muted-foreground text-xs">s/d {formatDate(event.end_date, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground text-xs">Waktu</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(event.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground text-xs">Lokasi</p>
                                                <p className="text-sm font-medium">{event.location}</p>
                                                <p className="text-muted-foreground text-xs">{event.city}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {event.description && (
                                        <div>
                                            <h2 className="mb-2 font-semibold">Tentang Event</h2>
                                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Registrations */}
                            {recent_registrations.length > 0 && (
                                <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                                    <h2 className="mb-4 font-semibold">Peserta Terbaru</h2>
                                    <div className="space-y-3">
                                        {recent_registrations.map((reg) => (
                                            <div key={reg.id} className="flex items-center gap-3">
                                                <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                                                    {reg.user.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">{reg.user.name}</p>
                                                    <p className="text-muted-foreground text-xs">{reg.tenant.name}</p>
                                                </div>
                                                <span className="text-muted-foreground text-xs">
                                                    {formatDate(reg.registered_at, { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Registration card */}
                            <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm">Biaya Pendaftaran</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${event.registration_fee === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                        {event.registration_fee === 0 ? 'GRATIS' : formatRupiah(event.registration_fee)}
                                    </p>
                                </div>

                                <div className="mb-4 flex items-center gap-2 text-sm">
                                    <Users size={14} className="text-muted-foreground" />
                                    <span>
                                        {event.registered_count} terdaftar
                                        {event.max_participants && ` dari ${event.max_participants} slot`}
                                    </span>
                                </div>

                                {/* Capacity bar */}
                                {event.max_participants && (
                                    <div className="mb-4">
                                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                                            <div
                                                className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min((event.registered_count / event.max_participants) * 100, 100)}%` }}
                                            />
                                        </div>
                                        {isFull && <p className="mt-1 text-xs text-rose-600">Pendaftaran sudah penuh</p>}
                                    </div>
                                )}

                                {is_registered ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            <CheckCircle size={16} />
                                            <span className="font-medium">Anda sudah terdaftar!</span>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
                                        >
                                            <XCircle size={14} />
                                            Batalkan Pendaftaran
                                        </button>
                                    </div>
                                ) : canRegister ? (
                                    <button
                                        onClick={handleRegister}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-3 text-sm font-semibold transition-colors"
                                    >
                                        Daftar Sekarang
                                    </button>
                                ) : isFull ? (
                                    <button disabled className="w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-500 dark:bg-slate-700">
                                        Pendaftaran Penuh
                                    </button>
                                ) : event.registration_url ? (
                                    <a
                                        href={event.registration_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors"
                                    >
                                        Daftar di Website Penyelenggara ↗
                                    </a>
                                ) : (
                                    <button disabled className="w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-500 dark:bg-slate-700">
                                        Pendaftaran Ditutup
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
