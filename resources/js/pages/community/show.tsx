import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils-mrp';
import { type BreadcrumbItem } from '@/types';
import { type CommunityPost, type CommunityReply } from '@/types/mrp';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Heart, MessageCircle, ThumbsUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { z } from 'zod';

interface Props {
    post: CommunityPost;
    replies: CommunityReply[];
    is_liked: boolean;
}

const breadcrumbs = (post: CommunityPost): BreadcrumbItem[] => [
    { title: 'Komunitas', href: '/community' },
    { title: post.title, href: `/community/${post.id}` },
];

const replySchema = z.object({
    content: z.string().min(1, 'Balasan tidak boleh kosong'),
});

export default function CommunityShow({ post, replies, is_liked }: Props) {
    const { auth } = usePage().props as any;

    const { data, setData, post: submitReply, processing, errors, reset } = useForm({
        content: '',
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        setClientErrors({});
        
        const result = replySchema.safeParse(data);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setClientErrors(newErrors);
            return;
        }

        submitReply(`/community/${post.id}/reply`, {
            onSuccess: () => reset(),
        });
    };

    const toggleLike = () => {
        router.post(`/community/${post.id}/like`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(post)}>
            <Head title={post.title} />
            <div className="p-4 md:p-6">
                <div className="mb-4">
                    <Link href="/community" className="hover:bg-muted inline-flex items-center gap-2 rounded-xl p-2 text-sm transition-colors">
                        <ArrowLeft size={16} />
                        Kembali ke Komunitas
                    </Link>
                </div>

                <div className="mx-auto max-w-3xl space-y-5">
                    {/* Post */}
                    <div className="bg-card border-border rounded-2xl border p-6 shadow-sm">
                        <div className="mb-4 flex items-start gap-3">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                                {post.user?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <p className="font-medium">{post.user?.name || 'Anonim'}</p>
                                <p className="text-muted-foreground text-xs">
                                    {post.tenant?.name} · {formatDate(post.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <h1 className="mb-3 text-xl font-bold">{post.title}</h1>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{post.content}</p>

                        <div className="mt-6 flex items-center gap-4 border-t pt-4">
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-1.5 text-sm transition-colors ${is_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                            >
                                <Heart size={16} className={is_liked ? 'fill-current' : ''} />
                                {post.likes_count} Suka
                            </button>
                            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                <MessageCircle size={16} />
                                {post.replies_count} Balasan
                            </span>
                        </div>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="px-1 text-sm font-semibold">{replies.length} Balasan</h2>
                            {replies.map((reply) => (
                                <div key={reply.id} className="bg-card border-border rounded-2xl border p-5">
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                            {reply.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{reply.user?.name || 'Anonim'}</p>
                                            <p className="text-muted-foreground text-xs">{formatDate(reply.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{reply.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply form */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold">Tambahkan Balasan</h2>
                        <form onSubmit={handleReply} className="space-y-3">
                            <div className="flex gap-3">
                                <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                    {auth?.user?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-grow">
                                    <Textarea
                                        rows={3}
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Tulis balasan Anda..."
                                        className={clientErrors.content || errors.content ? 'border-rose-500' : ''}
                                    />
                                    {(clientErrors.content || errors.content) && (
                                        <p className="mt-1 text-xs text-rose-500">{clientErrors.content || errors.content}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing || !data.content.trim()}
                                    className="rounded-xl px-5"
                                >
                                    <ThumbsUp size={14} />
                                    {processing ? 'Membalas...' : 'Kirim Balasan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
