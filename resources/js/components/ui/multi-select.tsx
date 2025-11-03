import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type MultiSelectOption = {
    label: string;
    value: string | number;
};

interface MultiSelectProps {
    options: MultiSelectOption[];
    selected: (string | number)[];
    onChange: (selected: (string | number)[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Pilih...',
    disabled = false,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleToggle = (value: string | number) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleRemove = (value: string | number) => {
        onChange(selected.filter((item) => item !== value));
    };

    const handleClear = () => {
        onChange([]);
    };

    const selectedLabels = options
        .filter((option) => selected.includes(option.value))
        .map((option) => option.label);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'h-auto min-h-9 w-full justify-between',
                        className,
                    )}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap items-center gap-1">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground">
                                {placeholder}
                            </span>
                        ) : (
                            <>
                                {selectedLabels.slice(0, 2).map((label) => (
                                    <Badge
                                        key={label}
                                        variant="secondary"
                                        className="mr-1 mb-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const option = options.find(
                                                (o) => o.label === label,
                                            );
                                            if (option) {
                                                handleRemove(option.value);
                                            }
                                        }}
                                    >
                                        {label}
                                        <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                ))}
                                {selected.length > 2 && (
                                    <Badge variant="secondary" className="mb-1">
                                        +{selected.length - 2} lainnya
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {selected.length > 0 && (
                            <X
                                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                            />
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-3" align="start">
                <div className="space-y-2">
                    {options.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Tidak ada opsi tersedia
                        </p>
                    ) : (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`option-${option.value}`}
                                    checked={selected.includes(option.value)}
                                    onCheckedChange={() =>
                                        handleToggle(option.value)
                                    }
                                />
                                <Label
                                    htmlFor={`option-${option.value}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                >
                                    {option.label}
                                </Label>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
