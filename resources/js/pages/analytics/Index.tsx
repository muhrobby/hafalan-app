'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    BarChart4,
    ChevronDown,
    Filter,
    LineChart,
    PieChart,
    RotateCcw,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import * as React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    Pie,
    PieChart as RechartsPieChart,
    XAxis,
    YAxis,
} from 'recharts';

type TrendPoint = {
    day: string;
    total: number;
    total_murojaah: number;
    total_selesai: number;
};

type DistributionItem = {
    name: string;
    count: number;
};

type ClassPerformanceItem = {
    class_name: string;
    total: number;
    total_murojaah: number;
    total_selesai: number;
};

type Option = {
    id: number;
    name: string;
};

type Summary = {
    totalAyat: number;
    totalMurojaah: number;
    totalSelesai: number;
};

type FilterState = {
    from: string;
    to: string;
    student_id?: string | null;
    teacher_id?: string | null;
    class_id?: string | null;
};

type AvailableFilters = {
    students: Option[];
    teachers: Option[];
    classes: Option[];
};

type AnalyticsIndexProps = {
    variant: 'admin' | 'teacher' | 'student';
    summary: Summary;
    trend: TrendPoint[];
    roles: DistributionItem[];
    classPerformance: ClassPerformanceItem[];
    filters: FilterState;
    availableFilters: AvailableFilters;
};

const ALL_OPTION = '__all__';
const currentYear = new Date().getFullYear();

const normalizeDate = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate());

const parseISODate = (value?: string | null) => {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value
        .split('-')
        .map((segment) => Number(segment));

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return undefined;
    }

    return normalizeDate(new Date(year, month - 1, day));
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

const formatInsightDate = (value?: string) => {
    if (!value) {
        return '-';
    }

    const parsed = parseISODate(value);
    if (!parsed) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
    }).format(parsed);
};

const normalizeSelectValue = (value?: string | null) =>
    value && value !== ALL_OPTION ? value : '';

const formatDate = (input: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(input));
const parseTrendDate = (input: string) => new Date(input);

const filterByRange = (data: { day: string }[], range: string) => {
    if (range === 'all') {
        return data;
    }

    const now = new Date();
    let from: Date;

    if (range === 'all') {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === '30d') {
        from = new Date(now);
        from.setDate(from.getDate() - 30);
    } else if (range === '90d') {
        from = new Date(now);
        from.setDate(from.getDate() - 90);
    } else {
        return data;
    }

    return data.filter((point) => {
        const day = parseTrendDate(point.day);
        return day >= from;
    });
};

const rangeOptions = [
    { value: 'mtd', label: 'Month to Date' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: 'all', label: 'Semua Data' },
];

const SummaryCard = ({
    title,
    value,
    icon,
    helper,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    helper?: string;
}) => (
    <Card className="relative min-w-[180px] flex-1 overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {title}
            </CardTitle>
            <div className="text-muted-foreground/50">{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-semibold text-primary">{value}</div>
            {helper && (
                <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            )}
        </CardContent>
    </Card>
);

const InsightCard = ({
    title,
    description,
    stat,
    icon,
}: {
    title: string;
    description: string;
    stat: string;
    icon: React.ReactNode;
}) => (
    <Card className="border border-dashed border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-primary">
                {title}
            </CardTitle>
            <span className="text-primary/60">{icon}</span>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="text-2xl font-semibold text-foreground">{stat}</div>
            <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
            </p>
        </CardContent>
    </Card>
);

const buildQuery = (filters: FilterState) => {
    const query: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
        const normalized = normalizeSelectValue(value);
        if (normalized) {
            query[key] = normalized;
        }
    });

    return query;
};

export default function AnalyticsIndex({
    variant,
    summary,
    trend,
    roles,
    classPerformance,
    filters,
    availableFilters,
}: AnalyticsIndexProps) {
    const initialFiltersRef = React.useRef<FilterState>({
        from: filters.from ?? '',
        to: filters.to ?? '',
        student_id: filters.student_id ?? ALL_OPTION,
        teacher_id: filters.teacher_id ?? ALL_OPTION,
        class_id: filters.class_id ?? ALL_OPTION,
    });

    const [localFilters, setLocalFilters] = React.useState<FilterState>({
        ...initialFiltersRef.current,
    });
    const [timeRange, setTimeRange] = React.useState<string>('all');
    const [fromDate, setFromDate] = React.useState<Date | undefined>(() =>
        parseISODate(initialFiltersRef.current.from),
    );
    const [toDate, setToDate] = React.useState<Date | undefined>(() =>
        parseISODate(initialFiltersRef.current.to),
    );
    const [fromOpen, setFromOpen] = React.useState(false);
    const [toOpen, setToOpen] = React.useState(false);

    const handleSelectFrom = React.useCallback(
        (value?: Date) => {
            if (!value) {
                setFromDate(undefined);
                setLocalFilters((prev) => ({
                    ...prev,
                    from: '',
                }));
                setFromOpen(false);
                return;
            }

            const normalized = normalizeDate(value);
            setFromDate(normalized);
            setLocalFilters((prev) => ({
                ...prev,
                from: toISODate(normalized),
            }));

            if (toDate && normalized > toDate) {
                setToDate(normalized);
                setLocalFilters((prev) => ({
                    ...prev,
                    to: toISODate(normalized),
                }));
            }

            setFromOpen(false);
        },
        [toDate],
    );

    const handleSelectTo = React.useCallback(
        (value?: Date) => {
            if (!value) {
                setToDate(undefined);
                setLocalFilters((prev) => ({
                    ...prev,
                    to: '',
                }));
                setToOpen(false);
                return;
            }

            const normalized = normalizeDate(value);
            setToDate(normalized);
            setLocalFilters((prev) => ({
                ...prev,
                to: toISODate(normalized),
            }));

            if (fromDate && normalized < fromDate) {
                setFromDate(normalized);
                setLocalFilters((prev) => ({
                    ...prev,
                    from: toISODate(normalized),
                }));
            }

            setToOpen(false);
        },
        [fromDate],
    );

    const applyFilters = React.useCallback(() => {
        router.get('/analytics', buildQuery(localFilters), {
            preserveScroll: true,
            replace: true,
        });
    }, [localFilters]);

    const resetFilters = React.useCallback(() => {
        const initial = initialFiltersRef.current;
        setLocalFilters({ ...initial });
        setFromDate(parseISODate(initial.from));
        setToDate(parseISODate(initial.to));
        setTimeRange('all');
        setFromOpen(false);
        setToOpen(false);
    }, []);

    const isDirty = React.useMemo(() => {
        const initial = initialFiltersRef.current;
        return (
            localFilters.from !== initial.from ||
            localFilters.to !== initial.to ||
            (localFilters.student_id ?? ALL_OPTION) !==
                (initial.student_id ?? ALL_OPTION) ||
            (localFilters.teacher_id ?? ALL_OPTION) !==
                (initial.teacher_id ?? ALL_OPTION) ||
            (localFilters.class_id ?? ALL_OPTION) !==
                (initial.class_id ?? ALL_OPTION)
        );
    }, [localFilters]);

    React.useEffect(() => {
        const nextInitial: FilterState = {
            from: filters.from ?? '',
            to: filters.to ?? '',
            student_id: filters.student_id ?? ALL_OPTION,
            teacher_id: filters.teacher_id ?? ALL_OPTION,
            class_id: filters.class_id ?? ALL_OPTION,
        };
        initialFiltersRef.current = nextInitial;
        setLocalFilters(nextInitial);
        setFromDate(parseISODate(nextInitial.from));
        setToDate(parseISODate(nextInitial.to));
        setTimeRange('all');
    }, [
        filters.from,
        filters.to,
        filters.student_id,
        filters.teacher_id,
        filters.class_id,
    ]);

    const trendData = React.useMemo(
        () =>
            trend.map((point) => ({
                day: point.day,
                total: point.total,
                murojaah: point.total_murojaah,
                selesai: point.total_selesai,
            })),
        [trend],
    );

    const filteredTrendData = React.useMemo(() => {
        return filterByRange(trendData, timeRange);
    }, [trendData, timeRange]);

    const rolesData = React.useMemo(
        () =>
            roles.map((role) => ({
                name: role.name,
                value: role.count,
            })),
        [roles],
    );

    const classPerformanceData = React.useMemo(
        () =>
            classPerformance.map((row) => ({
                class: row.class_name,
                total: row.total,
                murojaah: row.total_murojaah,
                selesai: row.total_selesai,
            })),
        [classPerformance],
    );

    const latestPoint = filteredTrendData.at(-1);
    const previousPoint =
        filteredTrendData.length > 1
            ? filteredTrendData[filteredTrendData.length - 2]
            : undefined;

    const totalChange =
        latestPoint && previousPoint
            ? latestPoint.total - previousPoint.total
            : 0;
    const murojaahChange =
        latestPoint && previousPoint
            ? latestPoint.murojaah - previousPoint.murojaah
            : 0;
    const selesaiChange =
        latestPoint && previousPoint
            ? latestPoint.selesai - previousPoint.selesai
            : 0;

    const changeLabel = (change: number, fallback: string) => {
        if (!latestPoint || previousPoint === undefined) {
            return fallback;
        }

        if (change === 0) {
            return 'Stabil dibanding hari sebelumnya';
        }

        return `${change > 0 ? '▲' : '▼'} ${Math.abs(change).toLocaleString(
            'id-ID',
        )} dibanding hari sebelumnya`;
    };

    const totalHelper = changeLabel(totalChange, 'Data terbaru');
    const murojaahHelper = changeLabel(murojaahChange, 'Data terbaru');
    const selesaiHelper = changeLabel(selesaiChange, 'Data terbaru');

    const totalUsers = React.useMemo(
        () => roles.reduce((sum, role) => sum + role.count, 0),
        [roles],
    );

    const topClass = React.useMemo(
        () =>
            classPerformance.length > 0
                ? [...classPerformance].sort((a, b) => b.total - a.total)[0]
                : undefined,
        [classPerformance],
    );

    const topRole = React.useMemo(
        () =>
            roles.length > 0
                ? [...roles].sort((a, b) => b.count - a.count)[0]
                : undefined,
        [roles],
    );

    const strongestDay = React.useMemo(
        () =>
            filteredTrendData.length > 0
                ? [...filteredTrendData].sort((a, b) => b.total - a.total)[0]
                : undefined,
        [filteredTrendData],
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Setoran"
                        value={summary.totalAyat.toLocaleString('id-ID')}
                        icon={<TrendingUp className="size-5" />}
                        helper={totalHelper}
                    />
                    <SummaryCard
                        title="Total Murojaah"
                        value={summary.totalMurojaah.toLocaleString('id-ID')}
                        icon={<Sparkles className="size-5" />}
                        helper={murojaahHelper}
                    />
                    <SummaryCard
                        title="Total Selesai"
                        value={summary.totalSelesai.toLocaleString('id-ID')}
                        icon={<LineChart className="size-5" />}
                        helper={selesaiHelper}
                    />
                    <SummaryCard
                        title="Total Pengguna"
                        value={totalUsers.toLocaleString('id-ID')}
                        icon={<Users className="size-5" />}
                        helper={
                            topRole
                                ? `${topRole.name} terbanyak (${topRole.count.toLocaleString(
                                      'id-ID',
                                  )})`
                                : 'Belum ada data role'
                        }
                    />
                </section>

                <section>
                    <Card>
                        <CardHeader className="space-y-1.5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        <LineChart className="size-4" />
                                        Performa Hafalan
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Sesuaikan rentang tanggal dan scope data
                                        untuk melihat tren hafalan.
                                    </p>
                                </div>
                                <Select
                                    value={timeRange}
                                    onValueChange={setTimeRange}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Rentang data" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rangeOptions.map((option) => (
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
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                    <div className="flex flex-col gap-1">
                                        <Label>Dari tanggal</Label>
                                        <Popover
                                            open={fromOpen}
                                            onOpenChange={setFromOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'justify-between font-normal',
                                                        !fromDate &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {formatDisplayDate(
                                                        fromDate,
                                                    )}
                                                    <ChevronDown className="size-4 opacity-60" />
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
                                                    fromYear={2000}
                                                    toYear={currentYear + 5}
                                                    onSelect={handleSelectFrom}
                                                    initialFocus
                                                    disabled={(date) =>
                                                        toDate
                                                            ? normalizeDate(
                                                                  date,
                                                              ) >
                                                              normalizeDate(
                                                                  toDate,
                                                              )
                                                            : false
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Sampai tanggal</Label>
                                        <Popover
                                            open={toOpen}
                                            onOpenChange={setToOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'justify-between font-normal',
                                                        !toDate &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {formatDisplayDate(toDate)}
                                                    <ChevronDown className="size-4 opacity-60" />
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
                                                    fromYear={2000}
                                                    toYear={currentYear + 5}
                                                    onSelect={handleSelectTo}
                                                    initialFocus
                                                    disabled={(date) =>
                                                        fromDate
                                                            ? normalizeDate(
                                                                  date,
                                                              ) <
                                                              normalizeDate(
                                                                  fromDate,
                                                              )
                                                            : false
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Santri</Label>
                                        <Select
                                            value={
                                                localFilters.student_id ??
                                                ALL_OPTION
                                            }
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
                                                {availableFilters.students.map(
                                                    (student) => (
                                                        <SelectItem
                                                            key={student.id}
                                                            value={String(
                                                                student.id,
                                                            )}
                                                        >
                                                            {student.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {availableFilters.teachers.length > 0 && (
                                        <div className="flex flex-col gap-1">
                                            <Label>Ustadz</Label>
                                            <Select
                                                value={
                                                    localFilters.teacher_id ??
                                                    ALL_OPTION
                                                }
                                                onValueChange={(value) =>
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        teacher_id: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Semua ustadz" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={ALL_OPTION}
                                                    >
                                                        Semua ustadz
                                                    </SelectItem>
                                                    {availableFilters.teachers.map(
                                                        (teacher) => (
                                                            <SelectItem
                                                                key={teacher.id}
                                                                value={String(
                                                                    teacher.id,
                                                                )}
                                                            >
                                                                {teacher.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {availableFilters.classes.length > 0 && (
                                        <div className="flex flex-col gap-1">
                                            <Label>Kelas</Label>
                                            <Select
                                                value={
                                                    localFilters.class_id ??
                                                    ALL_OPTION
                                                }
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
                                                    <SelectItem
                                                        value={ALL_OPTION}
                                                    >
                                                        Semua kelas
                                                    </SelectItem>
                                                    {availableFilters.classes.map(
                                                        (classe) => (
                                                            <SelectItem
                                                                key={classe.id}
                                                                value={String(
                                                                    classe.id,
                                                                )}
                                                            >
                                                                {classe.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {filteredTrendData.length > 0
                                            ? `Data mencakup ${filteredTrendData.length} hari pada rentang terpilih.`
                                            : 'Belum ada data pada rentang terpilih.'}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetFilters}
                                            disabled={!isDirty}
                                            className="gap-2"
                                        >
                                            <RotateCcw className="size-4" />
                                            Reset
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={applyFilters}
                                            disabled={!isDirty}
                                            className="gap-2"
                                        >
                                            <Filter className="size-4" />
                                            Terapkan
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {filteredTrendData.length > 0 ? (
                                <ChartContainer
                                    config={{
                                        total: {
                                            label: 'Total Setoran',
                                            color: 'hsl(var(--primary))',
                                        },
                                        murojaah: {
                                            label: 'Jumlah Murojaah',
                                            color: '#f97316',
                                        },
                                        selesai: {
                                            label: 'Jumlah Selesai',
                                            color: '#16a34a',
                                        },
                                    }}
                                    className="!aspect-auto h-[360px] w-full"
                                >
                                    <AreaChart data={filteredTrendData}>
                                        <defs>
                                            <linearGradient
                                                id="fill-total"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-total)"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-total)"
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="fill-murojaah"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-murojaah)"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-murojaah)"
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="fill-selesai"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-selesai)"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-selesai)"
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="4 4"
                                        />
                                        <XAxis
                                            dataKey="day"
                                            tickFormatter={(value) =>
                                                formatDate(String(value))
                                            }
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={24}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent indicator="dot" />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="var(--color-total)"
                                            fill="url(#fill-total)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="murojaah"
                                            stroke="var(--color-murojaah)"
                                            fill="url(#fill-murojaah)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="selesai"
                                            stroke="var(--color-selesai)"
                                            fill="url(#fill-selesai)"
                                            strokeDasharray="6 4"
                                            strokeWidth={2}
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                                    Belum ada data hafalan pada periode pilihan.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InsightCard
                        title="Kelas Teraktif"
                        stat={
                            topClass
                                ? topClass.total.toLocaleString('id-ID')
                                : '—'
                        }
                        description={
                            topClass
                                ? `Kelas ${topClass.class_name} memimpin jumlah setoran pada periode ini.`
                                : 'Belum ada data kelas untuk periode terpilih.'
                        }
                        icon={<BarChart4 className="size-5" />}
                    />
                    <InsightCard
                        title="Role Terbanyak"
                        stat={
                            topRole
                                ? topRole.count.toLocaleString('id-ID')
                                : '—'
                        }
                        description={
                            topRole
                                ? `${topRole.name} mendominasi distribusi pengguna.`
                                : 'Belum ada data role untuk dianalisis.'
                        }
                        icon={<Users className="size-5" />}
                    />
                    <InsightCard
                        title="Hari Tersibuk"
                        stat={
                            strongestDay
                                ? strongestDay.total.toLocaleString('id-ID')
                                : '—'
                        }
                        description={
                            strongestDay
                                ? `Tanggal ${formatInsightDate(
                                      strongestDay.day,
                                  )} menjadi puncak aktivitas setoran.`
                                : 'Belum ada hari dengan aktivitas tercatat.'
                        }
                        icon={<TrendingUp className="size-5" />}
                    />
                </section>

                {variant === 'admin' && (
                    <section className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    <PieChart className="size-4" />
                                    Distribusi Pengguna per Role
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex h-[320px] items-center justify-center">
                                {rolesData.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        Belum ada data role.
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={{
                                            value: {
                                                label: 'Jumlah pengguna',
                                            },
                                        }}
                                        className="!aspect-auto h-full w-full"
                                    >
                                        <RechartsPieChart>
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Pie
                                                data={rolesData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                            >
                                                {rolesData.map(
                                                    (entry, index) => {
                                                        const palette = [
                                                            '#2563eb',
                                                            '#16a34a',
                                                            '#facc15',
                                                            '#9333ea',
                                                            '#f97316',
                                                        ];
                                                        return (
                                                            <Cell
                                                                key={`cell-${entry.name}`}
                                                                fill={
                                                                    palette[
                                                                        index %
                                                                            palette.length
                                                                    ]
                                                                }
                                                            />
                                                        );
                                                    },
                                                )}
                                            </Pie>
                                        </RechartsPieChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Performa Kelas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px]">
                                {classPerformanceData.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        Belum ada data kelas pada periode ini.
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={{
                                            total: {
                                                label: 'Jumlah Setoran',
                                                color: '#2563eb',
                                            },
                                            murojaah: {
                                                label: 'Jumlah Murojaah',
                                                color: '#f97316',
                                            },
                                            selesai: {
                                                label: 'Jumlah Selesai',
                                                color: '#16a34a',
                                            },
                                        }}
                                        className="!aspect-auto h-full"
                                    >
                                        <ComposedChart
                                            data={classPerformanceData}
                                            margin={{ left: 12, right: 12 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="4 4"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="class"
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Bar
                                                dataKey="total"
                                                yAxisId="left"
                                                fill="var(--color-total)"
                                                radius={[6, 6, 0, 0]}
                                            />
                                            <Line
                                                dataKey="murojaah"
                                                yAxisId="right"
                                                stroke="var(--color-murojaah)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                dataKey="selesai"
                                                yAxisId="right"
                                                stroke="var(--color-selesai)"
                                                strokeDasharray="6 4"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </ComposedChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
