'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate, formatRupiah } from '@/lib/utils-mrp';
import { type TaxReport } from '@/types/mrp';
import { FileText, Calendar } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 hover:bg-slate-150',
    submitted: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    paid: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
};

const STATUS_LABELS: Record<string, string> = { 
    draft: 'Draft', 
    submitted: 'Dilaporkan', 
    paid: 'Lunas' 
};

export const columns: ColumnDef<TaxReport>[] = [
    {
        accessorKey: 'period',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Periode" />,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                        <FileText size={16} />
                    </div>
                    <div className="font-semibold text-sm text-foreground">{row.original.period}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'tax_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis Pajak" />,
        cell: ({ row }) => {
            return <span className="text-sm font-medium">{row.original.tax_type}</span>;
        },
    },
    {
        accessorKey: 'gross_amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Omzet Bruto" />,
        cell: ({ row }) => {
            return <div className="text-right text-sm">{formatRupiah(row.original.gross_amount)}</div>;
        },
    },
    {
        accessorKey: 'tax_amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah Pajak" />,
        cell: ({ row }) => {
            return <div className="text-right text-sm font-bold text-foreground">{formatRupiah(row.original.tax_amount)}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="text-center">
                    <Badge variant="outline" className={`capitalize border-transparent ${STATUS_STYLES[status]}`}>
                        {STATUS_LABELS[status] || status}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'due_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Jatuh Tempo" />,
        cell: ({ row }) => {
            const dueDate = row.original.due_date;
            return (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Calendar size={14} className="opacity-60" />
                    <span>
                        {dueDate ? formatDate(dueDate, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                </div>
            );
        },
    },
];
