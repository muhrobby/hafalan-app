import * as React from 'react';
import { Button } from '@/components/ui/button';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Filter, X, Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { router } from '@inertiajs/react';

type FilterValue = string | number | boolean | null | undefined;

export interface FilterConfig {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'boolean';
    options?: { value: string | number; label: string }[];
    placeholder?: string;
}

interface AdvancedFilterProps {
    filters: Record<string, FilterValue>;
    filterConfigs: FilterConfig[];
    onFilterChange: (filters: Record<string, FilterValue>) => void;
    onReset: () => void;
    onExport?: () => void;
    exportLabel?: string;
}

export function AdvancedFilter({
    filters,
    filterConfigs,
    onFilterChange,
    onReset,
    onExport,
    exportLabel = 'Export Excel',
}: AdvancedFilterProps) {
    const [localFilters, setLocalFilters] = React.useState(filters);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (name: string, value: FilterValue) => {
        setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
        setIsOpen(false);
    };

    const resetFilters = () => {
        const emptyFilters = Object.keys(localFilters).reduce(
            (acc, key) => ({ ...acc, [key]: '' }),
            {},
        );
        setLocalFilters(emptyFilters);
        onReset();
        setIsOpen(false);
    };

    const activeFilterCount = Object.values(filters).filter(
        (v) => v !== '' && v !== null && v !== undefined,
    ).length;

    return (
        <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="start">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Filter Data</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Reset
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {filterConfigs.map((config) => (
                                <div key={config.name} className="space-y-2">
                                    <Label htmlFor={config.name}>
                                        {config.label}
                                    </Label>

                                    {config.type === 'text' && (
                                        <Input
                                            id={config.name}
                                            placeholder={config.placeholder}
                                            value={
                                                (localFilters[config.name] as string) || ''
                                            }
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    config.name,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    )}

                                    {config.type === 'select' && (
                                        <Select
                                            value={
                                                localFilters[config.name]
                                                    ? String(localFilters[config.name])
                                                    : undefined
                                            }
                                            onValueChange={(value) =>
                                                handleFilterChange(
                                                    config.name,
                                                    value === '__clear__' ? null : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        config.placeholder ||
                                                        'Pilih...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__clear__">
                                                    Semua
                                                </SelectItem>
                                                {config.options?.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={String(option.value)}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {config.type === 'date' && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !localFilters[config.name] &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {localFilters[config.name] ? (
                                                        format(
                                                            new Date(
                                                                localFilters[
                                                                    config.name
                                                                ] as string,
                                                            ),
                                                            'PPP',
                                                            { locale: id },
                                                        )
                                                    ) : (
                                                        <span>
                                                            {config.placeholder ||
                                                                'Pilih tanggal'}
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        localFilters[config.name]
                                                            ? new Date(
                                                                  localFilters[
                                                                      config.name
                                                                  ] as string,
                                                              )
                                                            : undefined
                                                    }
                                                    onSelect={(date) =>
                                                        handleFilterChange(
                                                            config.name,
                                                            date
                                                                ? format(
                                                                      date,
                                                                      'yyyy-MM-dd',
                                                                  )
                                                                : null,
                                                        )
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    {config.type === 'boolean' && (
                                        <Select
                                            value={
                                                localFilters[config.name] === null ||
                                                localFilters[config.name] === undefined
                                                    ? '__all__'
                                                    : String(localFilters[config.name])
                                            }
                                            onValueChange={(value) =>
                                                handleFilterChange(
                                                    config.name,
                                                    value === '__all__' ? null : value === 'true',
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        config.placeholder || 'Semua'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">Semua</SelectItem>
                                                {config.options?.map((option) => (
                                                    <SelectItem
                                                        key={String(option.value)}
                                                        value={String(option.value)}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button size="sm" onClick={applyFilters}>
                                Terapkan Filter
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {onExport && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    {exportLabel}
                </Button>
            )}
        </div>
    );
}
