import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { cn } from '@/lib/utils';
import { CalendarIcon, Download, Filter, RotateCcw } from 'lucide-react';
import * as React from 'react';

const ALL_OPTION = '__all__';

type FilterOption = {
    value: string | number;
    label: string;
};

export type FilterField = {
    name: string;
    label: string;
    type: 'select' | 'date-range';
    options?: FilterOption[];
    placeholder?: string;
};

type TableFiltersProps = {
    fields: FilterField[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
    onReset: () => void;
    onExport?: () => void;
    exportLabel?: string;
};

const parseISODate = (value?: string | null) => {
    if (!value) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
    return new Date(year, month - 1, day);
};

const toISODate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value?: Date) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          }).format(value)
        : 'Pilih tanggal';

export function TableFilters({
    fields,
    values,
    onChange,
    onReset,
    onExport,
    exportLabel = 'Export',
}: TableFiltersProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Count active filters
    const activeCount = Object.entries(values).filter(
        ([key, value]) =>
            value !== null &&
            value !== undefined &&
            value !== '' &&
            value !== ALL_OPTION,
    ).length;

    return (
        <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                        {activeCount > 0 && (
                            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                {activeCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Filter Data</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onReset}
                            >
                                <RotateCcw className="mr-2 h-3 w-3" />
                                Reset
                            </Button>
                        </div>

                        {fields.map((field) => {
                            if (field.type === 'select') {
                                return (
                                    <div key={field.name} className="space-y-2">
                                        <Label htmlFor={field.name}>
                                            {field.label}
                                        </Label>
                                        <Select
                                            value={
                                                values[field.name] || ALL_OPTION
                                            }
                                            onValueChange={(val) =>
                                                onChange(
                                                    field.name,
                                                    val === ALL_OPTION
                                                        ? null
                                                        : val,
                                                )
                                            }
                                        >
                                            <SelectTrigger id={field.name}>
                                                <SelectValue
                                                    placeholder={
                                                        field.placeholder ||
                                                        'Pilih...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ALL_OPTION}>
                                                    Semua
                                                </SelectItem>
                                                {field.options?.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={String(opt.value)}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }

                            if (field.type === 'date-range') {
                                const fromDate = parseISODate(
                                    values[`${field.name}_from`],
                                );
                                const toDate = parseISODate(
                                    values[`${field.name}_to`],
                                );

                                return (
                                    <div key={field.name} className="space-y-2">
                                        <Label>{field.label}</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor={`${field.name}_from`}
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Dari
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id={`${field.name}_from`}
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !fromDate &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {fromDate
                                                                ? formatDisplayDate(
                                                                      fromDate,
                                                                  )
                                                                : 'Pilih'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={fromDate}
                                                            onSelect={(date) =>
                                                                onChange(
                                                                    `${field.name}_from`,
                                                                    date
                                                                        ? toISODate(
                                                                              date,
                                                                          )
                                                                        : null,
                                                                )
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor={`${field.name}_to`}
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Sampai
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id={`${field.name}_to`}
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !toDate &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {toDate
                                                                ? formatDisplayDate(
                                                                      toDate,
                                                                  )
                                                                : 'Pilih'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={toDate}
                                                            onSelect={(date) =>
                                                                onChange(
                                                                    `${field.name}_to`,
                                                                    date
                                                                        ? toISODate(
                                                                              date,
                                                                          )
                                                                        : null,
                                                                )
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                </PopoverContent>
            </Popover>

            {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    {exportLabel}
                </Button>
            )}
        </div>
    );
}
