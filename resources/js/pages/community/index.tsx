import AppLayout from '@/layouts/app-layout';
import { formatDate, truncate } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type CommunityPost, type PaginatedData } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Heart, MessageCircle, PinIcon, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Komunitas', href: '/community' },
];

interface Props {
    posts: PaginatedData<CommunityPost>;
    liked_post_ids: number[];
    filters: { business_type?: string; category?: string; search?: string };
}

const CATEGORIES = [
    { value: '', label: 'Semua' },
    { value: 'discussion', label: 'Diskusi' },
    { value: 'question', label: 'Pertanyaan' },
    { value: 'tips', label: 'Tips' },
    { value: 'announcement', label: 'Pengumuman' },
];

const CATEGORY_STYLES: Record<string, string> = {
    discussion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    question: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    tips: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    announcement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function CommunityIndex({ posts, liked_post_ids, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');

    const applyFilter = () => {
        router.get('/community', { search, category, business_type: filters.business_type }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Komunitas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Komunitas</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Forum diskusi dan berbagi pengalaman sesama pelaku bisnis</p>
                    </div>
                    <Link
                        href="/community/create"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                    >
                        <Plus size={16} /> Buat Diskusi
                    </Link>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => { setCategory(cat.value); router.get('/community', { category: cat.value, search, business_type: filters.business_type }, { preserveState: true, replace: true }); }}
                            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${category === cat.value ? 'bg-primary text-primary-foreground' : 'border-border border hover:bg-muted'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari diskusi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                        className="border-border bg-background w-full rounded-xl border py-2.5 pr-4 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Posts */}
                {posts.data.length === 0 ? (
                    <div className="bg-card border-border rounded-2xl border py-16 text-center">
                        <MessageCircle size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Belum ada diskusi. Mulai diskusi pertama!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.data.map((post) => (
                            <Link
                                key={post.id}
                                href={`/community/${post.id}`}
                                className="bg-card border-border hover:border-primary/30 group block rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:flex">
                                        {post.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            {post.is_pinned && (
                                                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    <PinIcon size={10} /> Disematkan
                                                </span>
                                            )}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[post.category] || 'bg-slate-100 text-slate-600'}`}>
                                                {CATEGORIES.find((c) => c.value === post.category)?.label || post.category}
                                            </span>
                                        </div>
                                        <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors">{post.title}</h2>
                                        <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{truncate(post.content, 120)}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                            <span>{post.user?.name || 'Anonim'} · {post.tenant?.name}</span>
                                            <span>{formatDate(post.created_at, { day: 'numeric', month: 'short' })}</span>
                                            <span className="flex items-center gap-1">
                                                <Heart size={11} className={liked_post_ids.includes(post.id) ? 'fill-rose-500 text-rose-500' : ''} />
                                                {post.likes_count}
                                            </span>
                                            <span className="flex items-center gap-1"><MessageCircle size={11} />{post.replies_count}</span>
                                            <span className="flex items-center gap-1"><Eye size={11} />{post.views_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
