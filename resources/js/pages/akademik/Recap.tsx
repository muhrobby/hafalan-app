import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    BookOpenCheck,
    FileText,
    Filter,
    Info,
    RotateCcw,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import * as React from 'react';
import { buildRecapColumns, RecapTableRow } from './recap-columns';
import { RecapDataTable } from './recap-data-table';

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

export default function RecapPage({
    rows,
    filters,
    availableFilters,
}: RecapPageProps) {
    const safeRows = React.useMemo(
        () => (Array.isArray(rows) ? rows : []),
        [rows],
    );

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

    const resetFilters = React.useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

        setLocalFilters({
            from: weekAgo,
            to: today,
            student_id: ALL_OPTION,
            class_id: ALL_OPTION,
        });
    }, []);

    const totalStats = React.useMemo(() => {
        return safeRows.reduce(
            (acc, row) => ({
                totalSetoran: acc.totalSetoran + row.totalSetoran,
                totalMurojaah: acc.totalMurojaah + row.totalMurojaah,
                totalSelesai: acc.totalSelesai + row.totalSelesai,
            }),
            { totalSetoran: 0, totalMurojaah: 0, totalSelesai: 0 },
        );
    }, [safeRows]);

    const buildReportUrl = React.useCallback(
        (row: RecapTableRow) => {
            const query = new URLSearchParams(
                buildQuery({
                    from: localFilters.from,
                    to: localFilters.to,
                }),
            ).toString();

            return `/reports/students/${row.id}${query ? `?${query}` : ''}`;
        },
        [localFilters],
    );

    const columns = React.useMemo(
        () => buildRecapColumns({ buildReportUrl }),
        [buildReportUrl],
    );

    return (
        <AppLayout>
            <Head title="Rangkuman Nilai" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:gap-6 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Rangkuman Nilai Hafalan
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                            Lihat dan unduh rangkuman setoran hafalan per santri
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                {safeRows.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                        <Card className="border-border/60 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Total Setoran
                                    </CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Jumlah total ayat yang
                                                disetorkan dalam periode filter
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="grid size-9 place-items-center rounded-lg bg-blue-500/15 sm:size-10">
                                    <BookOpenCheck className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold sm:text-3xl">
                                    {formatNumber(totalStats.totalSetoran)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Ayat terdaftar
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Total Murojaah
                                    </CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Hafalan yang diulang untuk
                                                penguatan dan pemantapan
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="grid size-9 place-items-center rounded-lg bg-amber-500/15 sm:size-10">
                                    <Sparkles className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5 dark:text-amber-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold sm:text-3xl">
                                    {formatNumber(totalStats.totalMurojaah)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Hafalan diulang
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 bg-gradient-to-br from-green-500/10 to-green-600/5 shadow-sm sm:col-span-2 lg:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Total Selesai
                                    </CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Hafalan yang sudah lancar dan
                                                sempurna
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="grid size-9 place-items-center rounded-lg bg-green-500/15 sm:size-10">
                                    <TrendingUp className="h-4 w-4 text-green-600 sm:h-5 sm:w-5 dark:text-green-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold sm:text-3xl">
                                    {formatNumber(totalStats.totalSelesai)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Hafalan lancar
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filter Card */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                                    <Filter className="h-5 w-5 text-white" />
                                </div>
                                <span>Filter Data</span>
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                className="w-full border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 sm:w-auto"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="from-date"
                                    className="text-sm font-medium"
                                >
                                    Dari Tanggal
                                </Label>
                                <Input
                                    id="from-date"
                                    type="date"
                                    value={localFilters.from}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            from: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="to-date"
                                    className="text-sm font-medium"
                                >
                                    Sampai Tanggal
                                </Label>
                                <Input
                                    id="to-date"
                                    type="date"
                                    value={localFilters.to}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            to: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="student-filter"
                                    className="text-sm font-medium"
                                >
                                    Santri
                                </Label>
                                <Select
                                    value={
                                        localFilters.student_id ?? ALL_OPTION
                                    }
                                    onValueChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            student_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="student-filter">
                                        <SelectValue placeholder="Semua santri" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL_OPTION}>
                                            Semua santri
                                        </SelectItem>
                                        {availableFilters.students.map(
                                            (student) => (
                                                <SelectItem
                                                    key={student.id}
                                                    value={String(student.id)}
                                                >
                                                    {student.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="class-filter"
                                    className="text-sm font-medium"
                                >
                                    Kelas
                                </Label>
                                <Select
                                    value={localFilters.class_id ?? ALL_OPTION}
                                    onValueChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            class_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="class-filter">
                                        <SelectValue placeholder="Semua kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL_OPTION}>
                                            Semua kelas
                                        </SelectItem>
                                        {availableFilters.classes.map(
                                            (classe) => (
                                                <SelectItem
                                                    key={classe.id}
                                                    value={String(classe.id)}
                                                >
                                                    {classe.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={applyFilters}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:from-purple-700 hover:to-pink-700"
                                >
                                    Terapkan Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table Card */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <span>
                                    Data Rangkuman ({safeRows.length} santri)
                                </span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RecapDataTable columns={columns} data={safeRows} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
