import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Product, type Recipe } from '@/types/mrp';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, BookOpen, Plus, Trash2, Calculator } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/utils-mrp';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resep (BOM)', href: '/recipes' },
    { title: 'Edit Resep', href: '#' },
];

interface RecipeIngredientRow {
    ingredient_id: number | null;
    ingredient_name: string;
    qty: number;
    unit: string;
    ingredient_cost: number;
    isFromInventory: boolean;
}

interface Props {
    recipe: Recipe & { ingredients: any[] };
    ingredients: Product[];
}

export default function RecipeEdit({ recipe, ingredients }: Props) {
    const [name, setName] = useState(recipe.name);
    const [description, setDescription] = useState(recipe.description ?? '');
    const [portionQty, setPortionQty] = useState(Number(recipe.portion_qty));
    const [recipes, setRecipes] = useState<RecipeIngredientRow[]>(
        recipe.ingredients.map(ing => ({
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.ingredient_name,
            qty: Number(ing.qty),
            unit: ing.unit,
            ingredient_cost: Number(ing.ingredient_cost),
            isFromInventory: ing.ingredient_id !== null,
        }))
    );
    const [processing, setProcessing] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const totalCost = recipes.reduce((sum, r) => sum + r.ingredient_cost * r.qty, 0);
    const hpp = portionQty > 0 ? totalCost / portionQty : totalCost;

    const addRecipe = () => {
        setRecipes([...recipes, { ingredient_id: null, ingredient_name: '', qty: 1, unit: 'gram', ingredient_cost: 0, isFromInventory: false }]);
    };

    const removeRecipe = (index: number) => {
        setRecipes(recipes.filter((_, i) => i !== index));
    };

    const updateRecipe = (index: number, field: keyof RecipeIngredientRow, value: string | number | boolean | null) => {
        const updated = [...recipes];
        (updated[index] as any)[field] = value;
        setRecipes(updated);
    };

    const selectIngredient = (index: number, productId: string) => {
        if (productId === 'custom') {
            updateRecipe(index, 'ingredient_id', null);
            updateRecipe(index, 'isFromInventory', false);
            updateRecipe(index, 'ingredient_name', '');
            updateRecipe(index, 'ingredient_cost', 0);
            updateRecipe(index, 'unit', 'gram');
        } else {
            const product = ingredients.find(p => p.id === parseInt(productId));
            if (product) {
                updateRecipe(index, 'ingredient_id', product.id);
                updateRecipe(index, 'ingredient_name', product.name);
                updateRecipe(index, 'ingredient_cost', Number(product.cost_price));
                updateRecipe(index, 'unit', product.unit);
                updateRecipe(index, 'isFromInventory', true);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setFormErrors({});
        router.put(`/recipes/${recipe.id}`, {
            name,
            description,
            portion_qty: portionQty,
            ingredients: recipes.map(r => ({
                ingredient_id: r.ingredient_id,
                ingredient_name: r.ingredient_name,
                qty: r.qty,
                unit: r.unit,
                ingredient_cost: r.ingredient_cost,
            })),
        }, {
            onError: (errors) => { setFormErrors(errors); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Resep: ${recipe.name}`} />

            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/recipes"><ArrowLeft size={18} /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="text-violet-500" size={22} />
                            Edit Resep: {recipe.name}
                        </h1>
                        <p className="text-muted-foreground text-sm">Ubah informasi resep dan takaran bahan baku</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Info Resep */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold">Informasi Resep</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label htmlFor="name">Nama Resep *</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Contoh: Resep Mochi Strawberry Choco"
                                        required
                                        className={formErrors.name ? 'border-rose-500' : ''}
                                    />
                                    {formErrors.name && <p className="text-xs text-rose-500">{formErrors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="portion_qty">Porsi Hasil (Pcs) *</Label>
                                    <Input
                                        id="portion_qty"
                                        type="number"
                                        min={1}
                                        value={portionQty}
                                        onChange={(e) => setPortionQty(parseInt(e.target.value) || 0)}
                                        required
                                        className={formErrors.portion_qty ? 'border-rose-500' : ''}
                                    />
                                    {formErrors.portion_qty && <p className="text-xs text-rose-500">{formErrors.portion_qty}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Deskripsi / Catatan Resep</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Masukkan detail pembuatan resep atau porsi dasar resep ini..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resep / BOM */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Bahan-Bahan Resep *</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addRecipe} className="rounded-xl h-8 gap-1 text-xs">
                                <Plus size={12} />
                                Tambah Bahan
                            </Button>
                        </div>

                        {formErrors.ingredients && <p className="text-xs text-rose-500">{formErrors.ingredients}</p>}

                        <div className="space-y-3">
                            {recipes.map((recipe, i) => (
                                <div key={i} className="flex gap-2 items-end">
                                    {/* Pilih Bahan */}
                                    <div className="flex-[3] min-w-[120px] space-y-1">
                                        {i === 0 && <Label className="text-xs text-muted-foreground">Pilih Bahan</Label>}
                                        <Select
                                            value={recipe.ingredient_id ? String(recipe.ingredient_id) : 'custom'}
                                            onValueChange={(v) => selectIngredient(i, v)}
                                        >
                                            <SelectTrigger className="h-9 text-xs rounded-xl">
                                                <SelectValue placeholder="Pilih..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="custom">✏️ Input Manual</SelectItem>
                                                {ingredients.map((ing) => (
                                                    <SelectItem key={ing.id} value={String(ing.id)}>
                                                        {ing.name} ({ing.unit})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Nama Bahan */}
                                    <div className="flex-[2] min-w-[90px] space-y-1">
                                        {i === 0 && <Label className="text-xs text-muted-foreground">Nama Bahan</Label>}
                                        <Input
                                            value={recipe.ingredient_name}
                                            onChange={(e) => updateRecipe(i, 'ingredient_name', e.target.value)}
                                            placeholder="Nama bahan"
                                            readOnly={recipe.isFromInventory}
                                            className={`h-9 text-xs rounded-xl ${recipe.isFromInventory ? 'bg-muted' : ''}`}
                                        />
                                    </div>
                                    {/* Qty */}
                                    <div className="w-20 space-y-1 shrink-0">
                                        {i === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                                        <Input
                                            type="number"
                                            min={0.1}
                                            step={0.1}
                                            value={recipe.qty}
                                            onChange={(e) => updateRecipe(i, 'qty', parseFloat(e.target.value) || 0)}
                                            className="h-9 text-xs rounded-xl"
                                        />
                                    </div>
                                    {/* Satuan */}
                                    <div className="w-16 space-y-1 shrink-0">
                                        {i === 0 && <Label className="text-xs text-muted-foreground">Satuan</Label>}
                                        <Input
                                            value={recipe.unit}
                                            onChange={(e) => updateRecipe(i, 'unit', e.target.value)}
                                            placeholder="gr"
                                            readOnly={recipe.isFromInventory}
                                            className={`h-9 text-xs rounded-xl ${recipe.isFromInventory ? 'bg-muted' : ''}`}
                                        />
                                    </div>
                                    {/* HPP/Unit */}
                                    <div className="w-24 space-y-1 shrink-0">
                                        {i === 0 && <Label className="text-xs text-muted-foreground">HPP/Unit</Label>}
                                        <Input
                                            type="text"
                                            value={recipe.ingredient_cost > 0 ? formatRupiah(recipe.ingredient_cost) : ''}
                                            onChange={(e) => updateRecipe(i, 'ingredient_cost', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                                            readOnly={recipe.isFromInventory}
                                            className={`h-9 text-xs rounded-xl ${recipe.isFromInventory ? 'bg-muted' : ''}`}
                                            placeholder="Rp0"
                                        />
                                    </div>
                                    {/* Total HPP */}
                                    <div className="w-28 space-y-1 shrink-0">
                                        {i === 0 && <Label className="text-xs text-muted-foreground">Total HPP</Label>}
                                        <Input
                                            type="text"
                                            value={recipe.qty * recipe.ingredient_cost > 0 ? formatRupiah(recipe.qty * recipe.ingredient_cost) : ''}
                                            readOnly
                                            className="h-9 text-xs rounded-xl bg-muted font-medium"
                                            placeholder="Rp0"
                                        />
                                    </div>
                                    {/* Hapus */}
                                    <div className="w-9 shrink-0">
                                        {i === 0 && <div className="text-xs text-transparent mb-1">-</div>}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={recipes.length === 1}
                                            onClick={() => removeRecipe(i)}
                                            className="h-9 w-full rounded-xl text-rose-500 hover:bg-rose-50"
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HPP Preview */}
                    <div className="rounded-2xl p-5 border border-violet-200 bg-violet-50 dark:bg-violet-950/20 flex items-center gap-4">
                        <Calculator size={20} className="text-violet-600 shrink-0" />
                        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-xs text-muted-foreground mb-0.5">Total HPP 1 Adonan / Resep</div>
                                <div className="text-lg font-bold text-violet-700 dark:text-violet-400">{formatRupiah(totalCost)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-0.5">HPP per Pcs (Hasil Porsi)</div>
                                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(hpp)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="rounded-xl"><Link href="/recipes">Batal</Link></Button>
                        <Button type="submit" disabled={processing} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
