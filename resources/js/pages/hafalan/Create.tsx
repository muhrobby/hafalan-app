import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowLeft,
    ChevronDownIcon,
    Info,
} from 'lucide-react';
import * as React from 'react';

type StudentOption = {
    id: number;
    name: string;
};

type SurahOption = {
    id: number;
    code: string;
    name: string;
    ayah_count: number;
};

type RepeatNotice = {
    id: number;
    label: string;
};

type PageProps = {
    students: StudentOption[];
    surahs: SurahOption[];
    defaultDate: string;
    repeats: Record<string, RepeatNotice[]>;
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const formatDisplayDate = (value?: Date) => {
    if (!value) {
        return '';
    }

    return dateFormatter.format(value);
};

const toISODate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const parseISODate = (value: string | undefined) => {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value
        .split('-')
        .map((segment) => Number(segment));

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return undefined;
    }

    return new Date(year, month - 1, day);
};

export default function HafalanCreate() {
    const page = usePage<PageProps>();
    const { students, surahs, defaultDate, repeats } = page.props;

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        surah_id: '',
        from_ayah: '' as number | string,
        to_ayah: '' as number | string,
        date: defaultDate,
        status: 'murojaah',
        notes: '',
    });
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
        () => parseISODate(defaultDate),
    );
    const [dateOpen, setDateOpen] = React.useState(false);

    React.useEffect(() => {
        const parsed = parseISODate(defaultDate);
        setSelectedDate(parsed);
        if (parsed) {
            setData('date', toISODate(parsed));
        }
    }, [defaultDate, setData]);

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/hafalan');
    };

    const selectedSurah = surahs.find(
        (surah) => surah.id.toString() === data.surah_id,
    );

    const handleDateSelect = React.useCallback(
        (value?: Date) => {
            if (!value) {
                return;
            }

            const normalized = new Date(
                value.getFullYear(),
                value.getMonth(),
                value.getDate(),
            );

            setSelectedDate(normalized);
            setData('date', toISODate(normalized));
            setDateOpen(false);
        },
        [setData, setDateOpen],
    );

    const repeatWarnings = React.useMemo(() => {
        const key = data.student_id?.toString() ?? '';

        if (!key) {
            return [];
        }

        const candidate = repeats?.[key] ?? [];
        return Array.isArray(candidate) ? candidate : [];
    }, [data.student_id, repeats]);

    return (
        <AppLayout>
            <Head title="Input Setoran Hafalan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:gap-6 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/hafalan">
                                <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Input Setoran Hafalan
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                Catat setoran hafalan santri
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="max-w-3xl border-border/60 shadow-sm">
                    <form onSubmit={onSubmit}>
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                            <CardTitle className="text-lg">
                                Form Setoran Santri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:gap-5">
                            {/* Help Card */}
                            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertTitle className="text-blue-900 dark:text-blue-100">
                                    Panduan Pengisian
                                </AlertTitle>
                                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li>
                                            Pilih santri yang akan melakukan
                                            setoran
                                        </li>
                                        <li>
                                            Pilih surah dan range ayat yang
                                            disetorkan
                                        </li>
                                        <li>
                                            <strong>Murojaah:</strong> Hafalan
                                            diulang untuk penguatan
                                        </li>
                                        <li>
                                            <strong>Selesai:</strong> Hafalan
                                            lancar dan sempurna
                                        </li>
                                        <li>
                                            Tambahkan catatan jika diperlukan
                                            (opsional)
                                        </li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            {/* Santri Field */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="student_id"
                                    className="text-sm font-medium"
                                >
                                    Santri
                                </Label>
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) =>
                                        setData('student_id', value)
                                    }
                                >
                                    <SelectTrigger id="student_id">
                                        <SelectValue placeholder="Pilih santri" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem
                                                key={student.id}
                                                value={student.id.toString()}
                                            >
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.student_id} />
                            </div>

                            {/* Surah Field */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="surah_id"
                                    className="text-sm font-medium"
                                >
                                    Surah
                                </Label>
                                <Select
                                    value={data.surah_id}
                                    onValueChange={(value) =>
                                        setData('surah_id', value)
                                    }
                                >
                                    <SelectTrigger id="surah_id">
                                        <SelectValue placeholder="Pilih surah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {surahs.map((surah) => (
                                            <SelectItem
                                                key={surah.id}
                                                value={surah.id.toString()}
                                            >
                                                {surah.code}. {surah.name} (
                                                {surah.ayah_count} ayat)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.surah_id} />
                                {selectedSurah && (
                                    <p className="text-xs text-muted-foreground">
                                        Surah memiliki{' '}
                                        {selectedSurah.ayah_count} ayat.
                                    </p>
                                )}
                            </div>

                            {/* Ayat & Status Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="from_ayah"
                                        className="text-sm font-medium"
                                    >
                                        Ayat
                                    </Label>
                                    <Input
                                        id="from_ayah"
                                        type="number"
                                        min={1}
                                        placeholder="Nomor ayat"
                                        value={data.from_ayah}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setData('from_ayah', value);
                                            setData('to_ayah', value);
                                        }}
                                        required
                                    />
                                    <InputError message={errors.from_ayah} />
                                </div>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="status"
                                        className="text-sm font-medium"
                                    >
                                        Status
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="murojaah">
                                                Murojaah (belum lancar)
                                            </SelectItem>
                                            <SelectItem value="selesai">
                                                Selesai (sudah lancar)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            {/* Date Field */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="date"
                                    className="text-sm font-medium"
                                >
                                    Tanggal
                                </Label>
                                <Popover
                                    open={dateOpen}
                                    onOpenChange={setDateOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-between text-left font-normal',
                                                !selectedDate &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {selectedDate
                                                ? formatDisplayDate(
                                                      selectedDate,
                                                  )
                                                : 'Pilih tanggal'}
                                            <ChevronDownIcon className="h-4 w-4 opacity-60" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-auto overflow-hidden p-0"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            captionLayout="dropdown"
                                            onSelect={handleDateSelect}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.date} />
                            </div>

                            {/* Repeat Warnings */}
                            {repeatWarnings.length > 0 && (
                                <Alert
                                    variant="destructive"
                                    className="border-destructive/50 bg-destructive/5"
                                >
                                    <AlertCircleIcon className="h-4 w-4" />
                                    <AlertTitle className="text-sm font-semibold">
                                        Perlu murojaah
                                    </AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Santri ini masih memiliki hafalan yang
                                        harus diulang:
                                        <ul className="mt-2 list-disc space-y-1 pl-4">
                                            {repeatWarnings.map((item) => (
                                                <li key={item.id}>
                                                    {item.label}
                                                </li>
                                            ))}
                                        </ul>
                                        Tandai status sebagai{' '}
                                        <strong>selesai</strong> setelah
                                        murojaah terpenuhi.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Notes Field */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="notes"
                                    className="text-sm font-medium"
                                >
                                    Catatan
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    placeholder="Catatan tambahan (opsional)"
                                    rows={4}
                                    className="resize-none"
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/hafalan">Batal</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-md hover:from-green-700 hover:to-emerald-700 sm:w-auto"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Setoran'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
