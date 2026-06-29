import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, CreditCard, Activity, ArrowRight, UserPlus, DollarSign } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
];

interface Tenant {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    plan?: {
        name: string;
        price: number;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    tenant?: {
        name: string;
    } | null;
}

interface Stats {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_plans: number;
    monthly_revenue: number;
}

interface Props {
    stats: Stats;
    recent_tenants: Tenant[];
    recent_users: User[];
}

export default function AdminDashboard({ stats, recent_tenants, recent_users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola infrastruktur platform, tenant bisnis, dan rencana langganan SaaS.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tenant</CardTitle>
                            <Building2 className="text-muted-foreground h-4.5 w-4.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tenants}</div>
                            <p className="text-muted-foreground text-xs mt-1">
                                {stats.active_tenants} aktif & running
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                            <Users className="text-muted-foreground h-4.5 w-4.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <p className="text-muted-foreground text-xs mt-1">
                                Pengguna terdaftar di seluruh tenant
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paket Aktif</CardTitle>
                            <CreditCard className="text-muted-foreground h-4.5 w-4.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_plans}</div>
                            <p className="text-muted-foreground text-xs mt-1">
                                Pilihan paket langganan SaaS
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-blue-50/50 dark:bg-blue-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-blue-700 dark:text-blue-400 text-sm font-medium">Estimasi MRR</CardTitle>
                            <DollarSign className="text-blue-700 dark:text-blue-400 h-4.5 w-4.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {formatRupiah(stats.monthly_revenue)}
                            </div>
                            <p className="text-blue-600/70 dark:text-blue-400/70 text-xs mt-1">
                                Monthly Recurring Revenue berjalan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Grid for Recent Lists */}
                <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Recent Tenants */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Tenant Baru</CardTitle>
                                <CardDescription>Pendaftaran tenant bisnis terbaru di platform</CardDescription>
                            </div>
                            <Link
                                href="/admin/tenants"
                                className="text-primary flex items-center gap-1 text-sm hover:underline"
                            >
                                Semua Tenant
                                <ArrowRight size={14} />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-border divide-y">
                                {recent_tenants.length === 0 ? (
                                    <p className="text-muted-foreground p-6 text-center text-sm">Belum ada tenant terdaftar.</p>
                                ) : (
                                    recent_tenants.map((tenant) => (
                                        <div
                                            key={tenant.id}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <Link
                                                    href={`/admin/tenants/${tenant.id}`}
                                                    className="font-semibold text-sm hover:underline"
                                                >
                                                    {tenant.name}
                                                </Link>
                                                <span className="text-muted-foreground text-xs">
                                                    Terdaftar: {new Date(tenant.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="capitalize">
                                                    {tenant.plan?.name || 'Free'}
                                                </Badge>
                                                <Badge
                                                    variant={tenant.is_active ? 'default' : 'destructive'}
                                                    className={
                                                        tenant.is_active
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100'
                                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100'
                                                    }
                                                >
                                                    {tenant.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Pengguna Baru</CardTitle>
                                <CardDescription>Pengguna terbaru yang didaftarkan ke platform</CardDescription>
                            </div>
                            <Link
                                href="/admin/users"
                                className="text-primary flex items-center gap-1 text-sm hover:underline"
                            >
                                Semua Pengguna
                                <ArrowRight size={14} />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-border divide-y">
                                {recent_users.length === 0 ? (
                                    <p className="text-muted-foreground p-6 text-center text-sm">Belum ada pengguna terdaftar.</p>
                                ) : (
                                    recent_users.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-sm">{u.name}</span>
                                                    <span className="text-muted-foreground text-xs">{u.email}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-xs">
                                                    {u.tenant?.name || 'Platform (Admin)'}
                                                </p>
                                                <p className="text-muted-foreground text-[10px]">
                                                    {new Date(u.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
