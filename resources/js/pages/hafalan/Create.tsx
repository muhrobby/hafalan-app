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
import { AlertCircleIcon, ArrowLeft, ChevronDownIcon } from 'lucide-react';
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

const currentYear = new Date().getFullYear();

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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/hafalan">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <h1 className="text-lg font-semibold">
                        Input Setoran Hafalan
                    </h1>
                </div>

                <Card className="max-w-3xl">
                    <form onSubmit={onSubmit}>
                        <CardHeader>
                            <CardTitle>Form Setoran Santri</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="mt-4 grid gap-2">
                                <Label>Santri</Label>
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) =>
                                        setData('student_id', value)
                                    }
                                >
                                    <SelectTrigger>
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

                            <div className="grid gap-2">
                                <Label>Surah</Label>
                                <Select
                                    value={data.surah_id}
                                    onValueChange={(value) =>
                                        setData('surah_id', value)
                                    }
                                >
                                    <SelectTrigger>
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="from_ayah">Ayat</Label>
                                    <Input
                                        id="from_ayah"
                                        type="number"
                                        min={1}
                                        value={data.from_ayah}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setData('from_ayah', value);
                                            setData('to_ayah', value);
                                        }}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger>
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
                                </div>
                                <InputError message={errors.from_ayah} />
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Tanggal</Label>
                                <Popover
                                    open={dateOpen}
                                    onOpenChange={setDateOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
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

                            {repeatWarnings.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>Perlu murojaah</AlertTitle>
                                    <AlertDescription>
                                        Santri ini masih memiliki hafalan yang
                                        harus diulang:
                                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
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

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    placeholder="Catatan tambahan (opsional)"
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                        <CardFooter className="mt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/hafalan">Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Simpan
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
