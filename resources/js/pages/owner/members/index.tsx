import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { getColumns, type Member } from './columns';
import { DataTable } from './data-table';
import { SharedData } from '@/types';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Anggota Tim', href: '/members' },
];

interface Role {
    id: number;
    name: string;
}

interface Props {
    members: Member[];
    roles: Role[];
    limit: number;
    member_count: number;
}

const memberSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    role: z.enum(['owner', 'staff']),
});

export default function MembersIndex({ members, roles, limit, member_count }: Props) {
    const { auth } = usePage<SharedData>().props;
    const authUserId = auth.user.id;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff',
    });

    const updateForm = useForm({
        role: 'staff',
    });

    const deleteForm = useForm({});

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = memberSchema.safeParse(addForm.data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        addForm.post('/members', {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
            },
        });
    };

    const handleUpdateRole = (memberId: number, currentRole: string) => {
        const newRole = currentRole === 'owner' ? 'staff' : 'owner';
        updateForm.transform((data) => ({
            ...data,
            role: newRole,
        }));
        updateForm.put(`/members/${memberId}`, {
            preserveScroll: true,
        });
    };

    const handleDeleteMember = (memberId: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${name} dari tim?`)) {
            deleteForm.delete(`/members/${memberId}`, {
                preserveScroll: true,
            });
        }
    };

    const capacityPercent = Math.round((member_count / limit) * 100);

    const columns = getColumns(
        authUserId,
        handleUpdateRole,
        handleDeleteMember,
        updateForm.processing,
        deleteForm.processing
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Anggota Tim" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* Header section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Anggota Tim</h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola pengguna dan hak akses operasional untuk bisnis Anda.
                        </p>
                    </div>
                    
                    {/* Add member dialog trigger */}
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="inline-flex items-center gap-2 rounded-xl" disabled={member_count >= limit}>
                                <UserPlus size={16} />
                                Tambah Anggota
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleAddMember}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Anggota Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan detail akun untuk mengundang staff baru ke dashboard bisnis Anda.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            value={addForm.data.name}
                                            onChange={(e) => addForm.setData('name', e.target.value)}
                                            placeholder="Nama Lengkap"
                                            className={clientErrors.name || addForm.errors.name ? 'border-rose-500' : ''}
                                            required
                                        />
                                        {(clientErrors.name || addForm.errors.name) && (
                                            <p className="text-destructive text-xs">{clientErrors.name || addForm.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={addForm.data.email}
                                            onChange={(e) => addForm.setData('email', e.target.value)}
                                            placeholder="name@example.com"
                                            className={clientErrors.email || addForm.errors.email ? 'border-rose-500' : ''}
                                            required
                                        />
                                        {(clientErrors.email || addForm.errors.email) && (
                                            <p className="text-destructive text-xs">{clientErrors.email || addForm.errors.email}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password Sementara</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={addForm.data.password}
                                            onChange={(e) => addForm.setData('password', e.target.value)}
                                            placeholder="Min. 8 karakter"
                                            className={clientErrors.password || addForm.errors.password ? 'border-rose-500' : ''}
                                            required
                                        />
                                        {(clientErrors.password || addForm.errors.password) && (
                                            <p className="text-destructive text-xs">{clientErrors.password || addForm.errors.password}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Peran / Hak Akses</Label>
                                        <Select
                                            value={addForm.data.role}
                                            onValueChange={(val) => addForm.setData('role', val)}
                                        >
                                            <SelectTrigger id="role" className="rounded-xl h-9">
                                                <SelectValue placeholder="Pilih Peran" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="staff">Staff (Akses Terbatas: Stok & Operasional)</SelectItem>
                                                <SelectItem value="owner">Owner (Akses Penuh: Finansial & Member)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(clientErrors.role || addForm.errors.role) && (
                                            <p className="text-destructive text-xs">{clientErrors.role || addForm.errors.role}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={addForm.processing} className="rounded-xl">
                                        {addForm.processing ? 'Menyimpan...' : 'Tambah Anggota'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Limit status indicator */}
                <Card className="border-border rounded-2xl shadow-sm">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Users size={16} />
                                Batas Kapasitas Pengguna
                            </span>
                            <span className="font-semibold text-foreground">
                                {member_count} / {limit} pengguna terdaftar
                            </span>
                        </div>
                        <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                            />
                        </div>
                        {member_count >= limit && (
                            <p className="mt-3 flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle size={14} />
                                Kuota pengguna Anda sudah penuh. Hubungi pemilik atau upgrade paket langganan untuk menambah lebih banyak staff.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Team members list DataTable */}
                <Card className="border-border overflow-hidden rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Daftar Pengguna</CardTitle>
                        <CardDescription>
                            Semua pengguna yang memiliki akses ke dashboard tenant bisnis Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable columns={columns} data={members} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
