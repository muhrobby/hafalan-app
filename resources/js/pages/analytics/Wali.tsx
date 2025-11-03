import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import {
    CartesianGrid,
    Line,
    ResponsiveContainer,
    XAxis,
    YAxis,
    LineChart as RechartsLineChart,
} from 'recharts';
import { DownloadCloud } from 'lucide-react';
import * as React from 'react';

type TrendPoint = {
    day: string;
    total: number;
    total_murojaah: number;
    total_selesai: number;
};

type ChildPerformance = {
    student_id: number;
    student_name: string;
    total: number;
    total_murojaah: number;
    total_selesai: number;
};

type Option = {
    id: number;
    name: string;
};

type Summary = {
    totalSetoran: number;
    totalMurojaah: number;
    totalSelesai: number;
};

type FilterState = {
    from: string;
    to: string;
    student_id?: string | null;
};

type WaliAnalyticsProps = {
    summary: Summary;
    trend: TrendPoint[];
    perChild: ChildPerformance[];
    filters: FilterState;
    availableStudents: Option[];
};

const ALL_OPTION = '__all__';

const normalizeSelect = (value?: string | null) =>
    value && value !== ALL_OPTION ? value : '';

const formatDate = (input: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(input));

const buildQueryObject = (filters: FilterState): Record<string, string> => {
    const query: Record<string, string> = {};

    if (filters.from) query.from = filters.from;
    if (filters.to) query.to = filters.to;
    const student = normalizeSelect(filters.student_id);
    if (student) query.student_id = student;

    return query;
};

const buildQueryString = (filters: FilterState) =>
    new URLSearchParams(buildQueryObject(filters)).toString();

export default function WaliAnalytics({
    summary,
    trend,
    perChild,
    filters,
    availableStudents,
}: WaliAnalyticsProps) {
    const [localFilters, setLocalFilters] = React.useState<FilterState>({
        from: filters.from ?? '',
        to: filters.to ?? '',
        student_id: filters.student_id ?? ALL_OPTION,
    });

    const applyFilters = React.useCallback(() => {
        router.get('/wali/analytics', buildQueryObject(localFilters), {
            preserveScroll: true,
            replace: true,
        });
    }, [localFilters]);

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

    const buildReportUrl = (row: ChildPerformance) => {
        const query = buildQueryString({
            from: localFilters.from,
            to: localFilters.to,
        });

        return `/reports/students/${row.student_id}${query ? `?${query}` : ''}`;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium uppercase tracking-tight text-muted-foreground">
                                Total Setoran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-primary">
                                {summary.totalSetoran.toLocaleString('id-ID')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium uppercase tracking-tight text-muted-foreground">
                                Total Murojaah
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-primary">
                                {summary.totalMurojaah.toLocaleString('id-ID')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium uppercase tracking-tight text-muted-foreground">
                                Total Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-primary">
                                {summary.totalSelesai.toLocaleString('id-ID')}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Progress Hafalan Anak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-4">
                                <Input
                                    type="date"
                                    value={localFilters.from}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            from: event.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    type="date"
                                    value={localFilters.to}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            to: event.target.value,
                                        }))
                                    }
                                />
                                {availableStudents.length > 0 && (
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
                                            {availableStudents.map((student) => (
                                                <SelectItem
                                                    key={student.id}
                                                    value={String(student.id)}
                                                >
                                                    {student.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Button onClick={applyFilters}>Terapkan Filter</Button>
                            </div>

                            {trendData.length > 0 ? (
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
                                    className="h-[320px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsLineChart data={trendData} margin={{ left: 12, right: 12 }}>
                                            <CartesianGrid strokeDasharray="4 4" vertical={false} />
                                            <XAxis
                                                dataKey="day"
                                                tickFormatter={(value) => formatDate(String(value))}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={24}
                                            />
                                            <YAxis tickLine={false} axisLine={false} allowDecimals />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="murojaah" stroke="var(--color-murojaah)" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="selesai" stroke="var(--color-selesai)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                                        </RechartsLineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            ) : (
                                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                                    Belum ada data hafalan untuk periode ini.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Rapor Anak
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {perChild.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-muted-foreground">
                                    Belum ada data hafalan anak.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {perChild.map((child) => (
                                        <Card key={child.student_id} className="border border-primary/10">
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    {child.student_name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Total Setoran</span>
                                                    <span className="font-semibold text-primary">
                                                        {child.total.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Murojaah</span>
                                                    <span className="font-semibold text-primary">
                                                        {child.total_murojaah.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Selesai</span>
                                                    <span className="font-semibold text-primary">
                                                        {child.total_selesai.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <Button variant="outline" className="w-full" asChild>
                                                    <a
                                                        href={buildReportUrl(child)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <DownloadCloud className="mr-2 size-4" />
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
            </div>
        </AppLayout>
    );
}
