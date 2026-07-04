import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from './data-table';
import { columns, Supplier } from './columns';

// Definisikan breadcrumbs untuk halaman ini
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Supplier', href: '/admin/suppliers' },
];

interface Props {
    suppliers: Supplier[];
}

export default function SupplierIndex({ suppliers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Supplier" />

            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Kelola Supplier</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola semua data supplier, kontak, dan status operasional mereka untuk sistem ini.
                        </p>
                    </div>

                    {/* Tombol Tambah */}
                    <Link
                        href="/admin/supplier/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        + Tambah Supplier
                    </Link>
                </div>

                {/* Table Section */}
                <div className="space-y-4">
                    <DataTable columns={columns} data={suppliers} />
                </div>

            </div>
        </AppLayout>
    );
}