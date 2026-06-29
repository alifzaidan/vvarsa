import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Trash2, Edit2, Plus, Check, X, ShieldAlert, ShoppingBag } from 'lucide-react';
import { goeyToast } from 'goey-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Metode Pembayaran',
        href: '/settings/payment-methods',
    },
];

interface PaymentMethod {
    id: number;
    name: string;
    account_name: string | null;
    account_number: string | null;
    is_active: boolean;
}

interface Props {
    paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsSettings({ paymentMethods }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form to create
    const createForm = useForm({
        name: '',
        account_name: '',
        account_number: '',
    });

    // Form to edit
    const editForm = useForm({
        name: '',
        account_name: '',
        account_number: '',
        is_active: true as boolean,
    });

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route('payment-methods.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
            },
        });
    };

    const startEditing = (pm: PaymentMethod) => {
        setEditingId(pm.id);
        editForm.setData({
            name: pm.name,
            account_name: pm.account_name ?? '',
            account_number: pm.account_number ?? '',
            is_active: pm.is_active,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        editForm.reset();
    };

    const handleUpdate = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.patch(route('payment-methods.update', id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
            },
        });
    };

    const handleToggleActive = (pm: PaymentMethod) => {
        router.patch(route('payment-methods.update', pm.id), {
            name: pm.name,
            account_name: pm.account_name ?? '',
            account_number: pm.account_number ?? '',
            is_active: !pm.is_active,
        }, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) return;
        router.delete(route('payment-methods.destroy', id), {
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Metode Pembayaran" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Metode Pembayaran Toko"
                        description="Kelola rekening bank, e-wallet, atau opsi pembayaran yang dapat dipilih oleh pelanggan saat checkout."
                    />

                    {/* Form Tambah */}
                    {editingId === null && (
                        <form onSubmit={handleCreate} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                <Plus size={16} className="text-indigo-500" />
                                Tambah Metode / Rekening Baru
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Nama Metode *</Label>
                                    <Input
                                        id="name"
                                        placeholder="cth: Transfer Bank BRI, ShopeePay"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="account_name">Nama Pemilik (a.n.)</Label>
                                    <Input
                                        id="account_name"
                                        placeholder="cth: Mochi Delight"
                                        value={createForm.data.account_name}
                                        onChange={(e) => createForm.setData('account_name', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.account_name} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="account_number">No. Rekening / HP</Label>
                                    <Input
                                        id="account_number"
                                        placeholder="cth: 1223-01-xxxx, 0812-xxxx"
                                        value={createForm.data.account_number}
                                        onChange={(e) => createForm.setData('account_number', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.account_number} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-1">
                                <Button type="submit" disabled={createForm.processing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                                    {createForm.processing ? 'Menyimpan...' : 'Tambah Metode'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* List/Table */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/10">
                            <h3 className="text-sm font-semibold">Daftar Metode Pembayaran Aktif</h3>
                        </div>
                        {paymentMethods.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
                                <ShieldAlert size={28} className="mx-auto opacity-30 text-amber-500" />
                                <p>Belum ada metode pembayaran yang dikonfigurasi.</p>
                                <p className="text-xs">Sistem akan menggunakan fallback bawaan (Tunai, Transfer, QRIS) di kasir.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paymentMethods.map((pm) => {
                                    const isEditing = editingId === pm.id;

                                    if (isEditing) {
                                        return (
                                            <form key={pm.id} onSubmit={(e) => handleUpdate(e, pm.id)} className="p-4 bg-indigo-50/20 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label>Nama Metode *</Label>
                                                        <Input
                                                            value={editForm.data.name}
                                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={editForm.errors.name} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label>Nama Pemilik (a.n.)</Label>
                                                        <Input
                                                            value={editForm.data.account_name}
                                                            onChange={(e) => editForm.setData('account_name', e.target.value)}
                                                        />
                                                        <InputError message={editForm.errors.account_name} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label>No. Rekening / HP</Label>
                                                        <Input
                                                            value={editForm.data.account_number}
                                                            onChange={(e) => editForm.setData('account_number', e.target.value)}
                                                        />
                                                        <InputError message={editForm.errors.account_number} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="cursor-pointer" htmlFor={`edit-active-${pm.id}`}>Status Aktif</Label>
                                                        <input
                                                            type="checkbox"
                                                            id={`edit-active-${pm.id}`}
                                                            checked={editForm.data.is_active}
                                                            onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button type="button" variant="outline" size="sm" onClick={cancelEditing} className="rounded-lg">
                                                            <X size={14} className="mr-1" /> Batal
                                                        </Button>
                                                        <Button type="submit" disabled={editForm.processing} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                                                            <Check size={14} className="mr-1" /> Simpan
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        );
                                    }

                                    return (
                                        <div key={pm.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{pm.name}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                    {pm.account_number && <div>No. Rek: <span className="font-mono">{pm.account_number}</span></div>}
                                                    {pm.account_name && <div>Atas Nama: <span className="font-medium">{pm.account_name}</span></div>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 justify-end">
                                                {/* Toggle Switch */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">{pm.is_active ? 'Aktif' : 'Non-aktif'}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(pm)}
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                                            pm.is_active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                pm.is_active ? 'translate-x-4' : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="h-4 w-px bg-border hidden sm:block" />

                                                <Button variant="ghost" size="icon" onClick={() => startEditing(pm)} className="h-8 w-8 text-slate-500 hover:text-slate-700">
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(pm.id)} className="h-8 w-8 text-rose-500 hover:text-rose-700">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
