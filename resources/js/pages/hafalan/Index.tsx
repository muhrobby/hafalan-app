import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import * as React from 'react';
import { buildHafalanColumns, HafalanTableRow } from './columns';
import { HafalanTable } from './data-table';

type HafalanResponseRow = {
    id: number;
    date: string;
    student_id: number;
    surah_id: number;
    surah: { name: string; code: string };
    from_ayah: number;
    teacher?: string | null;
    student: string;
    notes?: string | null;
    status: 'murojaah' | 'selesai';
};

type FilterOption = {
    id: number;
    name: string;
};

type SurahOption = {
    id: number;
    code: string;
    name: string;
    ayah_count: number;
};

type PageProps = {
    hafalans: HafalanResponseRow[];
    filters: {
        student_id?: string;
        surah_id?: string;
        from_date?: string;
        to_date?: string;
    };
    students: FilterOption[];
    surahs: SurahOption[];
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const formatDisplayDate = (value: string): string => {
    const [year, month, day] = value
        .split('-')
        .map((segment) => Number(segment));

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return value;
    }

    return dateFormatter.format(new Date(year, month - 1, day));
};

export default function HafalanIndex() {
    const page = usePage<PageProps>();
    const { hafalans, students, surahs } = page.props;

    const columns = React.useMemo(() => buildHafalanColumns(), []);
    const tableRows = React.useMemo<HafalanTableRow[]>(() => {
        if (!Array.isArray(hafalans)) {
            return [];
        }

        return hafalans.map((item) => {
            const surahDisplay = `${item.surah.code}. ${item.surah.name}`;
            const teacher = item.teacher ?? '-';
            const notes =
                item.notes && item.notes.trim().length > 0 ? item.notes : '-';

            return {
                id: item.id,
                date: item.date,
                dateDisplay: formatDisplayDate(item.date),
                studentId: item.student_id,
                surahId: item.surah_id,
                student: item.student,
                surahDisplay,
                fromAyah: item.from_ayah,
                status: item.status,
                teacher,
                notes,
                searchKey: [
                    item.student,
                    surahDisplay,
                    item.status,
                    teacher,
                    notes,
                    `ayat ${item.from_ayah}`,
                ]
                    .join(' ')
                    .toLowerCase(),
            };
        });
    }, [hafalans]);

    return (
        <AppLayout>
            <Head title="Setoran Hafalan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:gap-6 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Riwayat Setoran Hafalan
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                            Kelola dan analisis setoran santri secara cepat
                        </p>
                    </div>
                    <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-md hover:from-green-700 hover:to-emerald-700 sm:w-auto"
                        asChild
                    >
                        <Link href="/hafalan/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Input Setoran
                        </Link>
                    </Button>
                </div>

                {/* Data Table Card */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                                <PlusCircle className="h-5 w-5 text-white" />
                            </div>
                            <span>Tabel Setoran</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HafalanTable
                            columns={columns}
                            data={tableRows}
                            studentOptions={students}
                            surahOptions={surahs}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
