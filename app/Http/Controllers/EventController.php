<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');
        $query = Event::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")->orWhere('organizer', 'like', "%{$search}%");
        }

        if ($city = $request->get('city')) {
            $query->where('city', $city);
        }

        if ($type = $request->get('business_type')) {
            $query->whereJsonContains('business_types', $type);
        }

        $events = $query->orderBy('start_date')->paginate(12)->withQueryString();

        // Mark registered events for current user
        $registeredEventIds = EventRegistration::where('user_id', auth()->id())
            ->pluck('event_id')->toArray();

        $cities = Event::distinct()->pluck('city')->filter()->values();

        return Inertia::render('events/index', [
            'events'               => $events,
            'registered_event_ids' => $registeredEventIds,
            'cities'               => $cities,
            'filters'              => $request->only(['search', 'city', 'business_type']),
        ]);
    }

    public function show(Event $event): Response
    {
        $isRegistered = EventRegistration::where('event_id', $event->id)
            ->where('user_id', auth()->id())->exists();

        $registrations = $event->registrations()
            ->with('user:id,name,tenant_id', 'tenant:id,name')
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('events/show', [
            'event'         => $event,
            'is_registered' => $isRegistered,
            'recent_registrations' => $registrations,
        ]);
    }

    public function register(Request $request, Event $event)
    {
        $tenant = app('tenant');

        if (!$event->isRegistrationOpen()) {
            return back()->withErrors(['event' => 'Pendaftaran untuk event ini sudah ditutup.']);
        }

        $existing = EventRegistration::where('event_id', $event->id)
            ->where('user_id', auth()->id())->exists();

        if ($existing) {
            return back()->withErrors(['event' => 'Anda sudah terdaftar untuk event ini.']);
        }

        EventRegistration::create([
            'event_id'      => $event->id,
            'user_id'       => auth()->id(),
            'tenant_id'     => $tenant->id,
            'status'        => 'registered',
            'registered_at' => now(),
        ]);

        // Increment counter
        $event->increment('registered_count');

        return back()->with('success', "Berhasil mendaftar event \"{$event->title}\"! Kami akan mengirim konfirmasi ke email Anda.");
    }

    public function cancelRegistration(Event $event)
    {
        $registration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', auth()->id())->first();

        if (!$registration) {
            return back()->withErrors(['event' => 'Anda belum terdaftar untuk event ini.']);
        }

        $registration->delete();
        $event->decrement('registered_count');

        return back()->with('success', 'Pendaftaran event berhasil dibatalkan.');
    }
}
