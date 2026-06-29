import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { getColumns, type Tenant } from './columns';
import { DataTable } from './data-table';
import { EditTenantDialog } from './edit-tenant-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Tenants', href: '/admin/tenants' },
];

interface Plan {
    id: number;
    name: string;
}

interface Props {
    tenants: {
        data: Tenant[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    plans: Plan[];
    filters: {
        search: string;
        plan_id: string;
    };
}

export default function TenantsIndex({ tenants, plans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [planId, setPlanId] = useState(filters.plan_id || 'all');

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const handleFilter = () => {
        router.get('/admin/tenants', {
            search,
            plan_id: planId === 'all' ? '' : planId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setIsEditOpen(true);
    };

    const columns = getColumns(handleEdit);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Tenant" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Kelola Tenant</h1>
                    <p className="text-muted-foreground text-sm">
                        Pantau daftar tenant bisnis yang terdaftar, status operasional, dan kapasitas paket langganan.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row items-center shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Cari nama tenant atau slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="pl-9 rounded-xl w-full"
                        />
                    </div>
                    
                    <div className="w-full sm:w-48">
                        <Select
                            value={planId}
                            onValueChange={(val) => setPlanId(val)}
                        >
                            <SelectTrigger className="rounded-xl w-full">
                                <SelectValue placeholder="Semua Paket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Paket</SelectItem>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id.toString()}>
                                        {plan.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleFilter} className="rounded-xl w-full sm:w-auto px-6">
                        Filter
                    </Button>
                </div>

                {/* Tenants DataTable */}
                <div className="space-y-4">
                    <DataTable columns={columns} data={tenants.data} />

                    {/* Pagination */}
                    {tenants.last_page > 1 && (
                        <div className="border-border flex items-center justify-between border-t bg-card px-4 py-3 rounded-xl border shadow-sm">
                            <p className="text-muted-foreground text-sm">
                                Menampilkan {(tenants.current_page - 1) * tenants.per_page + 1}–
                                {Math.min(tenants.current_page * tenants.per_page, tenants.total)} dari{' '}
                                {tenants.total} tenant
                            </p>
                            <div className="flex gap-1">
                                {tenants.links.map((link, i) => (
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
            </div>

            {/* Dialogs */}
            <EditTenantDialog
                tenant={editingTenant}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                plans={plans}
            />
        </AppLayout>
    );
}
