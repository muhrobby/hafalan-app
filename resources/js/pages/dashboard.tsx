import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    ChevronDown,
    DownloadCloud,
    Filter,
    GraduationCap,
    Info,
    LayoutGrid,
    LineChart as LineChartIcon,
    Plus,
    RotateCcw,
    Sparkles,
    TrendingUp,
    UserRound,
    Users,
} from 'lucide-react';
import * as React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: dashboard().url,
    },
];

type DashboardAnalytics = {
    students: number;
    teachers: number;
    guardians: number;
    classes: number;
    users: number;
};

type GuardianTrendPoint = {
    day: string;
    total: number;
    total_murojaah: number;
    total_selesai: number;
};

type GuardianChildPerformance = {
    student_id: number;
    student_name: string;
    total: number;
    total_murojaah: number;
    total_selesai: number;
};

type GuardianSummary = {
    totalSetoran: number;
    totalMurojaah: number;
    totalSelesai: number;
};

type GuardianFilterState = {
    from: string;
    to: string;
    student_id?: string | null;
};

type GuardianOption = {
    id: number;
    name: string;
};

type GuardianAnalytics = {
    summary: GuardianSummary;
    trend: GuardianTrendPoint[];
    perChild: GuardianChildPerformance[];
    availableStudents: GuardianOption[];
    filters: {
        from?: string | null;
        to?: string | null;
        student_id?: string | null;
    };
};

type DashboardAnalyticsData = {
    variant: 'admin' | 'teacher' | 'student';
    summary: {
        totalAyat: number;
        totalMurojaah: number;
        totalSelesai: number;
    };
    trend: Array<{
        day: string;
        total: number;
        total_murojaah: number;
        total_selesai: number;
    }>;
    classPerformance: Array<{
        class_name: string;
        total: number;
        total_murojaah: number;
        total_selesai: number;
    }>;
    perSurah?: Array<{
        surah_name: string;
        total: number;
        total_murojaah: number;
        total_selesai: number;
    }>;
    statusDistribution?: {
        murojaah: number;
        selesai: number;
    };
};

type StandardFilterState = {
    from: string;
    to: string;
};

type DashboardPageProps = SharedData & {
    analytics?: DashboardAnalytics;
    guardianAnalytics?: GuardianAnalytics | null;
    dashboardAnalytics?: DashboardAnalyticsData | null;
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

const formatFriendlyDate = (value?: Date) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          }).format(value)
        : 'Pilih tanggal';

const formatTrendDate = (input: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(input));

const parseTrendDate = (input: string) => new Date(input);

const filterByRange = (
    data: Array<{
        day: string;
        total?: number;
        murojaah?: number;
        selesai?: number;
    }>,
    range: string,
) => {
    if (range === 'all') {
        return data;
    }

    const now = new Date();
    let from: Date;

    if (range === 'mtd') {
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

const buildGuardianQuery = (filters: GuardianFilterState) => {
    const query: Record<string, string> = {};

    if (filters.from) {
        query.from = filters.from;
    }

    if (filters.to) {
        query.to = filters.to;
    }

    const student =
        filters.student_id && filters.student_id !== ALL_OPTION
            ? filters.student_id
            : null;

    if (student) {
        query.student_id = student;
    }

    return query;
};

const buildGuardianQueryString = (filters: GuardianFilterState) => {
    const query = buildGuardianQuery(filters);
    const params = new URLSearchParams(query);
    return params.toString();
};

const GuardianSummaryCard = ({
    title,
    value,
    helper,
    icon,
    gradient,
    iconBg,
    iconColor,
    tooltipText,
}: {
    title: string;
    value: string;
    helper?: string;
    icon: React.ReactNode;
    gradient: string;
    iconBg: string;
    iconColor: string;
    tooltipText?: string;
}) => (
    <Card
        className={cn(
            'relative overflow-hidden border-border/60 bg-gradient-to-br shadow-sm transition-all hover:shadow-md',
            gradient,
        )}
    >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1.5">
                <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {title}
                </CardTitle>
                {tooltipText && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{tooltipText}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            <div
                className={cn(
                    'grid size-10 place-items-center rounded-lg',
                    iconBg,
                )}
            >
                <span className={cn('text-base', iconColor)}>{icon}</span>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {helper && (
                <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            )}
        </CardContent>
    </Card>
);

const GuardianAnalyticsSection = ({ data }: { data: GuardianAnalytics }) => {
    const initialFiltersRef = React.useRef<GuardianFilterState>({
        from: data.filters.from ?? '',
        to: data.filters.to ?? '',
        student_id: data.filters.student_id ?? ALL_OPTION,
    });

    const [localFilters, setLocalFilters] = React.useState<GuardianFilterState>(
        {
            ...initialFiltersRef.current,
        },
    );
    const [guardianRange, setGuardianRange] = React.useState<string>('all');
    const [fromDate, setFromDate] = React.useState<Date | undefined>(() =>
        parseISODate(initialFiltersRef.current.from),
    );
    const [toDate, setToDate] = React.useState<Date | undefined>(() =>
        parseISODate(initialFiltersRef.current.to),
    );
    const [fromOpen, setFromOpen] = React.useState(false);
    const [toOpen, setToOpen] = React.useState(false);

    React.useEffect(() => {
        const nextInitial: GuardianFilterState = {
            from: data.filters.from ?? '',
            to: data.filters.to ?? '',
            student_id: data.filters.student_id ?? ALL_OPTION,
        };
        initialFiltersRef.current = nextInitial;
        setLocalFilters(nextInitial);
        setFromDate(parseISODate(nextInitial.from));
        setToDate(parseISODate(nextInitial.to));
        setGuardianRange('all');
    }, [data.filters.from, data.filters.to, data.filters.student_id]);

    const trendData = React.useMemo(
        () =>
            data.trend.map((point) => ({
                day: point.day,
                total: point.total,
                murojaah: point.total_murojaah,
                selesai: point.total_selesai,
            })),
        [data.trend],
    );

    const filteredTrendData = React.useMemo(() => {
        return filterByRange(trendData, guardianRange);
    }, [trendData, guardianRange]);

    const latestPoint = filteredTrendData.at(-1);
    const previousPoint =
        filteredTrendData.length > 1
            ? filteredTrendData[filteredTrendData.length - 2]
            : undefined;

    const deltaLabel = (current?: number, previous?: number) => {
        if (current === undefined || previous === undefined) {
            return 'Data terbaru';
        }

        const diff = current - previous;
        if (diff === 0) {
            return 'Stabil dibanding hari sebelumnya';
        }

        const arrow = diff > 0 ? '▲' : '▼';
        return `${arrow} ${Math.abs(diff).toLocaleString('id-ID')} dibanding hari sebelumnya`;
    };

    const summaryHelpers = {
        total: deltaLabel(latestPoint?.total, previousPoint?.total),
        murojaah: deltaLabel(latestPoint?.murojaah, previousPoint?.murojaah),
        selesai: deltaLabel(latestPoint?.selesai, previousPoint?.selesai),
    };

    const topChild = React.useMemo(() => {
        if (data.perChild.length === 0) {
            return undefined;
        }

        return [...data.perChild].sort((a, b) => b.total - a.total)[0];
    }, [data.perChild]);

    const applyFilters = React.useCallback(() => {
        router.get('/dashboard', buildGuardianQuery(localFilters), {
            preserveScroll: true,
            replace: true,
        });
    }, [localFilters]);

    const resetFilters = React.useCallback(() => {
        const initial = initialFiltersRef.current;
        setLocalFilters({ ...initial });
        setFromDate(parseISODate(initial.from));
        setToDate(parseISODate(initial.to));
        setGuardianRange('all');
        setFromOpen(false);
        setToOpen(false);
    }, []);

    const isDirty = React.useMemo(() => {
        const initial = initialFiltersRef.current;
        return (
            localFilters.from !== initial.from ||
            localFilters.to !== initial.to ||
            (localFilters.student_id ?? ALL_OPTION) !==
                (initial.student_id ?? ALL_OPTION)
        );
    }, [localFilters]);

    const buildReportUrl = React.useCallback(
        (child: GuardianChildPerformance) => {
            const query = buildGuardianQueryString({
                from: localFilters.from,
                to: localFilters.to,
            });

            return `/reports/students/${child.student_id}${query ? `?${query}` : ''}`;
        },
        [localFilters.from, localFilters.to],
    );

    return (
        <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <GuardianSummaryCard
                    title="Total Setoran"
                    value={data.summary.totalSetoran.toLocaleString('id-ID')}
                    helper={summaryHelpers.total}
                    icon={<TrendingUp className="size-4" />}
                    gradient="from-blue-500/20 to-blue-600/5"
                    iconBg="bg-blue-500/15"
                    iconColor="text-blue-600 dark:text-blue-400"
                    tooltipText="Jumlah total ayat yang telah disetorkan oleh semua santri dalam periode yang dipilih"
                />
                <GuardianSummaryCard
                    title="Total Murojaah"
                    value={data.summary.totalMurojaah.toLocaleString('id-ID')}
                    helper={summaryHelpers.murojaah}
                    icon={<Sparkles className="size-4" />}
                    gradient="from-amber-500/20 to-amber-600/5"
                    iconBg="bg-amber-500/15"
                    iconColor="text-amber-600 dark:text-amber-400"
                    tooltipText="Jumlah total ayat yang diulang (murojaah) untuk memperkuat hafalan"
                />
                <GuardianSummaryCard
                    title="Total Selesai"
                    value={data.summary.totalSelesai.toLocaleString('id-ID')}
                    helper={summaryHelpers.selesai}
                    icon={<LineChartIcon className="size-4" />}
                    gradient="from-green-500/20 to-green-600/5"
                    iconBg="bg-green-500/15"
                    iconColor="text-green-600 dark:text-green-400"
                    tooltipText="Jumlah total ayat yang telah lancar dan sempurna hafalannya"
                />
                <GuardianSummaryCard
                    title="Anak Teraktif"
                    value={topChild ? topChild.student_name : '—'}
                    helper={
                        topChild
                            ? `${topChild.total.toLocaleString('id-ID')} setoran`
                            : 'Belum ada data'
                    }
                    icon={<BookOpenCheck className="size-4" />}
                    gradient="from-purple-500/20 to-purple-600/5"
                    iconBg="bg-purple-500/15"
                    iconColor="text-purple-600 dark:text-purple-400"
                    tooltipText="Santri dengan jumlah setoran hafalan terbanyak dalam periode ini"
                />
            </div>

            <Card className="shadow-sm">
                <CardHeader className="space-y-1.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                <Filter className="size-4" />
                                Filter Hafalan Anak
                            </CardTitle>
                            <CardDescription>
                                Sesuaikan rentang tanggal dan pilih anak untuk
                                memperbarui grafik serta ringkasan.
                            </CardDescription>
                        </div>
                        <Select
                            value={guardianRange}
                            onValueChange={setGuardianRange}
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
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="flex flex-col gap-1">
                            <Label>Dari tanggal</Label>
                            <Popover open={fromOpen} onOpenChange={setFromOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-between font-normal',
                                            !fromDate &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {formatFriendlyDate(fromDate)}
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
                                        onSelect={(value) => {
                                            if (!value) {
                                                setFromDate(undefined);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    from: '',
                                                }));
                                                setFromOpen(false);
                                                return;
                                            }
                                            const normalized =
                                                normalizeDate(value);
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
                                        {formatFriendlyDate(toDate)}
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
                                        onSelect={(value) => {
                                            if (!value) {
                                                setToDate(undefined);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    to: '',
                                                }));
                                                setToOpen(false);
                                                return;
                                            }
                                            const normalized =
                                                normalizeDate(value);
                                            setToDate(normalized);
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                to: toISODate(normalized),
                                            }));
                                            if (
                                                fromDate &&
                                                normalized < fromDate
                                            ) {
                                                setFromDate(normalized);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    from: toISODate(normalized),
                                                }));
                                            }
                                            setToOpen(false);
                                        }}
                                        initialFocus
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
                        <div className="flex flex-col gap-1">
                            <Label>Anak</Label>
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
                                    <SelectValue placeholder="Semua anak" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_OPTION}>
                                        Semua anak
                                    </SelectItem>
                                    {data.availableStudents.map((student) => (
                                        <SelectItem
                                            key={student.id}
                                            value={String(student.id)}
                                        >
                                            {student.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {filteredTrendData.length > 0
                                ? `Menampilkan ${filteredTrendData.length} hari aktivitas pada rentang terpilih.`
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
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="space-y-1.5">
                    <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Tren Setoran Harian
                    </CardTitle>
                    <CardDescription>
                        Ikuti pola setoran, murojaah, dan hafalan selesai anak
                        dalam rentang waktu terpilih.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTrendData.length > 0 ? (
                        <ChartContainer
                            config={{
                                total: {
                                    label: 'Total Setoran',
                                    color: 'hsl(var(--primary))',
                                },
                                murojaah: {
                                    label: 'Murojaah',
                                    color: '#f97316',
                                },
                                selesai: { label: 'Selesai', color: '#16a34a' },
                            }}
                            className="!aspect-auto h-[300px] w-full"
                        >
                            <AreaChart data={filteredTrendData}>
                                <defs>
                                    <linearGradient
                                        id="guardian-area-total"
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
                                        id="guardian-area-murojaah"
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
                                        id="guardian-area-selesai"
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
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="day"
                                    tickFormatter={(value) =>
                                        formatTrendDate(String(value))
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
                                    fill="url(#guardian-area-total)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="murojaah"
                                    stroke="var(--color-murojaah)"
                                    fill="url(#guardian-area-murojaah)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="selesai"
                                    stroke="var(--color-selesai)"
                                    fill="url(#guardian-area-selesai)"
                                    strokeWidth={2}
                                    strokeDasharray="6 4"
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-8 text-center text-muted-foreground">
                            Belum ada data hafalan pada rentang terpilih.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="space-y-1.5">
                    <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Rekap Hafalan Anak
                    </CardTitle>
                    <CardDescription>
                        Cetak rapor atau pantau perkembangan hafalan tiap anak
                        secara ringkas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.perChild.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-8 text-center text-muted-foreground">
                            Belum ada data hafalan anak pada rentang terpilih.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {data.perChild.map((child) => (
                                <Card
                                    key={child.student_id}
                                    className="border border-border/60 bg-background shadow-none transition hover:border-primary/40"
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center justify-between text-base font-semibold">
                                            <span>{child.student_name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {child.total.toLocaleString(
                                                    'id-ID',
                                                )}{' '}
                                                setoran
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                                        <div className="flex items-center justify-between">
                                            <span>Murojaah</span>
                                            <span className="font-semibold text-primary">
                                                {child.total_murojaah.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Selesai</span>
                                            <span className="font-semibold text-primary">
                                                {child.total_selesai.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3 w-full gap-2"
                                            asChild
                                        >
                                            <a
                                                href={buildReportUrl(child)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <DownloadCloud className="size-4" />
                                                Cetak Rapor
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

const StandardAnalyticsSection = ({
    data,
}: {
    data: DashboardAnalyticsData;
}) => {
    const [standardRange, setStandardRange] = React.useState<string>('all');
    const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
    const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
    const [fromOpen, setFromOpen] = React.useState(false);
    const [toOpen, setToOpen] = React.useState(false);
    const [localFilters, setLocalFilters] = React.useState<StandardFilterState>(
        {
            from: '',
            to: '',
        },
    );

    const trendData = React.useMemo(
        () =>
            data.trend.map((point) => ({
                day: point.day,
                total: point.total,
                murojaah: point.total_murojaah,
                selesai: point.total_selesai,
            })),
        [data.trend],
    );

    const filteredTrendData = React.useMemo(() => {
        return filterByRange(trendData, standardRange);
    }, [trendData, standardRange]);

    const latestPoint = filteredTrendData.at(-1);
    const previousPoint =
        filteredTrendData.length > 1
            ? filteredTrendData[filteredTrendData.length - 2]
            : undefined;

    const deltaLabel = (current?: number, previous?: number) => {
        if (current === undefined || previous === undefined) {
            return 'Data terbaru';
        }

        const diff = current - previous;
        if (diff === 0) {
            return 'Stabil dibanding hari sebelumnya';
        }

        const arrow = diff > 0 ? '▲' : '▼';
        return `${arrow} ${Math.abs(diff).toLocaleString('id-ID')} dibanding hari sebelumnya`;
    };

    const summaryHelpers = {
        total: deltaLabel(latestPoint?.total, previousPoint?.total),
        murojaah: deltaLabel(latestPoint?.murojaah, previousPoint?.murojaah),
        selesai: deltaLabel(latestPoint?.selesai, previousPoint?.selesai),
    };

    const isDirty = React.useMemo(() => {
        return localFilters.from !== '' || localFilters.to !== '';
    }, [localFilters]);

    const applyFilters = React.useCallback(() => {
        const query: Record<string, string> = {};

        if (localFilters.from) {
            query.from = localFilters.from;
        }

        if (localFilters.to) {
            query.to = localFilters.to;
        }

        router.get('/dashboard', query, {
            preserveScroll: true,
            replace: true,
        });
    }, [localFilters]);

    const resetFilters = React.useCallback(() => {
        setLocalFilters({ from: '', to: '' });
        setFromDate(undefined);
        setToDate(undefined);
        setStandardRange('all');
        setFromOpen(false);
        setToOpen(false);
        router.get(
            '/dashboard',
            {},
            {
                preserveScroll: true,
                replace: true,
            },
        );
    }, []);

    return (
        <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <GuardianSummaryCard
                    title="Total Ayat"
                    value={data.summary.totalAyat.toLocaleString('id-ID')}
                    helper={summaryHelpers.total}
                    icon={<BookOpenCheck className="size-4" />}
                    gradient="from-blue-500/20 to-blue-600/5"
                    iconBg="bg-blue-500/15"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <GuardianSummaryCard
                    title="Total Murojaah"
                    value={data.summary.totalMurojaah.toLocaleString('id-ID')}
                    helper={summaryHelpers.murojaah}
                    icon={<Sparkles className="size-4" />}
                    gradient="from-amber-500/20 to-amber-600/5"
                    iconBg="bg-amber-500/15"
                    iconColor="text-amber-600 dark:text-amber-400"
                />
                <GuardianSummaryCard
                    title="Total Selesai"
                    value={data.summary.totalSelesai.toLocaleString('id-ID')}
                    helper={summaryHelpers.selesai}
                    icon={<TrendingUp className="size-4" />}
                    gradient="from-green-500/20 to-green-600/5"
                    iconBg="bg-green-500/15"
                    iconColor="text-green-600 dark:text-green-400"
                />
            </div>

            <Card className="shadow-sm">
                <CardHeader className="space-y-1.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                <Filter className="size-4" />
                                Filter Rentang Waktu
                            </CardTitle>
                            <CardDescription>
                                Pilih rentang tanggal untuk melihat data hafalan
                            </CardDescription>
                        </div>
                        <Select
                            value={standardRange}
                            onValueChange={setStandardRange}
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
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <Label>Dari tanggal</Label>
                            <Popover open={fromOpen} onOpenChange={setFromOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-between font-normal',
                                            !fromDate &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {formatFriendlyDate(fromDate)}
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
                                        onSelect={(value) => {
                                            if (!value) {
                                                setFromDate(undefined);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    from: '',
                                                }));
                                                setFromOpen(false);
                                                return;
                                            }
                                            const normalized =
                                                normalizeDate(value);
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
                                        {formatFriendlyDate(toDate)}
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
                                        onSelect={(value) => {
                                            if (!value) {
                                                setToDate(undefined);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    to: '',
                                                }));
                                                setToOpen(false);
                                                return;
                                            }
                                            const normalized =
                                                normalizeDate(value);
                                            setToDate(normalized);
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                to: toISODate(normalized),
                                            }));
                                            if (
                                                fromDate &&
                                                normalized < fromDate
                                            ) {
                                                setFromDate(normalized);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    from: toISODate(normalized),
                                                }));
                                            }
                                            setToOpen(false);
                                        }}
                                        initialFocus
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
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {filteredTrendData.length > 0
                                ? `Menampilkan ${filteredTrendData.length} hari aktivitas pada rentang terpilih.`
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
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="space-y-1.5">
                    <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Tren Setoran Harian
                    </CardTitle>
                    <CardDescription>
                        Ikuti pola setoran, murojaah, dan hafalan selesai dalam
                        rentang waktu terpilih.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTrendData.length > 0 ? (
                        <ChartContainer
                            config={{
                                total: {
                                    label: 'Total Setoran',
                                    color: 'hsl(var(--primary))',
                                },
                                murojaah: {
                                    label: 'Murojaah',
                                    color: '#f97316',
                                },
                                selesai: { label: 'Selesai', color: '#16a34a' },
                            }}
                            className="!aspect-auto h-[300px] w-full"
                        >
                            <AreaChart data={filteredTrendData}>
                                <defs>
                                    <linearGradient
                                        id="standard-area-total"
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
                                        id="standard-area-murojaah"
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
                                        id="standard-area-selesai"
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
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="day"
                                    tickFormatter={(value) =>
                                        formatTrendDate(String(value))
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
                                    fill="url(#standard-area-total)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="murojaah"
                                    stroke="var(--color-murojaah)"
                                    fill="url(#standard-area-murojaah)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="selesai"
                                    stroke="var(--color-selesai)"
                                    fill="url(#standard-area-selesai)"
                                    strokeWidth={2}
                                    strokeDasharray="6 4"
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-8 text-center text-muted-foreground">
                            Belum ada data hafalan pada rentang terpilih.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bar Chart - Top 10 Surah */}
            {data.perSurah && data.perSurah.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="space-y-1.5">
                        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            Top 10 Surah Paling Banyak Disetorkan
                        </CardTitle>
                        <CardDescription>
                            Distribusi setoran hafalan berdasarkan surah
                            Al-Quran
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                total: {
                                    label: 'Total Setoran',
                                    color: '#3b82f6',
                                },
                                murojaah: {
                                    label: 'Murojaah',
                                    color: '#f97316',
                                },
                                selesai: {
                                    label: 'Selesai',
                                    color: '#16a34a',
                                },
                            }}
                            className="!aspect-auto h-[350px] w-full"
                        >
                            <BarChart
                                data={data.perSurah}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    left: 0,
                                    bottom: 60,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="surah_name"
                                    tickLine={false}
                                    axisLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={11}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                    fontSize={11}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent indicator="line" />
                                    }
                                />
                                <Bar
                                    dataKey="total"
                                    fill="var(--color-total)"
                                    radius={[6, 6, 0, 0]}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            {/* Pie Chart - Status Distribution */}
            {data.statusDistribution && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="shadow-sm">
                        <CardHeader className="space-y-1.5">
                            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Distribusi Status Hafalan
                            </CardTitle>
                            <CardDescription>
                                Perbandingan antara Murojaah dan Selesai
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    murojaah: {
                                        label: 'Murojaah',
                                        color: '#f59e0b',
                                    },
                                    selesai: {
                                        label: 'Selesai',
                                        color: '#10b981',
                                    },
                                }}
                                className="!aspect-square h-[300px] w-full"
                            >
                                <PieChart>
                                    <Pie
                                        data={[
                                            {
                                                name: 'Murojaah',
                                                value: data.statusDistribution
                                                    .murojaah,
                                                fill: 'var(--color-murojaah)',
                                            },
                                            {
                                                name: 'Selesai',
                                                value: data.statusDistribution
                                                    .selesai,
                                                fill: 'var(--color-selesai)',
                                            },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={(entry) =>
                                            `${entry.name}: ${entry.value.toLocaleString('id-ID')}`
                                        }
                                    >
                                        {[
                                            {
                                                name: 'Murojaah',
                                                value: data.statusDistribution
                                                    .murojaah,
                                                fill: 'var(--color-murojaah)',
                                            },
                                            {
                                                name: 'Selesai',
                                                value: data.statusDistribution
                                                    .selesai,
                                                fill: 'var(--color-selesai)',
                                            },
                                        ].map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Summary Stats Card */}
                    <Card className="shadow-sm">
                        <CardHeader className="space-y-1.5">
                            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Statistik Hafalan
                            </CardTitle>
                            <CardDescription>
                                Ringkasan data hafalan periode terpilih
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-blue-900">
                                    <div className="flex items-center gap-3">
                                        <div className="grid size-10 place-items-center rounded-lg bg-blue-500">
                                            <BookOpenCheck className="size-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Total Setoran
                                            </p>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                {data.summary.totalAyat.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-4 dark:border-amber-800 dark:from-amber-950 dark:to-amber-900">
                                    <div className="flex items-center gap-3">
                                        <div className="grid size-10 place-items-center rounded-lg bg-amber-500">
                                            <Sparkles className="size-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Murojaah
                                            </p>
                                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                                {data.summary.totalMurojaah.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(
                                                    (data.summary
                                                        .totalMurojaah /
                                                        data.summary
                                                            .totalAyat) *
                                                    100
                                                ).toFixed(1)}
                                                % dari total
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 dark:border-green-800 dark:from-green-950 dark:to-green-900">
                                    <div className="flex items-center gap-3">
                                        <div className="grid size-10 place-items-center rounded-lg bg-green-500">
                                            <TrendingUp className="size-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Selesai
                                            </p>
                                            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                {data.summary.totalSelesai.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(
                                                    (data.summary.totalSelesai /
                                                        data.summary
                                                            .totalAyat) *
                                                    100
                                                ).toFixed(1)}
                                                % dari total
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    );
};

export default function Dashboard({
    analytics: analyticsProp,
    guardianAnalytics: guardianAnalyticsProp,
    dashboardAnalytics: dashboardAnalyticsProp,
}: {
    analytics?: DashboardAnalytics;
    guardianAnalytics?: GuardianAnalytics | null;
    dashboardAnalytics?: DashboardAnalyticsData | null;
}) {
    const page = usePage<DashboardPageProps>();
    const roles = Array.isArray(page.props.auth.roles)
        ? page.props.auth.roles
        : [];
    const isAdmin = roles.includes('admin');
    const canSeeStandardAnalytics = roles.some((role) =>
        ['teacher', 'student'].includes(role),
    );
    const canSeeGuardianAnalytics = roles.some((role) =>
        ['guardian', 'wali'].includes(role),
    );
    const canInputHafalan =
        isAdmin || roles.some((role) => ['teacher', 'guru'].includes(role));

    const dashboardAnalytics = React.useMemo(
        () => page.props.dashboardAnalytics ?? dashboardAnalyticsProp ?? null,
        [page.props.dashboardAnalytics, dashboardAnalyticsProp],
    );

    const analytics = React.useMemo(
        () => ({
            students:
                page.props.analytics?.students ?? analyticsProp?.students ?? 0,
            teachers:
                page.props.analytics?.teachers ?? analyticsProp?.teachers ?? 0,
            guardians:
                page.props.analytics?.guardians ??
                analyticsProp?.guardians ??
                0,
            classes:
                page.props.analytics?.classes ?? analyticsProp?.classes ?? 0,
            users: page.props.analytics?.users ?? analyticsProp?.users ?? 0,
        }),
        [page.props.analytics, analyticsProp],
    );
    const guardianAnalytics = React.useMemo(
        () => page.props.guardianAnalytics ?? guardianAnalyticsProp ?? null,
        [page.props.guardianAnalytics, guardianAnalyticsProp],
    );

    const cards = [
        {
            key: 'students',
            label: 'Total Santri',
            value: analytics.students,
            icon: Users,
            gradient: 'from-emerald-500/20 to-emerald-600/5',
            iconBg: 'bg-emerald-500/15',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            description: 'Siswa terdaftar',
        },
        {
            key: 'teachers',
            label: 'Total Guru',
            value: analytics.teachers,
            icon: GraduationCap,
            gradient: 'from-blue-500/20 to-blue-600/5',
            iconBg: 'bg-blue-500/15',
            iconColor: 'text-blue-600 dark:text-blue-400',
            description: 'Pengajar aktif',
        },
        {
            key: 'guardians',
            label: 'Total Wali',
            value: analytics.guardians,
            icon: UserRound,
            gradient: 'from-amber-500/20 to-amber-600/5',
            iconBg: 'bg-amber-500/15',
            iconColor: 'text-amber-600 dark:text-amber-400',
            description: 'Wali murid',
        },
        {
            key: 'classes',
            label: 'Total Kelas',
            value: analytics.classes,
            icon: LayoutGrid,
            gradient: 'from-purple-500/20 to-purple-600/5',
            iconBg: 'bg-purple-500/15',
            iconColor: 'text-purple-600 dark:text-purple-400',
            description: 'Kelas tersedia',
        },
        {
            key: 'users',
            label: 'Total Pengguna',
            value: analytics.users,
            icon: PieChart,
            gradient: 'from-slate-500/20 to-slate-600/5',
            iconBg: 'bg-slate-500/15',
            iconColor: 'text-slate-600 dark:text-slate-400',
            description: 'Akun sistem',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beranda" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:gap-6 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                            {isAdmin && 'Kelola sistem hafalan Al-Quran'}
                            {!isAdmin &&
                                canSeeStandardAnalytics &&
                                'Pantau progress hafalan santri'}
                            {!isAdmin &&
                                !canSeeStandardAnalytics &&
                                canSeeGuardianAnalytics &&
                                'Pantau hafalan anak Anda'}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        {(isAdmin || canInputHafalan) && (
                            <Button
                                size="sm"
                                className="w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/hafalan/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Input Hafalan
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards - Admin Only */}
                {isAdmin && (
                    <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
                        {cards.map(
                            ({
                                key,
                                label,
                                value,
                                icon: Icon,
                                gradient,
                                iconBg,
                                iconColor,
                                description,
                            }) => (
                                <Card
                                    key={key}
                                    className={cn(
                                        'relative overflow-hidden border-border/60 bg-gradient-to-br shadow-sm transition-all hover:shadow-md',
                                        gradient,
                                    )}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {label}
                                        </CardTitle>
                                        <div
                                            className={cn(
                                                'grid size-9 place-items-center rounded-lg sm:size-10',
                                                iconBg,
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4 sm:h-5 sm:w-5',
                                                    iconColor,
                                                )}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold sm:text-3xl">
                                            {value.toLocaleString('id-ID')}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </div>
                )}

                {/* Analytics Charts - Admin & Teacher */}
                {dashboardAnalytics && (isAdmin || canSeeStandardAnalytics) && (
                    <StandardAnalyticsSection data={dashboardAnalytics} />
                )}

                {/* Class Performance - Admin Only */}
                {dashboardAnalytics &&
                    dashboardAnalytics.classPerformance &&
                    dashboardAnalytics.classPerformance.length > 0 &&
                    isAdmin && (
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Performa Per Kelas
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Rangkuman setoran hafalan berdasarkan kelas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 md:space-y-4">
                                    {dashboardAnalytics.classPerformance.map(
                                        (classData) => (
                                            <div
                                                key={classData.class_name}
                                                className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold sm:text-base">
                                                        {classData.class_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                                        Total:{' '}
                                                        {classData.total.toLocaleString(
                                                            'id-ID',
                                                        )}{' '}
                                                        • Murojaah:{' '}
                                                        {classData.total_murojaah.toLocaleString(
                                                            'id-ID',
                                                        )}{' '}
                                                        • Selesai:{' '}
                                                        {classData.total_selesai.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xl font-bold sm:text-2xl">
                                                        {classData.total.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                {/* Quick Action - Input Hafalan Only */}
                {(isAdmin || canInputHafalan) && (
                    <Card className="border-border/60 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">
                                        Input Hafalan Baru
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Catat setoran hafalan santri
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <Link href="/hafalan/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buka Form Input
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Guardian Analytics Section */}
                {canSeeGuardianAnalytics && guardianAnalytics && (
                    <GuardianAnalyticsSection data={guardianAnalytics} />
                )}
            </div>
        </AppLayout>
    );
}
