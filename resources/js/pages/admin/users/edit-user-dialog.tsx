import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type UserItem } from './columns';

interface Tenant {
    id: number;
    name: string;
}

interface EditUserDialogProps {
    user: UserItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenants: Tenant[];
}

const editUserSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().refine(val => val === '' || val.length >= 8, {
        message: 'Password minimal 8 karakter',
    }).optional(),
    role: z.enum(['admin', 'owner', 'staff']),
    tenant_id: z.string().optional().nullable(),
}).refine(data => {
    if ((data.role === 'owner' || data.role === 'staff') && !data.tenant_id) {
        return false;
    }
    return true;
}, {
    message: 'Bisnis / Tenant wajib dipilih untuk peran Owner atau Staff',
    path: ['tenant_id'],
});

export function EditUserDialog({ user, open, onOpenChange, tenants }: EditUserDialogProps) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        role: 'owner' as 'admin' | 'owner' | 'staff',
        tenant_id: '' as string | null,
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            form.setData({
                name: user.name,
                email: user.email,
                password: '',
                role: (user.roles[0]?.name || 'staff') as 'admin' | 'owner' | 'staff',
                tenant_id: user.tenant?.id ? user.tenant.id.toString() : null,
            });
            setValidationErrors({});
            form.clearErrors();
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setValidationErrors({});
        form.clearErrors();

        const result = editUserSchema.safeParse(form.data);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                errors[path] = issue.message;
            });
            setValidationErrors(errors);
            return;
        }

        form.put(`/admin/users/${user.id}`, {
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
                        <DialogTitle>Edit Pengguna</DialogTitle>
                        <DialogDescription>
                            Perbarui detail informasi, peran, atau tenant bisnis untuk pengguna ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                                id="edit-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: John Doe"
                                required
                            />
                            {(validationErrors.name || form.errors.name) && (
                                <p className="text-destructive text-xs">{validationErrors.name || form.errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Alamat Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="Contoh: john@example.com"
                                required
                            />
                            {(validationErrors.email || form.errors.email) && (
                                <p className="text-destructive text-xs">{validationErrors.email || form.errors.email}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">Kata Sandi Baru (Opsional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                            {(validationErrors.password || form.errors.password) && (
                                <p className="text-destructive text-xs">{validationErrors.password || form.errors.password}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Peran (Role)</Label>
                            <Select
                                value={form.data.role}
                                onValueChange={(val) => {
                                    form.setData('role', val as 'admin' | 'owner' | 'staff');
                                    if (val === 'admin') {
                                        form.setData('tenant_id', null);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Pilih Peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Owner (Pemilik Bisnis)</SelectItem>
                                    <SelectItem value="staff">Staff (Karyawan Tenant)</SelectItem>
                                    <SelectItem value="admin">Platform Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {(validationErrors.role || form.errors.role) && (
                                <p className="text-destructive text-xs">{validationErrors.role || form.errors.role}</p>
                            )}
                        </div>

                        {form.data.role !== 'admin' && (
                            <div className="grid gap-2">
                                <Label htmlFor="edit-tenant_id">Bisnis / Tenant</Label>
                                <Select
                                    value={form.data.tenant_id || ''}
                                    onValueChange={(val) => form.setData('tenant_id', val)}
                                >
                                    <SelectTrigger className="w-full rounded-xl">
                                        <SelectValue placeholder="Pilih Bisnis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenants.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(validationErrors.tenant_id || form.errors.tenant_id) && (
                                    <p className="text-destructive text-xs">{validationErrors.tenant_id || form.errors.tenant_id}</p>
                                )}
                            </div>
                        )}
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
