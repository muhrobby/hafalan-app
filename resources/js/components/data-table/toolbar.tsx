import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Table } from '@tanstack/react-table';
import { ChevronDown, Download, Settings2 } from 'lucide-react';
import * as React from 'react';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    filename?: string;
    columnLabels?: Record<string, string>;
}

const PAGE_SIZE_OPTIONS = [
    { label: '10 baris', value: '10' },
    { label: '20 baris', value: '20' },
    { label: '50 baris', value: '50' },
    { label: '100 baris', value: '100' },
];

function downloadCSV(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Convert data to CSV rows
    const csvRows = data.map((row) => {
        return headers
            .map((header) => {
                const value = row[header];
                // Handle values with commas, quotes, or newlines
                const stringValue = value?.toString() || '';
                if (
                    stringValue.includes(',') ||
                    stringValue.includes('"') ||
                    stringValue.includes('\n')
                ) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            })
            .join(',');
    });

    const csv = [csvHeaders, ...csvRows].join('\n');

    // Add BOM for UTF-8 encoding (helps Excel open Indonesian characters correctly)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
}

export function DataTableToolbar<TData>({
    table,
    filename = 'data',
    columnLabels = {},
}: DataTableToolbarProps<TData>) {
    const pageSize = table.getState().pagination.pageSize;

    const handleExportCSV = React.useCallback(() => {
        // Get all filtered rows (not just current page)
        const filteredRows = table.getFilteredRowModel().rows;
        const exportData = filteredRows.map(
            (row) => row.original as Record<string, unknown>,
        );

        downloadCSV(exportData, filename);
    }, [table, filename]);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tampilkan</span>
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value));
                    }}
                >
                    <SelectTrigger className="h-9 w-[140px] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                {/* Column Visibility Toggle */}
                <Tooltip>
                    <DropdownMenu>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-950 dark:to-pink-950"
                                >
                                    <Settings2 className="h-4 w-4" />
                                    Kolom
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Tampilkan atau sembunyikan kolom tabel</p>
                        </TooltipContent>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>
                                Tampilkan Kolom
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    const label =
                                        columnLabels[column.id] || column.id;
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                            className="capitalize"
                                        >
                                            {label}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Tooltip>

                {/* Export CSV Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCSV}
                            className="h-9 gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-950 dark:to-emerald-950"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Unduh semua data yang ditampilkan ke file CSV</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
