<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->string('color')->nullable(); // for visual distinction
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->nullable();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->string('unit')->default('pcs'); // pcs, kg, liter, box, etc.
            $table->integer('min_stock')->default(0);
            $table->integer('current_stock')->default(0);
            $table->decimal('purchase_price', 12, 2)->default(0); // Harga beli kemasan
            $table->decimal('purchase_qty', 12, 2)->default(1);   // Isi/jumlah dalam kemasan
            $table->decimal('cost_price', 12, 2)->default(0);   // Harga beli/modal per unit
            $table->decimal('sell_price', 12, 2)->default(0);   // Harga jual
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'sku']);
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // in, out, opname
            $table->integer('qty');
            $table->integer('qty_before');
            $table->integer('qty_after');
            $table->decimal('unit_cost', 12, 2)->nullable(); // harga per unit saat masuk
            $table->string('reference')->nullable(); // nomor PO, invoice, dll
            $table->text('note')->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamp('movement_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_categories');
    }
};
