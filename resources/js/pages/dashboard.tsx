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
    LayoutGrid,
    LineChart as LineChartIcon,
    PieChart,
    RotateCcw,
    Sparkles,
    TrendingUp,
    UserRound,
    Users,
} from 'lucide-react';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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

type DashboardPageProps = SharedData & {
    analytics?: DashboardAnalytics;
    guardianAnalytics?: GuardianAnalytics | null;
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
}: {
    title: string;
    value: string;
    helper?: string;
    icon: React.ReactNode;
}) => (
    <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {title}
            </CardTitle>
            <span className="text-muted-foreground/60">{icon}</span>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-semibold text-foreground">
                {value}
            </div>
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

    const topProgress = React.useMemo(() => {
        if (data.perChild.length === 0) {
            return undefined;
        }

        return [...data.perChild].sort(
            (a, b) => b.total_selesai - a.total_selesai,
        )[0];
    }, [data.perChild]);

    const trendHighlight = React.useMemo(() => {
        if (data.trend.length === 0) {
            return undefined;
        }

        return [...data.trend].sort((a, b) => b.total - a.total)[0];
    }, [data.trend]);

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
                />
                <GuardianSummaryCard
                    title="Total Murojaah"
                    value={data.summary.totalMurojaah.toLocaleString('id-ID')}
                    helper={summaryHelpers.murojaah}
                    icon={<Sparkles className="size-4" />}
                />
                <GuardianSummaryCard
                    title="Total Selesai"
                    value={data.summary.totalSelesai.toLocaleString('id-ID')}
                    helper={summaryHelpers.selesai}
                    icon={<LineChartIcon className="size-4" />}
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

export default function Dashboard({
    analytics: analyticsProp,
    guardianAnalytics: guardianAnalyticsProp,
}: {
    analytics?: DashboardAnalytics;
    guardianAnalytics?: GuardianAnalytics | null;
}) {
    const page = usePage().props as DashboardPageProps;
    const roles = Array.isArray(page.auth.roles) ? page.auth.roles : [];
    const isAdmin = roles.includes('admin');
    const canSeeStandardAnalytics = roles.some((role) =>
        ['teacher', 'student'].includes(role),
    );
    const canSeeGuardianAnalytics = roles.some((role) =>
        ['guardian', 'wali'].includes(role),
    );

    const analytics = React.useMemo(
        () => ({
            students: page.analytics?.students ?? analyticsProp?.students ?? 0,
            teachers: page.analytics?.teachers ?? analyticsProp?.teachers ?? 0,
            guardians:
                page.analytics?.guardians ?? analyticsProp?.guardians ?? 0,
            classes: page.analytics?.classes ?? analyticsProp?.classes ?? 0,
            users: page.analytics?.users ?? analyticsProp?.users ?? 0,
        }),
        [page.analytics, analyticsProp],
    );
    const guardianAnalytics = React.useMemo(
        () => page.guardianAnalytics ?? guardianAnalyticsProp ?? null,
        [page.guardianAnalytics, guardianAnalyticsProp],
    );

    const showGeneralAnalyticsCard = isAdmin || canSeeStandardAnalytics;

    const cards = [
        {
            key: 'students',
            label: 'Total Santri',
            value: analytics.students,
            icon: Users,
            color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-200',
        },
        {
            key: 'teachers',
            label: 'Total Guru',
            value: analytics.teachers,
            icon: GraduationCap,
            color: 'bg-blue-500/15 text-blue-600 dark:text-blue-200',
        },
        {
            key: 'guardians',
            label: 'Total Wali',
            value: analytics.guardians,
            icon: UserRound,
            color: 'bg-amber-500/15 text-amber-600 dark:text-amber-200',
        },
        {
            key: 'classes',
            label: 'Total Kelas',
            value: analytics.classes,
            icon: LayoutGrid,
            color: 'bg-purple-500/15 text-purple-600 dark:text-purple-200',
        },
        {
            key: 'users',
            label: 'Total Pengguna',
            value: analytics.users,
            icon: PieChart,
            color: 'bg-slate-500/15 text-slate-600 dark:text-slate-200',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beranda" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {isAdmin && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {cards.map(
                            ({ key, label, value, icon: Icon, color }) => (
                                <Card key={key} className="shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardDescription className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {label}
                                        </CardDescription>
                                        <span
                                            className={`grid size-9 place-items-center rounded-full text-base ${color}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-semibold">
                                            {value.toLocaleString('id-ID')}
                                        </div>
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                    {showGeneralAnalyticsCard && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">
                                    Analitik Hafalan
                                </CardTitle>
                                <CardDescription>
                                    Pantau tren hafalan lengkap dengan filter
                                    lanjutan di halaman analitik.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <Button
                                    className="justify-start"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href="/analytics">Buka Analitik</Link>
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Grafik mendukung filter berdasarkan tanggal,
                                    santri, dan ustadz.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                                Rangkuman Nilai
                            </CardTitle>
                            <CardDescription>
                                Lihat tabel rekap nilai hafalan dan cetak rapor
                                per santri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="justify-start"
                                asChild
                            >
                                <Link href="/akademik/rekap-nilai">
                                    Buka Rangkuman
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {canSeeGuardianAnalytics && guardianAnalytics && (
                    <GuardianAnalyticsSection data={guardianAnalytics} />
                )}
            </div>
        </AppLayout>
    );
}
