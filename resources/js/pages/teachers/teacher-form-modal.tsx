import InputError from '@/components/input-error';
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
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { useForm, usePage } from '@inertiajs/react';
import * as React from 'react';

export type TeacherPayload = {
    id?: number;
    name: string;
    email: string;
    nip?: string | null;
    phone?: string | null;
    birth_date?: string | null;
    class_ids?: number[];
};

type TeacherFormModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    teacher?: TeacherPayload | null;
    title: string;
};

export function TeacherFormModal({
    open,
    onOpenChange,
    teacher,
    title,
}: TeacherFormModalProps) {
    const isEditing = Boolean(teacher);
    const page = usePage();
    const availableClasses = (page.props as any).availableClasses as MultiSelectOption[] || [];

    const { data, setData, post, put, processing, errors, reset } =
        useForm<TeacherPayload>({
            id: teacher?.id,
            name: teacher?.name ?? '',
            email: teacher?.email ?? '',
            nip: teacher?.nip ?? '',
            phone: teacher?.phone ?? '',
            birth_date: teacher?.birth_date ?? '',
            class_ids: teacher?.class_ids ?? [],
        });

    React.useEffect(() => {
        if (open) {
            setData({
                id: teacher?.id,
                name: teacher?.name ?? '',
                email: teacher?.email ?? '',
                nip: teacher?.nip ?? '',
                phone: teacher?.phone ?? '',
                birth_date: teacher?.birth_date ?? '',
                class_ids: teacher?.class_ids ?? [],
            });
        } else {
            reset();
        }
    }, [open, teacher, reset, setData]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && teacher?.id) {
            put(`/teachers/${teacher.id}`, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post('/teachers', {
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
                            Isi data guru. Kosongkan NIP bila ingin dibuat
                            otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-2">
                            <Label htmlFor="teacher-name">Nama</Label>
                            <Input
                                id="teacher-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                                placeholder="Nama guru"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="teacher-email">Email</Label>
                            <Input
                                id="teacher-email"
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
                            <Label htmlFor="teacher-nip">
                                NIP{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="teacher-nip"
                                value={data.nip ?? ''}
                                onChange={(event) =>
                                    setData('nip', event.target.value)
                                }
                                placeholder="Kosongkan untuk otomatis"
                            />
                            <InputError message={errors.nip} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="teacher-phone">
                                No. Telepon{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="teacher-phone"
                                value={data.phone ?? ''}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="teacher-birthdate">
                                Tanggal Lahir{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="teacher-birthdate"
                                type="date"
                                value={data.birth_date ?? ''}
                                onChange={(event) =>
                                    setData('birth_date', event.target.value)
                                }
                            />
                            <InputError message={(errors as any).birth_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="teacher-classes">
                                Kelas yang Diajar{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <MultiSelect
                                options={availableClasses}
                                selected={data.class_ids ?? []}
                                onChange={(selected) => setData('class_ids', selected as number[])}
                                placeholder="Pilih kelas..."
                            />
                            <InputError message={(errors as any).class_ids} />
                            <p className="text-xs text-muted-foreground">
                                Satu guru dapat mengajar banyak kelas
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
                                  : 'Tambah guru'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
