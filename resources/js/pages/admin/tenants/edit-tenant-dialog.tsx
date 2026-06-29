import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Tenant } from './columns';

interface Plan {
    id: number;
    name: string;
}

interface EditTenantDialogProps {
    tenant: Tenant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plans: Plan[];
}

const editTenantSchema = z.object({
    name: z.string().min(1, 'Nama tenant wajib diisi'),
    slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung'),
    business_type: z.string().min(1, 'Jenis bisnis wajib diisi'),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    plan_id: z.string().min(1, 'Paket langganan wajib dipilih'),
    is_active: z.boolean(),
});

export function EditTenantDialog({ tenant, open, onOpenChange, plans }: EditTenantDialogProps) {
    const form = useForm({
        name: '',
        slug: '',
        business_type: 'general',
        phone: '' as string | null,
        address: '' as string | null,
        plan_id: '',
        is_active: true as boolean,
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (tenant) {
            form.setData({
                name: tenant.name,
                slug: tenant.slug,
                business_type: tenant.business_type || 'general',
                phone: tenant.phone || '',
                address: tenant.address || '',
                plan_id: tenant.plan?.id ? tenant.plan.id.toString() : '',
                is_active: tenant.is_active,
            });
            setValidationErrors({});
            form.clearErrors();
        }
    }, [tenant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        setValidationErrors({});
        form.clearErrors();

        const result = editTenantSchema.safeParse(form.data);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                errors[path] = issue.message;
            });
            setValidationErrors(errors);
            return;
        }

        form.put(`/admin/tenants/${tenant.id}`, {
            onSuccess: () => {
                onOpenChange(false);
                setValidationErrors({});
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Tenant / Bisnis</DialogTitle>
                        <DialogDescription>
                            Perbarui detail bisnis tenant, paket langganan, dan status keaktifan mereka.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-name">Nama Tenant</Label>
                            <Input
                                id="tenant-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: Toko Kopi Sejahtera"
                                required
                            />
                            {(validationErrors.name || form.errors.name) && (
                                <p className="text-destructive text-xs">{validationErrors.name || form.errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tenant-slug">Domain Slug</Label>
                            <div className="flex items-center gap-1.5">
                                <Input
                                    id="tenant-slug"
                                    value={form.data.slug}
                                    onChange={(e) => form.setData('slug', e.target.value)}
                                    placeholder="Contoh: kopi-sejahtera"
                                    required
                                />
                                <span className="text-muted-foreground text-xs font-medium">.vvarsa.com</span>
                            </div>
                            {(validationErrors.slug || form.errors.slug) && (
                                <p className="text-destructive text-xs">{validationErrors.slug || form.errors.slug}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="tenant-business-type">Jenis Bisnis</Label>
                                <Select
                                    value={form.data.business_type}
                                    onValueChange={(val) => form.setData('business_type', val)}
                                >
                                    <SelectTrigger className="w-full rounded-xl">
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">Umum (General)</SelectItem>
                                        <SelectItem value="fnb">Kuliner (FnB)</SelectItem>
                                        <SelectItem value="retail">Ritel (Retail)</SelectItem>
                                        <SelectItem value="fashion">Pakaian (Fashion)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(validationErrors.business_type || form.errors.business_type) && (
                                    <p className="text-destructive text-xs">{validationErrors.business_type || form.errors.business_type}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tenant-plan">Paket Langganan</Label>
                                <Select
                                    value={form.data.plan_id}
                                    onValueChange={(val) => form.setData('plan_id', val)}
                                >
                                    <SelectTrigger className="w-full rounded-xl">
                                        <SelectValue placeholder="Pilih Paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(validationErrors.plan_id || form.errors.plan_id) && (
                                    <p className="text-destructive text-xs">{validationErrors.plan_id || form.errors.plan_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tenant-phone">Nomor Telepon</Label>
                            <Input
                                id="tenant-phone"
                                value={form.data.phone || ''}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="Contoh: 08123456789"
                            />
                            {(validationErrors.phone || form.errors.phone) && (
                                <p className="text-destructive text-xs">{validationErrors.phone || form.errors.phone}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tenant-address">Alamat Bisnis</Label>
                            <Input
                                id="tenant-address"
                                value={form.data.address || ''}
                                onChange={(e) => form.setData('address', e.target.value)}
                                placeholder="Contoh: Jl. Sudirman No. 12"
                            />
                            {(validationErrors.address || form.errors.address) && (
                                <p className="text-destructive text-xs">{validationErrors.address || form.errors.address}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                id="tenant-is-active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', checked === true)}
                            />
                            <Label htmlFor="tenant-is-active" className="cursor-pointer text-sm">Tenant Aktif (Dapat Mengakses Sistem)</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
