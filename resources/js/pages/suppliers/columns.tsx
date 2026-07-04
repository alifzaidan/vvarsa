import { ColumnDef } from '@tanstack/react-table';
import { Supplier } from '@/types/mrp';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export const columns: ColumnDef<Supplier>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Supplier',
    },
    {
        accessorKey: 'business_type',
        header: 'Tipe Bisnis',
    },
    {
        accessorKey: 'city',
        header: 'Kota',
    },
    {
        accessorKey: 'phone',
        header: 'Telepon',
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const supplier = row.original;
            return (
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/suppliers/${supplier.id}/edit`}>
                        <Edit size={16} />
                    </Link>
                </Button>
            );
        },
    },
];