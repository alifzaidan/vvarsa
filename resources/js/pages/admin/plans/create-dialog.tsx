import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_FEATURES } from './index';

interface CreatePlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
    const form = useForm({
        name: '',
        price: '0',
        billing_cycle: 'monthly' as 'monthly' | 'yearly',
        max_users: '1',
        max_products: '100',
        features: ['inventory', 'events_view', 'community_read', 'suppliers_view'] as string[],
        is_active: true as boolean,
    });

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
        form.post('/admin/plans', {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                form.clearErrors();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Paket Langganan Baru</DialogTitle>
                        <DialogDescription>
                            Tentukan batasan kapasitas, tarif, dan fitur-fitur yang bisa diakses oleh tenant pada paket ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Paket</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: Paket Pro, Paket Retail"
                                required
                            />
                            {form.errors.name && <p className="text-destructive text-xs">{form.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Harga Bulanan (Rp)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={form.data.price}
                                    onChange={(e) => form.setData('price', e.target.value)}
                                    placeholder="0 jika gratis"
                                    required
                                />
                                {form.errors.price && <p className="text-destructive text-xs">{form.errors.price}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="billing_cycle">Siklus Penagihan</Label>
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
                                <Label htmlFor="max_users">Maksimal Pengguna</Label>
                                <Input
                                    id="max_users"
                                    type="number"
                                    value={form.data.max_users}
                                    onChange={(e) => form.setData('max_users', e.target.value)}
                                    required
                                />
                                {form.errors.max_users && <p className="text-destructive text-xs">{form.errors.max_users}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="max_products">Maksimal Produk</Label>
                                <Input
                                    id="max_products"
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
                                id="is_active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', checked === true)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer text-sm">Paket Aktif & Ditawarkan</Label>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label className="text-sm font-semibold">Daftar Fitur Aktif</Label>
                            <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 border rounded-lg bg-slate-50/50 dark:bg-slate-800/10">
                                {AVAILABLE_FEATURES.map((feat) => {
                                    const isChecked = form.data.features.includes(feat.id);
                                    return (
                                        <div key={feat.id} className="flex items-start gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                            <Checkbox
                                                id={`feat-${feat.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handleFeatureChange(feat.id, checked === true)}
                                            />
                                            <label htmlFor={`feat-${feat.id}`} className="text-xs leading-none cursor-pointer text-slate-700 dark:text-slate-300">
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
