import { ColorfulBadge } from '@/components/data-table/colorful-badge';
import { ColumnDef } from '@tanstack/react-table';

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
                <ColorfulBadge
                    variant={
                        row.original.status === 'selesai'
                            ? 'success'
                            : 'warning'
                    }
                >
                    {STATUS_LABEL[row.original.status]}
                </ColorfulBadge>
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
                <span className="max-w-xs text-sm whitespace-pre-wrap text-muted-foreground">
                    {row.original.notes}
                </span>
            ),
        },
    ];
}
