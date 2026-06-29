<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = Recipe::where('tenant_id', $tenant->id)
            ->with('ingredients.ingredient:id,name,unit,cost_price');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $recipes = $query->latest()->paginate(15)->withQueryString();

        // Append computed hpp and total_cost attributes to each recipe
        $recipes->through(function ($recipe) {
            $recipe->append(['hpp', 'total_cost']);
            return $recipe;
        });

        return Inertia::render('recipes/index', [
            'recipes' => $recipes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $tenant = app('tenant');
        $ingredients = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'cost_price', 'current_stock']);

        return Inertia::render('recipes/create', [
            'ingredients' => $ingredients,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'portion_qty' => 'required|numeric|min:0.001',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_id'   => 'nullable|exists:products,id',
            'ingredients.*.ingredient_name' => 'required|string|max:255',
            'ingredients.*.qty'             => 'required|numeric|min:0.001',
            'ingredients.*.unit'            => 'required|string|max:50',
            'ingredients.*.ingredient_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $tenant) {
            $recipe = Recipe::create([
                'tenant_id'   => $tenant->id,
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'portion_qty' => $validated['portion_qty'],
            ]);

            foreach ($validated['ingredients'] as $ing) {
                RecipeIngredient::create([
                    'recipe_id'       => $recipe->id,
                    'ingredient_id'    => $ing['ingredient_id'] ?? null,
                    'ingredient_name'  => $ing['ingredient_name'],
                    'qty'              => $ing['qty'],
                    'unit'             => $ing['unit'],
                    'ingredient_cost'  => $ing['ingredient_cost'],
                ]);
            }
        });

        return redirect()->route('recipes.index')
            ->with('success', "Resep \"{$validated['name']}\" berhasil ditambahkan.");
    }

    public function edit(Recipe $recipe): Response
    {
        $tenant = app('tenant');
        abort_if($recipe->tenant_id !== $tenant->id, 403);

        $recipe->load('ingredients.ingredient:id,name,unit,cost_price');
        $recipe->append(['hpp', 'total_cost']);

        $ingredients = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'cost_price', 'current_stock']);

        return Inertia::render('recipes/edit', [
            'recipe'      => $recipe,
            'ingredients' => $ingredients,
        ]);
    }

    public function update(Request $request, Recipe $recipe)
    {
        $tenant = app('tenant');
        abort_if($recipe->tenant_id !== $tenant->id, 403);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'portion_qty' => 'required|numeric|min:0.001',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_id'   => 'nullable|exists:products,id',
            'ingredients.*.ingredient_name' => 'required|string|max:255',
            'ingredients.*.qty'             => 'required|numeric|min:0.001',
            'ingredients.*.unit'            => 'required|string|max:50',
            'ingredients.*.ingredient_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $recipe) {
            $recipe->update([
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'portion_qty' => $validated['portion_qty'],
            ]);

            // Delete old ingredients and save new ones
            $recipe->ingredients()->delete();

            foreach ($validated['ingredients'] as $ing) {
                RecipeIngredient::create([
                    'recipe_id'       => $recipe->id,
                    'ingredient_id'    => $ing['ingredient_id'] ?? null,
                    'ingredient_name'  => $ing['ingredient_name'],
                    'qty'              => $ing['qty'],
                    'unit'             => $ing['unit'],
                    'ingredient_cost'  => $ing['ingredient_cost'],
                ]);
            }
        });

        return redirect()->route('recipes.index')
            ->with('success', "Resep \"{$recipe->name}\" berhasil diperbarui.");
    }

    public function destroy(Recipe $recipe)
    {
        $tenant = app('tenant');
        abort_if($recipe->tenant_id !== $tenant->id, 403);

        // Delete recipe (and cascade deleting ingredients)
        $recipe->delete();

        return redirect()->route('recipes.index')
            ->with('success', 'Resep berhasil dihapus.');
    }
}
