import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

export type HafalanTableRow = {
    id: number;
    date: string;
    dateDisplay: string;
    studentId: number;
    student: string;
    surahDisplay: string;
    surahId: number;
    fromAyah: number;
    status: 'murojaah' | 'selesai';
    teacher: string;
    notes: string;
    searchKey: string;
};

const STATUS_LABEL: Record<HafalanTableRow['status'], string> = {
    murojaah: 'Murojaah',
    selesai: 'Selesai',
};

export function buildHafalanColumns(): ColumnDef<HafalanTableRow>[] {
    return [
        {
            accessorKey: 'date',
            header: 'Tanggal',
            cell: ({ row }) => row.original.dateDisplay,
        },
        {
            accessorKey: 'student',
            header: 'Santri',
        },
        {
            accessorKey: 'surahDisplay',
            header: 'Surah',
        },
        {
            accessorKey: 'fromAyah',
            header: 'Ayat',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.status === 'selesai'
                            ? 'default'
                            : 'destructive'
                    }
                >
                    {STATUS_LABEL[row.original.status]}
                </Badge>
            ),
        },
        {
            accessorKey: 'teacher',
            header: 'Ustadz',
        },
        {
            accessorKey: 'notes',
            header: 'Catatan',
            cell: ({ row }) => (
                <span className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                    {row.original.notes}
                </span>
            ),
        },
    ];
}
