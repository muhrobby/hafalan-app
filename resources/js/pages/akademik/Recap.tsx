import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import * as React from 'react';

type Row = {
    id: number;
    name: string;
    class?: string | null;
    totalSetoran: number;
    totalMurojaah: number;
    totalSelesai: number;
    records: number;
};

type Option = {
    id: number;
    name: string;
};

type Filters = {
    from: string;
    to: string;
    student_id?: string | null;
    class_id?: string | null;
};

type RecapPageProps = {
    rows: Row[];
    filters: Filters;
    availableFilters: {
        students: Option[];
        classes: Option[];
    };
};

const ALL_OPTION = '__all__';

const buildQuery = (filters: Filters) => {
    const query: Record<string, string> = {};

    if (filters.from) query.from = filters.from;
    if (filters.to) query.to = filters.to;
    if (filters.student_id && filters.student_id !== ALL_OPTION) {
        query.student_id = filters.student_id;
    }
    if (filters.class_id && filters.class_id !== ALL_OPTION) {
        query.class_id = filters.class_id;
    }

    return query;
};

const formatNumber = (value: number) => value.toLocaleString('id-ID');

export default function RecapPage({ rows, filters, availableFilters }: RecapPageProps) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const [localFilters, setLocalFilters] = React.useState<Filters>({
        from: filters.from,
        to: filters.to,
        student_id: filters.student_id ?? ALL_OPTION,
        class_id: filters.class_id ?? ALL_OPTION,
    });

    const applyFilters = React.useCallback(() => {
        router.get('/akademik/rekap-nilai', buildQuery(localFilters), {
            preserveScroll: true,
            replace: true,
        });
    }, [localFilters]);

    const buildReportUrl = (row: Row) => {
        const query = new URLSearchParams(
            buildQuery({
                from: localFilters.from,
                to: localFilters.to,
            }),
        ).toString();

        return `/reports/students/${row.id}${query ? `?${query}` : ''}`;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Filter Rangkuman Nilai
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-5">
                            <Input
                                type="date"
                                value={localFilters.from}
                                onChange={(event) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        from: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="date"
                                value={localFilters.to}
                                onChange={(event) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        to: event.target.value,
                                    }))
                                }
                            />
                            <Select
                                value={localFilters.student_id ?? ALL_OPTION}
                                onValueChange={(value) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        student_id: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua santri" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_OPTION}>
                                        Semua santri
                                    </SelectItem>
                                    {availableFilters.students.map((student) => (
                                        <SelectItem key={student.id} value={String(student.id)}>
                                            {student.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={localFilters.class_id ?? ALL_OPTION}
                                onValueChange={(value) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        class_id: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_OPTION}>Semua kelas</SelectItem>
                                    {availableFilters.classes.map((classe) => (
                                        <SelectItem key={classe.id} value={String(classe.id)}>
                                            {classe.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={applyFilters}>Terapkan</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rangkuman Nilai Hafalan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {safeRows.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                                Belum ada data hafalan pada periode yang dipilih.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead>Total Setoran</TableHead>
                                            <TableHead>Murojaah</TableHead>
                                            <TableHead>Selesai</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {safeRows.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.class ?? '—'}</TableCell>
                                                <TableCell>{formatNumber(row.totalSetoran)}</TableCell>
                                                <TableCell>{formatNumber(row.totalMurojaah)}</TableCell>
                                                <TableCell>{formatNumber(row.totalSelesai)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={buildReportUrl(row)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="mr-2 size-4" />
                                                            Cetak
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
