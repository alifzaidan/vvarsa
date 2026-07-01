<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('portion_qty', 10, 3)->default(1.000); // output portion quantity (e.g. 12 pcs)
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('recipe_id')->nullable()->constrained('recipes')->nullOnDelete();
            $table->decimal('recipe_qty', 10, 3)->default(1.000); // multiplier / portion used
            $table->string('sku')->nullable();
            $table->string('name');
            $table->decimal('sell_price', 12, 2)->default(0); // Harga jual ke pelanggan
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'sku']);
        });

        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('recipe_id')->constrained('recipes')->cascadeOnDelete();
            // ingredient_id nullable: jika null, gunakan custom name/cost
            $table->foreignUuid('ingredient_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('ingredient_name'); // snapshot atau custom name
            $table->decimal('qty', 10, 3);     // jumlah bahan per resep
            $table->string('unit');             // satuan bahan (gr, ml, pcs, dll)
            $table->decimal('ingredient_cost', 12, 2)->default(0); // HPP per unit bahan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_ingredients');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('recipes');
    }
};
