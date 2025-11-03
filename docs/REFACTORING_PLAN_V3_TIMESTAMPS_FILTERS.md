# 📋 PLAN REFACTORING V3: TIMESTAMPS & ADVANCED FILTERS

**Tanggal:** 26 Oktober 2025  
**Tujuan:** 
1. Pastikan semua tabel manajemen pengguna punya `created_at` dan `updated_at`
2. Semua komponen UI menggunakan shadcn/ui
3. Tambahkan filter lengkap (search, role, class, date range, sort)

---

## 🎯 PART 1: TIMESTAMPS DI SEMUA TABEL

### **Audit Tabel Database**

#### ✅ **Tabel yang Sudah Punya Timestamps:**
```sql
users (created_at, updated_at, email_verified_at)
students (created_at, updated_at)
guardians (created_at, updated_at)
teachers (created_at, updated_at)
guardian_student (created_at, updated_at)
classes (created_at, updated_at)
hafalans (created_at, updated_at)
```

#### ✅ **Tabel yang Akan Dibuat (Profiles Architecture):**
```sql
profiles (created_at, updated_at)
profile_relations (created_at, updated_at)
```

**Kesimpulan:** ✅ Semua tabel sudah atau akan punya timestamps. Good!

### **Backend: Return Timestamps di API Response**

#### **1. Update StudentsController::index()**

**File:** `app/Http/Controllers/StudentsController.php`

```php
public function index(Request $request)
{
    $this->authorize('viewAny', Student::class);

    $query = Student::query()
        ->with(['user', 'class', 'guardians.user'])
        ->when(
            $request->input('search'),
            fn ($q, $search) => $q->where(function ($qq) use ($search) {
                $qq->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('nis', 'like', "%{$search}%");
            })
        )
        // Filter by class
        ->when(
            $request->input('class_id'),
            fn ($q, $classId) => $q->where('class_id', $classId)
        )
        // Filter by date range (created_at)
        ->when(
            $request->input('date_from'),
            fn ($q, $dateFrom) => $q->whereDate('created_at', '>=', $dateFrom)
        )
        ->when(
            $request->input('date_to'),
            fn ($q, $dateTo) => $q->whereDate('created_at', '<=', $dateTo)
        )
        // Filter by has guardians
        ->when(
            $request->input('has_guardian') !== null,
            fn ($q) => $request->input('has_guardian') 
                ? $q->has('guardians')
                : $q->doesntHave('guardians')
        );

    // Sorting
    $sortField = $request->input('sort', 'created_at');
    $sortOrder = $request->input('order', 'desc');
    
    $allowedSorts = ['created_at', 'updated_at', 'nis', 'id'];
    if (!in_array($sortField, $allowedSorts)) {
        $sortField = 'created_at';
    }
    
    $query->orderBy($sortField, $sortOrder);

    $students = $query
        ->paginate(25)
        ->withQueryString()
        ->through(fn (Student $student) => [
            'id'         => $student->id,
            'user_id'    => $student->user_id,
            'name'       => $student->user->name,
            'email'      => $student->user->email,
            'nis'        => $student->nis,
            'class'      => $student->class?->name,
            'class_id'   => $student->class_id,
            'class_name' => $student->class?->name,
            'birth_date' => optional($student->birth_date)->format('Y-m-d'),
            'phone'      => $student->phone,
            'guardians'  => $student->guardians->map(fn($g) => [
                'id' => $g->id,
                'name' => $g->user->name,
            ]),
            'guardians_count' => $student->guardians->count(),
            'created_at' => $student->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $student->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $student->created_at->diffForHumans(),
            'updated_at_human' => $student->updated_at->diffForHumans(),
        ]);

    // Available options for filters
    $availableClasses = Classe::select('id', 'name')
        ->orderBy('name')
        ->get();

    $availableGuardians = Guardian::with('user:id,name,email')
        ->get()
        ->map(fn($g) => [
            'value' => $g->id,
            'label' => $g->user->name . ' (' . $g->user->email . ')',
        ]);

    return Inertia::render('students/index', [
        'students'  => $students,
        'filters'   => $request->only([
            'search',
            'class_id',
            'date_from',
            'date_to',
            'has_guardian',
            'sort',
            'order',
        ]),
        'canManage' => $request->user()?->can('manage-users') ?? false,
        'availableGuardians' => $availableGuardians,
        'availableClasses' => $availableClasses,
    ]);
}
```

#### **2. Update GuardianController::index()**

```php
public function index(Request $request)
{
    $this->authorize('viewAny', Guardian::class);

    $query = Guardian::query()
        ->with(['user', 'students.user', 'students.class'])
        ->when(
            $request->input('search'),
            fn ($q, $search) => $q->where(function ($qq) use ($search) {
                $qq->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('phone', 'like', "%{$search}%");
            })
        )
        // Filter by has students
        ->when(
            $request->input('has_student') !== null,
            fn ($q) => $request->input('has_student')
                ? $q->has('students')
                : $q->doesntHave('students')
        )
        // Filter by date range
        ->when(
            $request->input('date_from'),
            fn ($q, $dateFrom) => $q->whereDate('created_at', '>=', $dateFrom)
        )
        ->when(
            $request->input('date_to'),
            fn ($q, $dateTo) => $q->whereDate('created_at', '<=', $dateTo)
        );

    // Sorting
    $sortField = $request->input('sort', 'created_at');
    $sortOrder = $request->input('order', 'desc');
    $query->orderBy($sortField, $sortOrder);

    $guardians = $query
        ->paginate(25)
        ->withQueryString()
        ->through(fn (Guardian $guardian) => [
            'id'       => $guardian->id,
            'user_id'  => $guardian->user_id,
            'name'     => $guardian->user->name,
            'email'    => $guardian->user->email,
            'phone'    => $guardian->phone,
            'students' => $guardian->students->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
                'nis' => $s->nis,
                'class' => $s->class?->name,
            ]),
            'students_count' => $guardian->students->count(),
            'created_at' => $guardian->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $guardian->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $guardian->created_at->diffForHumans(),
            'updated_at_human' => $guardian->updated_at->diffForHumans(),
        ]);

    $availableStudents = Student::with('user:id,name,email')
        ->get()
        ->map(fn($s) => [
            'value' => $s->id,
            'label' => $s->user->name . ' - ' . $s->nis,
        ]);

    return Inertia::render('guardians/index', [
        'guardians' => $guardians,
        'filters'   => $request->only([
            'search',
            'has_student',
            'date_from',
            'date_to',
            'sort',
            'order',
        ]),
        'canManage' => $request->user()?->can('manage-users') ?? false,
        'availableStudents' => $availableStudents,
    ]);
}
```

#### **3. Update TeachersController::index()**

```php
public function index(Request $request)
{
    $this->authorize('viewAny', Teacher::class);

    $query = Teacher::query()
        ->with(['user', 'classes'])
        ->when(
            $request->input('search'),
            fn ($q, $search) => $q->where(function ($qq) use ($search) {
                $qq->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('nip', 'like', "%{$search}%");
            })
        )
        // Filter by has classes
        ->when(
            $request->input('has_class') !== null,
            fn ($q) => $request->input('has_class')
                ? $q->has('classes')
                : $q->doesntHave('classes')
        )
        // Filter by date range
        ->when(
            $request->input('date_from'),
            fn ($q, $dateFrom) => $q->whereDate('created_at', '>=', $dateFrom)
        )
        ->when(
            $request->input('date_to'),
            fn ($q, $dateTo) => $q->whereDate('created_at', '<=', $dateTo)
        );

    // Sorting
    $sortField = $request->input('sort', 'created_at');
    $sortOrder = $request->input('order', 'desc');
    $query->orderBy($sortField, $sortOrder);

    $teachers = $query
        ->paginate(25)
        ->withQueryString()
        ->through(fn (Teacher $teacher) => [
            'id'       => $teacher->id,
            'user_id'  => $teacher->user_id,
            'name'     => $teacher->user->name,
            'email'    => $teacher->user->email,
            'nip'      => $teacher->nip,
            'phone'    => $teacher->phone,
            'classes'  => $teacher->classes->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
            ]),
            'classes_count' => $teacher->classes->count(),
            'created_at' => $teacher->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $teacher->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $teacher->created_at->diffForHumans(),
            'updated_at_human' => $teacher->updated_at->diffForHumans(),
        ]);

    $availableClasses = Classe::select('id', 'name')
        ->orderBy('name')
        ->get()
        ->map(fn($c) => [
            'value' => $c->id,
            'label' => $c->name,
        ]);

    return Inertia::render('teachers/index', [
        'teachers'  => $teachers,
        'filters'   => $request->only([
            'search',
            'has_class',
            'date_from',
            'date_to',
            'sort',
            'order',
        ]),
        'canManage' => $request->user()?->can('manage-users') ?? false,
        'availableClasses' => $availableClasses,
    ]);
}
```

#### **4. Update AdminUserController::index()**

```php
public function index(Request $request)
{
    $this->authorize('manage-users');

    $query = User::query()
        ->with('roles')
        ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
        ->when(
            $request->input('search'),
            fn ($q, $search) => $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%");
            })
        )
        // Filter by date range
        ->when(
            $request->input('date_from'),
            fn ($q, $dateFrom) => $q->whereDate('created_at', '>=', $dateFrom)
        )
        ->when(
            $request->input('date_to'),
            fn ($q, $dateTo) => $q->whereDate('created_at', '<=', $dateTo)
        );

    // Sorting
    $sortField = $request->input('sort', 'created_at');
    $sortOrder = $request->input('order', 'desc');
    $query->orderBy($sortField, $sortOrder);

    $admins = $query
        ->paginate(25)
        ->withQueryString()
        ->through(fn (User $user) => [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $user->created_at->diffForHumans(),
            'updated_at_human' => $user->updated_at->diffForHumans(),
        ]);

    return Inertia::render('admins/index', [
        'admins'   => $admins,
        'filters'  => $request->only([
            'search',
            'date_from',
            'date_to',
            'sort',
            'order',
        ]),
        'canManage'=> $request->user()?->can('manage-users') ?? false,
    ]);
}
```

---

## 🎨 PART 2: SHADCN/UI COMPONENTS YANG DIPERLUKAN

### **Komponen yang Sudah Ada:**
✅ Button  
✅ Card  
✅ Dialog  
✅ Input  
✅ Label  
✅ Table  
✅ Alert  
✅ Badge  
✅ Dropdown Menu  
✅ Popover  
✅ Calendar  

### **Komponen yang Perlu Ditambahkan:**

#### **1. Select Component**

**File:** `resources/js/components/ui/select.tsx`

```bash
npx shadcn-ui@latest add select
```

Atau buat manual:

```tsx
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
            className,
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className,
        )}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className,
        )}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                position === 'popper' &&
                    'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                className,
            )}
            position={position}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    'p-1',
                    position === 'popper' &&
                        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
        {...props}
    />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            className,
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...props}
    />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
};
```

#### **2. Date Range Picker Component**

**File:** `resources/js/components/ui/date-range-picker.tsx`

```tsx
import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type DateRangePickerProps = {
    dateRange?: DateRange;
    onDateRangeChange: (range: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
};

export function DateRangePicker({
    dateRange,
    onDateRangeChange,
    className,
    placeholder = 'Pilih rentang tanggal',
}: DateRangePickerProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateRange && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, 'dd MMM yyyy', {
                                        locale: id,
                                    })}{' '}
                                    -{' '}
                                    {format(dateRange.to, 'dd MMM yyyy', {
                                        locale: id,
                                    })}
                                </>
                            ) : (
                                format(dateRange.from, 'dd MMM yyyy', {
                                    locale: id,
                                })
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={onDateRangeChange}
                        numberOfMonths={2}
                        locale={id}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
```

#### **3. Filter Bar Component**

**File:** `resources/js/components/filter-bar.tsx`

```tsx
import * as React from 'react';
import { router } from '@inertiajs/react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FilterOption = {
    value: string;
    label: string;
};

export type FilterConfig = {
    search?: {
        enabled: boolean;
        placeholder?: string;
    };
    select?: {
        name: string;
        label: string;
        options: FilterOption[];
        placeholder?: string;
    }[];
    dateRange?: {
        enabled: boolean;
        label?: string;
    };
    sort?: {
        enabled: boolean;
        options: FilterOption[];
        defaultField?: string;
        defaultOrder?: 'asc' | 'desc';
    };
};

type FilterBarProps = {
    filters: Record<string, any>;
    config: FilterConfig;
    onFilterChange?: (filters: Record<string, any>) => void;
    className?: string;
};

export function FilterBar({
    filters,
    config,
    onFilterChange,
    className,
}: FilterBarProps) {
    const [localFilters, setLocalFilters] = React.useState(filters);
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    // Debounced search
    const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

    const updateFilters = (key: string, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        if (onFilterChange) {
            onFilterChange(newFilters);
        } else {
            // Default behavior: reload dengan query params
            router.get(
                window.location.pathname,
                { ...newFilters },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const handleSearchChange = (value: string) => {
        setLocalFilters({ ...localFilters, search: value });

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            updateFilters('search', value);
        }, 500);
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        const newFilters = { ...localFilters };

        if (range?.from) {
            newFilters.date_from = range.from.toISOString().split('T')[0];
        } else {
            delete newFilters.date_from;
        }

        if (range?.to) {
            newFilters.date_to = range.to.toISOString().split('T')[0];
        } else {
            delete newFilters.date_to;
        }

        setLocalFilters(newFilters);
        updateFilters('date_from', newFilters.date_from);
        updateFilters('date_to', newFilters.date_to);
    };

    const clearFilters = () => {
        const clearedFilters = {};
        setLocalFilters(clearedFilters);

        if (onFilterChange) {
            onFilterChange(clearedFilters);
        } else {
            router.get(window.location.pathname, {}, { preserveState: false });
        }
    };

    const activeFiltersCount = Object.keys(localFilters).filter(
        (key) => localFilters[key] && key !== 'sort' && key !== 'order',
    ).length;

    const dateRange: DateRange | undefined = React.useMemo(() => {
        if (localFilters.date_from || localFilters.date_to) {
            return {
                from: localFilters.date_from
                    ? new Date(localFilters.date_from)
                    : undefined,
                to: localFilters.date_to
                    ? new Date(localFilters.date_to)
                    : undefined,
            };
        }
        return undefined;
    }, [localFilters.date_from, localFilters.date_to]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Primary Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                {/* Search */}
                {config.search?.enabled && (
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={
                                config.search.placeholder ?? 'Cari...'
                            }
                            value={localFilters.search ?? ''}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                        {localFilters.search && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                                onClick={() => handleSearchChange('')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Toggle Advanced Filters */}
                <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="relative"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {activeFiltersCount > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-2 rounded-full px-1.5 py-0"
                        >
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-muted-foreground"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Select Filters */}
                    {config.select?.map((selectConfig) => (
                        <div key={selectConfig.name} className="space-y-2">
                            <label className="text-sm font-medium">
                                {selectConfig.label}
                            </label>
                            <Select
                                value={localFilters[selectConfig.name] ?? ''}
                                onValueChange={(value) =>
                                    updateFilters(selectConfig.name, value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            selectConfig.placeholder ??
                                            'Pilih...'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua</SelectItem>
                                    {selectConfig.options.map((option) => (
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
                    ))}

                    {/* Date Range Filter */}
                    {config.dateRange?.enabled && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {config.dateRange.label ?? 'Rentang Tanggal'}
                            </label>
                            <DateRangePicker
                                dateRange={dateRange}
                                onDateRangeChange={handleDateRangeChange}
                            />
                        </div>
                    )}

                    {/* Sort */}
                    {config.sort?.enabled && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Urutkan Berdasarkan
                                </label>
                                <Select
                                    value={
                                        localFilters.sort ??
                                        config.sort.defaultField ??
                                        'created_at'
                                    }
                                    onValueChange={(value) =>
                                        updateFilters('sort', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih urutan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {config.sort.options.map((option) => (
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Urutan
                                </label>
                                <Select
                                    value={
                                        localFilters.order ??
                                        config.sort.defaultOrder ??
                                        'desc'
                                    }
                                    onValueChange={(value) =>
                                        updateFilters('order', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih arah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">
                                            Ascending (A-Z, 0-9)
                                        </SelectItem>
                                        <SelectItem value="desc">
                                            Descending (Z-A, 9-0)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(localFilters).map(([key, value]) => {
                        if (
                            !value ||
                            key === 'sort' ||
                            key === 'order' ||
                            key === 'search'
                        ) {
                            return null;
                        }

                        let label = key;
                        let displayValue = value;

                        // Find label for select filters
                        const selectConfig = config.select?.find(
                            (s) => s.name === key,
                        );
                        if (selectConfig) {
                            label = selectConfig.label;
                            const option = selectConfig.options.find(
                                (o) => o.value === value,
                            );
                            if (option) {
                                displayValue = option.label;
                            }
                        }

                        return (
                            <Badge
                                key={key}
                                variant="secondary"
                                className="gap-1"
                            >
                                <span className="font-medium">{label}:</span>
                                <span>{displayValue}</span>
                                <button
                                    onClick={() => updateFilters(key, '')}
                                    className="ml-1 rounded-sm hover:bg-secondary-foreground/20"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
```

---

## 🔧 PART 3: UPDATE FRONTEND PAGES

### **1. Update Students Index**

**File:** `resources/js/pages/students/index.tsx`

```tsx
import { FilterBar, type FilterConfig } from '@/components/filter-bar';
// ... other imports

type StudentsPageProps = {
    students: {
        data: StudentRow[];
        links: unknown;
    } & Record<string, any>;
    filters: Record<string, unknown>;
    canManage: boolean;
    availableGuardians: Array<{ value: number; label: string }>;
    availableClasses: Array<{ id: number; name: string }>;
};

export default function StudentsIndex({
    students,
    filters,
    canManage,
    availableGuardians,
    availableClasses,
}: StudentsPageProps) {
    // ... existing state

    const filterConfig: FilterConfig = {
        search: {
            enabled: true,
            placeholder: 'Cari nama, email, atau NIS...',
        },
        select: [
            {
                name: 'class_id',
                label: 'Kelas',
                options: availableClasses.map((c) => ({
                    value: c.id.toString(),
                    label: c.name,
                })),
                placeholder: 'Pilih kelas',
            },
            {
                name: 'has_guardian',
                label: 'Status Wali',
                options: [
                    { value: '1', label: 'Punya Wali' },
                    { value: '0', label: 'Belum Punya Wali' },
                ],
                placeholder: 'Semua',
            },
        ],
        dateRange: {
            enabled: true,
            label: 'Tanggal Dibuat',
        },
        sort: {
            enabled: true,
            options: [
                { value: 'created_at', label: 'Tanggal Dibuat' },
                { value: 'updated_at', label: 'Terakhir Diupdate' },
                { value: 'nis', label: 'NIS' },
                { value: 'id', label: 'ID' },
            ],
            defaultField: 'created_at',
            defaultOrder: 'desc',
        },
    };

    return (
        <AppLayout>
            <Head title="Santri" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Data Santri</CardTitle>
                        {canManage && (
                            <ButtonGroup>
                                <Button onClick={openCreateModal}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Santri
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setUploadOpen(true)}
                                >
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload CSV
                                </Button>
                            </ButtonGroup>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filter Bar */}
                        <FilterBar filters={filters} config={filterConfig} />

                        {/* Table */}
                        <StudentTable
                            columns={columns}
                            data={students.data}
                        />
                    </CardContent>
                </Card>

                {/* ... existing modals and dialogs */}
            </div>
        </AppLayout>
    );
}
```

### **2. Update Students Columns**

**File:** `resources/js/pages/students/columns.tsx`

```tsx
// Add timestamp columns
export const buildStudentColumns = ({
    canManage,
    onEdit,
    onDelete,
}: {
    canManage: boolean;
    onEdit: (student: StudentRow) => void;
    onDelete: (student: StudentRow) => void;
}): ColumnDef<StudentRow>[] => {
    const columns: ColumnDef<StudentRow>[] = [
        {
            accessorKey: 'nis',
            header: 'NIS',
        },
        {
            accessorKey: 'name',
            header: 'Nama',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'class',
            header: 'Kelas',
            cell: ({ row }) => row.getValue('class') || '-',
        },
        {
            accessorKey: 'guardians_count',
            header: 'Jumlah Wali',
            cell: ({ row }) => {
                const count = row.getValue<number>('guardians_count');
                return (
                    <Badge variant={count > 0 ? 'default' : 'secondary'}>
                        {count} wali
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at_human',
            header: 'Dibuat',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {row.getValue('created_at_human')}
                </div>
            ),
        },
        {
            accessorKey: 'updated_at_human',
            header: 'Diupdate',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {row.getValue('updated_at_human')}
                </div>
            ),
        },
        // ... action column with dropdown menu
    ];

    return columns;
};
```

### **3. Ulangi untuk Guardians, Teachers, dan Admins**

Copy pattern yang sama untuk:
- `resources/js/pages/guardians/index.tsx` + `columns.tsx`
- `resources/js/pages/teachers/index.tsx` + `columns.tsx`
- `resources/js/pages/admins/index.tsx` + `columns.tsx`

---

## 📦 DEPENDENCIES YANG PERLU DIINSTALL

```json
{
  "dependencies": {
    "@radix-ui/react-select": "^2.0.0",
    "date-fns": "^3.0.0",
    "react-day-picker": "^8.10.0"
  }
}
```

Install:
```bash
npm install @radix-ui/react-select date-fns react-day-picker
```

---

## 📋 SUMMARY CHECKLIST

### **Backend:**
- [ ] Update StudentsController dengan filter dan timestamps
- [ ] Update GuardianController dengan filter dan timestamps
- [ ] Update TeachersController dengan filter dan timestamps
- [ ] Update AdminUserController dengan filter dan timestamps
- [ ] Test semua endpoint API dengan berbagai filter combinations

### **Frontend Components:**
- [ ] Install dependencies: @radix-ui/react-select, date-fns, react-day-picker
- [ ] Buat/update Select component (shadcn/ui)
- [ ] Buat DateRangePicker component
- [ ] Buat FilterBar component

### **Frontend Pages:**
- [ ] Update students/index.tsx dengan FilterBar
- [ ] Update students/columns.tsx dengan timestamp columns
- [ ] Update guardians/index.tsx dengan FilterBar
- [ ] Update guardians/columns.tsx dengan timestamp columns
- [ ] Update teachers/index.tsx dengan FilterBar
- [ ] Update teachers/columns.tsx dengan timestamp columns
- [ ] Update admins/index.tsx dengan FilterBar
- [ ] Update admins/columns.tsx dengan timestamp columns

### **Testing:**
- [ ] Test search filter
- [ ] Test select filters
- [ ] Test date range filter
- [ ] Test sorting (asc/desc)
- [ ] Test filter combinations
- [ ] Test clear filters
- [ ] Test pagination dengan filters aktif
- [ ] Test responsiveness di mobile

---

## 🎯 HASIL AKHIR YANG DIHARAPKAN

Setelah implementasi selesai, user akan bisa:

✅ **Search** dengan auto-debounce (500ms)  
✅ **Filter by class** untuk santri  
✅ **Filter by status** (punya wali/belum, punya kelas/belum)  
✅ **Filter by date range** untuk created_at  
✅ **Sort** berdasarkan berbagai field (asc/desc)  
✅ **Lihat timestamps** di setiap row (created_at, updated_at)  
✅ **Clear filters** dengan satu klik  
✅ **Visual active filters** dengan badges  
✅ **Responsive** di semua device  
✅ **Consistent UI** dengan shadcn/ui di semua halaman  

---

**Dibuat oleh:** Droid AI Assistant  
**Untuk:** @muhrobby  
**Proyek:** Hafalan App - Complete Filtering System  
**Status:** 🟢 READY TO IMPLEMENT
