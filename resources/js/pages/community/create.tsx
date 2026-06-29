import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Komunitas', href: '/community' },
    { title: 'Buat Diskusi', href: '/community/create' },
];

const CATEGORIES = [
    { value: 'discussion', label: 'Diskusi Umum', desc: 'Topik umum seputar bisnis' },
    { value: 'question', label: 'Pertanyaan', desc: 'Tanya jawab dengan komunitas' },
    { value: 'tips', label: 'Tips & Trik', desc: 'Bagikan pengalaman & ilmu' },
    { value: 'announcement', label: 'Pengumuman', desc: 'Info penting untuk komunitas' },
];

const discussionSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter'),
    content: z.string().min(10, 'Konten minimal 10 karakter'),
    category: z.enum(['discussion', 'question', 'tips', 'announcement']),
    business_type: z.string().optional(),
});

export default function CommunityCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        category: 'discussion',
        business_type: '',
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = discussionSchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        post('/community');
    };

    const displayError = (field: keyof typeof errors) => clientErrors[field] || errors[field];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Diskusi" />
            <div className="mx-auto max-w-2xl p-4 md:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/community">
                            <ArrowLeft size={18} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Buat Diskusi</h1>
                        <p className="text-muted-foreground text-sm">Bagikan pertanyaan atau pengalaman Anda dengan komunitas</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category picker */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <Label className="mb-3 block font-semibold">Jenis Diskusi *</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setData('category', cat.value as any)}
                                    className={`rounded-xl border p-3 text-left transition-all ${data.category === cat.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                >
                                    <p className={`text-sm font-medium ${data.category === cat.value ? 'text-primary' : ''}`}>{cat.label}</p>
                                    <p className="text-muted-foreground mt-0.5 text-xs">{cat.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm space-y-4">
                        <div>
                            <Label htmlFor="title" className="mb-1.5 block">Judul Diskusi *</Label>
                            <Input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Tulis judul yang jelas dan deskriptif..."
                                className={displayError('title') ? 'border-rose-500' : ''}
                            />
                            {displayError('title') && <p className="mt-1 text-xs text-rose-500">{displayError('title')}</p>}
                        </div>

                        <div>
                            <Label htmlFor="content" className="mb-1.5 block">Isi Diskusi *</Label>
                            <Textarea
                                id="content"
                                rows={8}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Jelaskan topik, pertanyaan, atau pengalaman Anda secara detail..."
                                className={displayError('content') ? 'border-rose-500' : ''}
                            />
                            {displayError('content') && <p className="mt-1 text-xs text-rose-500">{displayError('content')}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl">
                            <Link href="/community">
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.title || !data.content}
                            className="rounded-xl px-5"
                        >
                            {processing ? 'Memposting...' : 'Posting Diskusi'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
