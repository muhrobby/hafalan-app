import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    const [year, month, day] = value.split('-').map((segment) => Number(segment));

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day)
    ) {
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
                item.notes && item.notes.trim().length > 0
                    ? item.notes
                    : '-';

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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold">Riwayat Setoran Hafalan</h1>
                        <p className="text-sm text-muted-foreground">Kelola dan analisis setoran santri secara cepat.</p>
                    </div>
                    <Button asChild className="self-start sm:self-auto">
                        <Link href="/hafalan/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Input Setoran
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Tabel Setoran</CardTitle>
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
