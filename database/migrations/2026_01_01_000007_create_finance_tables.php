<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('opex'); // opex, capex
            $table->string('color')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // income, expense
            $table->string('category')->nullable(); // sales, purchase, salary, rent, etc.
            $table->foreignId('expense_category_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('description')->nullable();
            $table->string('reference')->nullable(); // invoice number, etc.
            $table->date('date');
            $table->string('payment_method')->default('cash'); // cash, transfer, credit
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name'); // snapshot nama produk
            $table->integer('qty');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 14, 2);
            $table->timestamps();
        });

        Schema::create('tax_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('period'); // e.g. "2024-Q1", "2024-06"
            $table->string('tax_type'); // PPh21, PPh23, PPN, etc.
            $table->decimal('gross_amount', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->string('status')->default('draft'); // draft, submitted, paid
            $table->text('notes')->nullable();
            $table->date('due_date')->nullable();
            $table->date('submitted_at')->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_reports');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('expense_categories');
    }
};
