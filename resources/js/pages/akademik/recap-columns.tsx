import { ColorfulBadge } from '@/components/data-table/colorful-badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';

export type RecapTableRow = {
    id: number;
    name: string;
    class?: string | null;
    totalSetoran: number;
    totalMurojaah: number;
    totalSelesai: number;
    records: number;
};

const formatNumber = (value: number) => value.toLocaleString('id-ID');

type BuildColumnsParams = {
    buildReportUrl: (row: RecapTableRow) => string;
};

export function buildRecapColumns({
    buildReportUrl,
}: BuildColumnsParams): ColumnDef<RecapTableRow>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama Santri',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            accessorKey: 'class',
            header: 'Kelas',
            cell: ({ row }) => {
                const className = row.original.class;
                if (!className) {
                    return <span className="text-muted-foreground">—</span>;
                }
                return (
                    <ColorfulBadge variant="info" className="text-xs">
                        {className}
                    </ColorfulBadge>
                );
            },
        },
        {
            accessorKey: 'totalSetoran',
            header: () => <div className="text-right">Total Setoran</div>,
            cell: ({ row }) => (
                <div className="text-right font-semibold">
                    {formatNumber(row.original.totalSetoran)}
                </div>
            ),
        },
        {
            accessorKey: 'totalMurojaah',
            header: () => <div className="text-right">Murojaah</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <ColorfulBadge variant="warning" className="text-xs">
                        {formatNumber(row.original.totalMurojaah)}
                    </ColorfulBadge>
                </div>
            ),
        },
        {
            accessorKey: 'totalSelesai',
            header: () => <div className="text-right">Selesai</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <ColorfulBadge variant="success" className="text-xs">
                        {formatNumber(row.original.totalSelesai)}
                    </ColorfulBadge>
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => {
                const reportUrl = buildReportUrl(row.original);
                return (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 dark:from-blue-950 dark:to-purple-950"
                        >
                            <a
                                href={reportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Cetak PDF
                            </a>
                        </Button>
                    </div>
                );
            },
        },
    ];
}
