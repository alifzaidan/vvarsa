<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('organizer');
            $table->json('business_types')->nullable(); // ["fnb", "retail"] - target bisnis
            $table->string('location');
            $table->string('city')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->integer('max_participants')->nullable(); // null = unlimited
            $table->integer('registered_count')->default(0);
            $table->decimal('registration_fee', 10, 2)->default(0); // 0 = free
            $table->string('registration_url')->nullable(); // external URL if any
            $table->boolean('allow_platform_registration')->default(true);
            $table->string('status')->default('upcoming'); // upcoming, ongoing, completed, cancelled
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('registered'); // registered, confirmed, cancelled, attended
            $table->text('notes')->nullable();
            $table->timestamp('registered_at');
            $table->timestamps();

            $table->unique(['event_id', 'user_id']); // 1 user 1 kali daftar per event
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('events');
    }
};
