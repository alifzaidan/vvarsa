<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\CommunityPostLike;
use App\Models\CommunityReply;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = CommunityPost::with(['user:id,name,tenant_id', 'tenant:id,name'])
            ->where('is_active', true);

        if ($type = $request->get('business_type')) {
            $query->where(function ($q) use ($type) {
                $q->where('business_type', $type)->orWhereNull('business_type');
            });
        }

        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $posts = $query->orderByDesc('is_pinned')->latest()->paginate(10)->withQueryString();

        $likedPostIds = CommunityPostLike::where('user_id', auth()->id())
            ->pluck('post_id')->toArray();

        return Inertia::render('community/index', [
            'posts'         => $posts,
            'liked_post_ids'=> $likedPostIds,
            'filters'       => $request->only(['business_type', 'category', 'search']),
        ]);
    }

    public function show(CommunityPost $post): Response
    {
        $post->increment('views_count');

        $post->load(['user:id,name,tenant_id', 'tenant:id,name']);
        $replies = CommunityReply::where('post_id', $post->id)
            ->where('is_active', true)
            ->with(['user:id,name'])
            ->orderBy('created_at')
            ->get();

        $isLiked = CommunityPostLike::where('post_id', $post->id)
            ->where('user_id', auth()->id())->exists();

        return Inertia::render('community/show', [
            'post'    => $post,
            'replies' => $replies,
            'is_liked'=> $isLiked,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('community/create');
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string|min:10',
            'category'      => 'required|in:discussion,question,tips,announcement',
            'business_type' => 'nullable|string',
        ]);

        $post = CommunityPost::create(array_merge($validated, [
            'tenant_id'    => $tenant->id,
            'user_id'      => auth()->id(),
            'business_type'=> $validated['business_type'] ?? $tenant->business_type,
        ]));

        return redirect()->route('community.show', $post)->with('success', 'Diskusi berhasil dibuat!');
    }

    public function reply(Request $request, CommunityPost $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|min:2',
        ]);

        CommunityReply::create([
            'post_id' => $post->id,
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        $post->increment('replies_count');

        return back()->with('success', 'Balasan berhasil ditambahkan.');
    }

    public function toggleLike(CommunityPost $post)
    {
        $existing = CommunityPostLike::where('post_id', $post->id)
            ->where('user_id', auth()->id())->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            CommunityPostLike::create(['post_id' => $post->id, 'user_id' => auth()->id()]);
            $post->increment('likes_count');
            $liked = true;
        }

        return back()->with('liked', $liked);
    }
}
