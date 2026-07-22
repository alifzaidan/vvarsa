<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Event;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('organizer', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $events = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/event/index', [
            'events' => $events,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/event/create');
    }

    public function store(Request $request)
    {
        $rules = [
            'title'                       => 'required|string|max:255',
            'organizer'                   => 'required|string|max:255',
            'business_types'              => 'nullable|array',
            'business_types.*'            => 'string|max:50',
            'location'                    => 'required|string|max:255',
            'city'                        => 'nullable|string|max:255',
            'description'                 => 'nullable|string',
            'start_date'                  => 'required|date',
            'end_date'                    => 'required|date|after_or_equal:start_date',
            'max_participants'            => 'nullable|integer|min:1',
            'registration_fee'            => 'required|numeric|min:0',
            'registration_url'            => 'nullable|string|max:500',
            'allow_platform_registration' => 'sometimes|boolean',
            'status'                      => 'required|in:upcoming,ongoing,completed,cancelled',
            'is_featured'                 => 'sometimes|boolean',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048';
        } else {
            $rules['image'] = 'nullable|string|max:1000';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            $validated['image'] = null;
        }

        // Explicitly set booleans from request (handles unchecked checkboxes)
        $validated['allow_platform_registration'] = $request->boolean('allow_platform_registration');
        $validated['is_featured'] = $request->boolean('is_featured');
        // Convert empty max_participants to null
        $validated['max_participants'] = $request->filled('max_participants')
            ? (int) $request->max_participants
            : null;

        Event::create($validated);

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil dibuat.');
    }

    public function edit(Event $event)
    {
        return Inertia::render('admin/event/edit', [
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $rules = [
            'title'                       => 'required|string|max:255',
            'organizer'                   => 'required|string|max:255',
            'business_types'              => 'nullable|array',
            'business_types.*'            => 'string|max:50',
            'location'                    => 'required|string|max:255',
            'city'                        => 'nullable|string|max:255',
            'description'                 => 'nullable|string',
            'start_date'                  => 'required|date',
            'end_date'                    => 'required|date|after_or_equal:start_date',
            'max_participants'            => 'nullable|integer|min:1',
            'registration_fee'            => 'required|numeric|min:0',
            'registration_url'            => 'nullable|string|max:500',
            'allow_platform_registration' => 'sometimes|boolean',
            'status'                      => 'required|in:upcoming,ongoing,completed,cancelled',
            'is_featured'                 => 'sometimes|boolean',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048';
        } else {
            $rules['image'] = 'nullable|string|max:5000';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            // Delete old image if exists and it was stored locally
            if ($event->image && str_starts_with($event->image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $event->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('events', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            $validated['image'] = $event->image;
        }

        // Explicitly set booleans from request (handles unchecked checkboxes)
        $validated['allow_platform_registration'] = $request->boolean('allow_platform_registration');
        $validated['is_featured'] = $request->boolean('is_featured');
        // Convert empty max_participants to null
        $validated['max_participants'] = $request->filled('max_participants')
            ? (int) $request->max_participants
            : null;

        $event->update($validated);

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event)
    {
        // Delete image file when deleting event
        if ($event->image && str_starts_with($event->image, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $event->image);
            Storage::disk('public')->delete($oldPath);
        }

        $event->delete();

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil dihapus.');
    }
}
