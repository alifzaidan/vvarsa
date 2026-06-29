import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_FEATURES, type Plan } from './index';

interface EditPlanDialogProps {
    plan: Plan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditPlanDialog({ plan, open, onOpenChange }: EditPlanDialogProps) {
    const form = useForm({
        name: '',
        price: '0',
        billing_cycle: 'monthly' as 'monthly' | 'yearly',
        max_users: '1',
        max_products: '100',
        features: [] as string[],
        is_active: true as boolean,
    });

    // Update form data when plan changes
    useEffect(() => {
        if (plan) {
            form.setData({
                name: plan.name,
                price: plan.price.toString(),
                billing_cycle: plan.billing_cycle,
                max_users: plan.max_users.toString(),
                max_products: plan.max_products.toString(),
                features: plan.features || [],
                is_active: plan.is_active,
            });
            form.clearErrors();
        }
    }, [plan]);

    const handleFeatureChange = (featureId: string, checked: boolean) => {
        const currentFeatures = [...form.data.features];
        if (checked) {
            form.setData('features', [...currentFeatures, featureId]);
        } else {
            form.setData(
                'features',
                currentFeatures.filter((f) => f !== featureId)
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan) return;
        
        form.put(`/admin/plans/${plan.id}`, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Paket Langganan</DialogTitle>
                        <DialogDescription>
                            Tentukan batasan kapasitas, tarif, dan fitur-fitur yang bisa diakses oleh tenant pada paket ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Paket</Label>
                            <Input
                                id="edit-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: Paket Pro, Paket Retail"
                                required
                            />
                            {form.errors.name && <p className="text-destructive text-xs">{form.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Harga Bulanan (Rp)</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={form.data.price}
                                    onChange={(e) => form.setData('price', e.target.value)}
                                    placeholder="0 jika gratis"
                                    required
                                />
                                {form.errors.price && <p className="text-destructive text-xs">{form.errors.price}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="edit-billing_cycle">Siklus Penagihan</Label>
                                <Select
                                    value={form.data.billing_cycle}
                                    onValueChange={(value) => form.setData('billing_cycle', value as 'monthly' | 'yearly')}
                                >
                                    <SelectTrigger className="rounded-xl w-full">
                                        <SelectValue placeholder="Siklus Penagihan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Bulanan</SelectItem>
                                        <SelectItem value="yearly">Tahunan</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.billing_cycle && <p className="text-destructive text-xs">{form.errors.billing_cycle}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-max_users">Maksimal Pengguna</Label>
                                <Input
                                    id="edit-max_users"
                                    type="number"
                                    value={form.data.max_users}
                                    onChange={(e) => form.setData('max_users', e.target.value)}
                                    required
                                />
                                {form.errors.max_users && <p className="text-destructive text-xs">{form.errors.max_users}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-max_products">Maksimal Produk</Label>
                                <Input
                                    id="edit-max_products"
                                    type="number"
                                    value={form.data.max_products}
                                    onChange={(e) => form.setData('max_products', e.target.value)}
                                    required
                                />
                                {form.errors.max_products && <p className="text-destructive text-xs">{form.errors.max_products}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                id="edit-is_active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', checked === true)}
                            />
                            <Label htmlFor="edit-is_active" className="cursor-pointer text-sm">Paket Aktif & Ditawarkan</Label>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label className="text-sm font-semibold">Daftar Fitur Aktif</Label>
                            <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 border rounded-lg bg-slate-50/50 dark:bg-slate-800/10">
                                {AVAILABLE_FEATURES.map((feat) => {
                                    const isChecked = form.data.features.includes(feat.id);
                                    return (
                                        <div key={feat.id} className="flex items-start gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                            <Checkbox
                                                id={`edit-feat-${feat.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handleFeatureChange(feat.id, checked === true)}
                                            />
                                            <label htmlFor={`edit-feat-${feat.id}`} className="text-xs leading-none cursor-pointer text-slate-700 dark:text-slate-300">
                                                {feat.label}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Paket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
