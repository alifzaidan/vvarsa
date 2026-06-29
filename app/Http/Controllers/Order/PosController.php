<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        $tenant = app('tenant');

        $variants = ProductVariant::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->with('recipe.ingredients.ingredient:id,name,unit,cost_price,current_stock')
            ->orderBy('name')
            ->get()
            ->map(function ($v) {
                $v->append(['hpp', 'margin', 'profit', 'recipes']);
                return $v;
            });

        return Inertia::render('orders/pos', [
            'variants' => $variants,
        ]);
    }
}
