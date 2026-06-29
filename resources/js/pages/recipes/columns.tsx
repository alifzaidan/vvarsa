'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DeleteConfirmDialog from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, BookOpen } from 'lucide-react';
import { formatRupiah } from '@/lib/utils-mrp';
import { type Recipe } from '@/types/mrp';

function RecipeActions({ recipe }: { recipe: Recipe }) {
    const handleDelete = () => {
        router.delete(`/recipes/${recipe.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center justify-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/recipes/${recipe.id}/edit`}>
                            <Edit className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit Resep</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DeleteConfirmDialog
                            trigger={
                                <Button variant="link" size="icon" className="size-8 text-red-500 hover:cursor-pointer">
                                    <Trash className="size-4" />
                                    <span className="sr-only">Hapus Resep</span>
                                </Button>
                            }
                            title="Apakah Anda yakin ingin menghapus resep ini?"
                            itemName={recipe.name}
                            onConfirm={handleDelete}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hapus Resep</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export const columns: ColumnDef<Recipe>[] = [
    {
        accessorKey: 'no',
        header: 'No',
        cell: ({ row }) => {
            const index = row.index + 1;
            return <div className="font-medium">{index}</div>;
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Resep" />,
        cell: ({ row }) => {
            const recipe = row.original;
            return (
                <div className="flex items-center gap-2">
                    <div className="bg-violet-50 dark:bg-violet-950/40 p-1.5 rounded-lg text-violet-500">
                        <BookOpen size={16} />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-violet-600 dark:text-violet-400">{recipe.name}</div>
                        {recipe.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{recipe.description}</div>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'ingredients',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bahan-bahan" />,
        cell: ({ row }) => {
            const ingredients = row.original.ingredients ?? [];
            return (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {ingredients.map((ing: any, i: number) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {ing.ingredient_name} ({Number(ing.qty)} {ing.unit})
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'total_cost',
        header: ({ column }) => <DataTableColumnHeader column={column} title="HPP 1 Adonan" />,
        cell: ({ row }) => {
            return (
                <div className="text-right text-muted-foreground font-medium">
                    {formatRupiah(row.original.total_cost ?? 0)}
                </div>
            );
        },
    },
    {
        accessorKey: 'portion_qty',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Porsi Hasil" />,
        cell: ({ row }) => {
            return (
                <div className="text-right text-muted-foreground font-medium">
                    {Number(row.original.portion_qty)} pcs
                </div>
            );
        },
    },
    {
        accessorKey: 'hpp',
        header: ({ column }) => <DataTableColumnHeader column={column} title="HPP per Pcs" />,
        cell: ({ row }) => {
            return (
                <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(row.original.hpp ?? 0)}
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => <RecipeActions recipe={row.original} />,
    },
];
