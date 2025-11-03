'use client';

import { DataTableToolbar } from '@/components/data-table/toolbar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';
import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { HafalanTableRow } from './columns';

const STATUS_OPTIONS = [
    { label: 'Semua status', value: '__all__' },
    { label: 'Murojaah', value: 'murojaah' },
    { label: 'Selesai', value: 'selesai' },
];

const ALL_VALUE = '__all__';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const normalizeDate = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate());

const parseISODate = (value: string): Date | undefined => {
    const [year, month, day] = value
        .split('-')
        .map((segment) => Number(segment));

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return undefined;
    }

    return normalizeDate(new Date(year, month - 1, day));
};

const formatDisplayDate = (value?: Date) =>
    value ? dateFormatter.format(value) : '';

type Option = {
    id: number;
    name: string;
    code?: string;
};

type HafalanTableProps = {
    columns: ColumnDef<HafalanTableRow>[];
    data: HafalanTableRow[];
    studentOptions: Option[];
    surahOptions: Option[];
};

export function HafalanTable({
    columns,
    data,
    studentOptions,
    surahOptions,
}: HafalanTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [searchValue, setSearchValue] = React.useState('');
    const [statusValue, setStatusValue] = React.useState<string>(ALL_VALUE);
    const [studentValue, setStudentValue] = React.useState<string>(ALL_VALUE);
    const [surahValue, setSurahValue] = React.useState<string>(ALL_VALUE);
    const [fromDate, setFromDate] = React.useState<Date | undefined>();
    const [toDate, setToDate] = React.useState<Date | undefined>();
    const [fromOpen, setFromOpen] = React.useState(false);
    const [toOpen, setToOpen] = React.useState(false);

    const handleSelectFrom = React.useCallback(
        (value?: Date) => {
            if (!value) {
                setFromDate(undefined);
                return;
            }

            const normalized = normalizeDate(value);
            setFromDate(normalized);

            if (toDate && normalized > toDate) {
                setToDate(normalized);
            }
        },
        [toDate],
    );

    const handleSelectTo = React.useCallback(
        (value?: Date) => {
            if (!value) {
                setToDate(undefined);
                return;
            }

            const normalized = normalizeDate(value);
            setToDate(normalized);

            if (fromDate && normalized < fromDate) {
                setFromDate(normalized);
            }
        },
        [fromDate],
    );

    const filteredData = React.useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();
        const fromBound = fromDate ? normalizeDate(fromDate) : undefined;
        const toBound = toDate ? normalizeDate(toDate) : undefined;

        return data.filter((row) => {
            if (statusValue !== ALL_VALUE && row.status !== statusValue) {
                return false;
            }

            if (
                studentValue !== ALL_VALUE &&
                row.studentId !== Number.parseInt(studentValue, 10)
            ) {
                return false;
            }

            if (
                surahValue !== ALL_VALUE &&
                row.surahId !== Number.parseInt(surahValue, 10)
            ) {
                return false;
            }

            const rowDate = parseISODate(row.date);

            if (!rowDate) {
                return false;
            }

            if (fromBound && rowDate < fromBound) {
                return false;
            }

            if (toBound && rowDate > toBound) {
                return false;
            }

            if (normalizedSearch && !row.searchKey.includes(normalizedSearch)) {
                return false;
            }

            return true;
        });
    }, [
        data,
        fromDate,
        searchValue,
        statusValue,
        studentValue,
        surahValue,
        toDate,
    ]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    React.useEffect(() => {
        table.setPageIndex(0);
    }, [
        searchValue,
        statusValue,
        studentValue,
        surahValue,
        fromDate,
        toDate,
        table,
    ]);

    const isFiltered =
        searchValue !== '' ||
        statusValue !== ALL_VALUE ||
        studentValue !== ALL_VALUE ||
        surahValue !== ALL_VALUE ||
        Boolean(fromDate) ||
        Boolean(toDate);

    const resetFilters = () => {
        setSearchValue('');
        setStatusValue(ALL_VALUE);
        setStudentValue(ALL_VALUE);
        setSurahValue(ALL_VALUE);
        setFromDate(undefined);
        setToDate(undefined);
        setFromOpen(false);
        setToOpen(false);
    };

    const visibleColumnCount = columns.length;
    const totalFiltered = filteredData.length;
    const paginatedCount = table.getRowModel().rows.length;

    const columnLabels = {
        date: 'Tanggal',
        student: 'Santri',
        surahDisplay: 'Surah',
        fromAyah: 'Ayat',
        status: 'Status',
        teacher: 'Ustadz',
        notes: 'Catatan',
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="search">Pencarian</Label>
                    <Input
                        id="search"
                        placeholder="Cari santri, surah, atau catatan..."
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={statusValue}
                        onValueChange={(value) => setStatusValue(value)}
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="student">Santri</Label>
                    <Select
                        value={studentValue}
                        onValueChange={(value) => setStudentValue(value)}
                    >
                        <SelectTrigger id="student">
                            <SelectValue placeholder="Semua santri" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_VALUE}>
                                Semua santri
                            </SelectItem>
                            {studentOptions.map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={option.id.toString()}
                                >
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="surah">Surah</Label>
                    <Select
                        value={surahValue}
                        onValueChange={(value) => setSurahValue(value)}
                    >
                        <SelectTrigger id="surah">
                            <SelectValue placeholder="Semua surah" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_VALUE}>
                                Semua surah
                            </SelectItem>
                            {surahOptions.map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={option.id.toString()}
                                >
                                    {option.code
                                        ? `${option.code}. ${option.name}`
                                        : option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Dari tanggal</Label>
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'justify-between font-normal',
                                    !fromDate && 'text-muted-foreground',
                                )}
                            >
                                {fromDate
                                    ? formatDisplayDate(fromDate)
                                    : 'Pilih tanggal'}
                                <ChevronDownIcon className="h-4 w-4 opacity-60" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            className="w-auto overflow-hidden p-0"
                        >
                            <Calendar
                                mode="single"
                                selected={fromDate}
                                captionLayout="dropdown"
                                onSelect={(value) => {
                                    handleSelectFrom(value);
                                    setFromOpen(false);
                                }}
                                initialFocus
                                disabled={(date) =>
                                    toDate
                                        ? normalizeDate(date) >
                                          normalizeDate(toDate)
                                        : false
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Sampai tanggal</Label>
                    <Popover open={toOpen} onOpenChange={setToOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'justify-between font-normal',
                                    !toDate && 'text-muted-foreground',
                                )}
                            >
                                {toDate
                                    ? formatDisplayDate(toDate)
                                    : 'Pilih tanggal'}
                                <ChevronDownIcon className="h-4 w-4 opacity-60" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            className="w-auto overflow-hidden p-0"
                        >
                            <Calendar
                                mode="single"
                                selected={toDate}
                                captionLayout="dropdown"
                                onSelect={(value) => {
                                    handleSelectTo(value);
                                    setToOpen(false);
                                }}
                                disabled={(date) =>
                                    fromDate
                                        ? normalizeDate(date) <
                                          normalizeDate(fromDate)
                                        : false
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <Button
                    variant="outline"
                    onClick={resetFilters}
                    disabled={!isFiltered}
                    className="md:col-span-2 lg:col-span-1"
                >
                    Reset Filter
                </Button>
            </div>

            {/* DataTable Toolbar */}
            <DataTableToolbar
                table={table}
                filename="hafalan"
                columnLabels={columnLabels}
            />

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {paginatedCount ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumnCount || 1}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Data tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                    Menampilkan {paginatedCount} dari {totalFiltered} baris
                    hasil filter.
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
