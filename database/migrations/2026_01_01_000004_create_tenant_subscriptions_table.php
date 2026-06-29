<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans')->restrictOnDelete();
            $table->string('status')->default('active'); // active, expired, cancelled, trial
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('payment_ref')->nullable();
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_subscriptions');
    }
};
