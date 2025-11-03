import InputError from '@/components/input-error';
import { QuickGuardianModal } from '@/components/quick-guardian-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    MultiSelect,
    type MultiSelectOption,
} from '@/components/ui/multi-select';
import { useForm, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import * as React from 'react';

export type StudentPayload = {
    id?: number;
    name: string;
    email: string;
    class_name?: string | null;
    birth_date?: string | null;
    nis?: string | null;
    phone?: string | null;
    guardian_ids?: number[];
};

type StudentFormModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    student?: StudentPayload | null;
    title: string;
};

type PageProps = {
    availableGuardians?: MultiSelectOption[];
};

export function StudentFormModal({
    open,
    onOpenChange,
    student,
    title,
}: StudentFormModalProps) {
    const isEditing = Boolean(student);
    const page = usePage<PageProps>();
    const baseAvailableGuardians = React.useMemo(
        () => page.props.availableGuardians || [],
        [page.props.availableGuardians],
    );

    const [availableGuardians, setAvailableGuardians] = React.useState<
        MultiSelectOption[]
    >(baseAvailableGuardians);
    const [quickGuardianOpen, setQuickGuardianOpen] = React.useState(false);

    React.useEffect(() => {
        setAvailableGuardians(baseAvailableGuardians);
    }, [baseAvailableGuardians]);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<StudentPayload>({
            id: student?.id,
            name: student?.name ?? '',
            email: student?.email ?? '',
            class_name: student?.class_name ?? '',
            birth_date: student?.birth_date ?? '',
            nis: student?.nis ?? '',
            phone: student?.phone ?? '',
            guardian_ids: student?.guardian_ids ?? [],
        });

    React.useEffect(() => {
        if (open) {
            setData({
                id: student?.id,
                name: student?.name ?? '',
                email: student?.email ?? '',
                class_name: student?.class_name ?? '',
                birth_date: student?.birth_date ?? '',
                nis: student?.nis ?? '',
                phone: student?.phone ?? '',
                guardian_ids: student?.guardian_ids ?? [],
            });
        } else {
            reset();
        }
    }, [open, student, reset, setData]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && student?.id) {
            put(`/students/${student.id}`, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post('/students', {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    reset();
                }
                onOpenChange(value);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            Lengkapi informasi santri. Isi data yang diperlukan
                            saja.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-2">
                            <Label htmlFor="student-name">
                                Nama <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="student-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                                placeholder="Nama santri"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="student-email">Email</Label>
                            <Input
                                id="student-email"
                                type="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                required
                                placeholder="email@contoh.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="student-birthdate">
                                Tanggal Lahir{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="student-birthdate"
                                type="date"
                                value={data.birth_date ?? ''}
                                onChange={(event) =>
                                    setData('birth_date', event.target.value)
                                }
                            />
                            <InputError message={errors.birth_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="student-phone">
                                No. Telepon{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="student-phone"
                                value={data.phone ?? ''}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="student-guardians">
                                    Wali Santri{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickGuardianOpen(true)}
                                    className="h-8"
                                >
                                    <PlusCircle className="mr-1 h-4 w-4" />
                                    Buat Wali Baru
                                </Button>
                            </div>
                            <MultiSelect
                                options={availableGuardians}
                                selected={data.guardian_ids ?? []}
                                onChange={(selected) =>
                                    setData(
                                        'guardian_ids',
                                        selected as number[],
                                    )
                                }
                                placeholder="Pilih wali santri..."
                            />
                            <InputError
                                message={
                                    errors.guardian_ids as string | undefined
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Wali santri wajib diisi. Anda dapat memilih
                                lebih dari satu wali
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? isEditing
                                    ? 'Menyimpan...'
                                    : 'Menambahkan...'
                                : isEditing
                                  ? 'Simpan perubahan'
                                  : 'Tambah santri'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Render QuickGuardianModal outside the parent Dialog to prevent modal nesting issues */}
            {open && (
                <QuickGuardianModal
                    open={quickGuardianOpen}
                    onOpenChange={setQuickGuardianOpen}
                    onSuccess={(guardianId, guardianName) => {
                        // Add new guardian to available options
                        const newOption: MultiSelectOption = {
                            value: guardianId,
                            label: guardianName,
                        };
                        setAvailableGuardians((prev) => [...prev, newOption]);

                        // Auto-select the newly created guardian
                        setData('guardian_ids', [
                            ...(data.guardian_ids ?? []),
                            guardianId,
                        ]);
                    }}
                />
            )}
        </Dialog>
    );
}
