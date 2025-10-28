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
import { Textarea } from '@/components/ui/textarea';
import { useForm, usePage } from '@inertiajs/react';
import * as React from 'react';

export type GuardianPayload = {
    id?: number;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    student_ids?: number[];
};

type GuardianFormModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    guardian?: GuardianPayload | null;
    title: string;
};

export function GuardianFormModal({
    open,
    onOpenChange,
    guardian,
    title,
}: GuardianFormModalProps) {
    const isEditing = Boolean(guardian);
    const page = usePage();
    const availableStudents = (page.props as any).availableStudents as MultiSelectOption[] || [];

    // Debug log
    React.useEffect(() => {
        if (open) {

        }
    }, [open, availableStudents, guardian]);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<GuardianPayload>({
            id: guardian?.id,
            name: guardian?.name ?? '',
            email: guardian?.email ?? '',
            phone: guardian?.phone ?? '',
            address: guardian?.address ?? '',
            student_ids: guardian?.student_ids ?? [],
        });

    React.useEffect(() => {
        if (open) {
            setData({
                id: guardian?.id,
                name: guardian?.name ?? '',
                email: guardian?.email ?? '',
                phone: guardian?.phone ?? '',
                address: guardian?.address ?? '',
                student_ids: guardian?.student_ids ?? [],
            });
        } else {
            reset();
        }
    }, [open, guardian, reset, setData]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && guardian?.id) {
            put(`/guardians/${guardian.id}`, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post('/guardians', {
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
                            Isi data wali (orang tua). Nomor telepon opsional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-2">
                            <Label htmlFor="guardian-name">Nama</Label>
                            <Input
                                id="guardian-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                                placeholder="Nama wali"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="guardian-email">Email</Label>
                            <Input
                                id="guardian-email"
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
                            <Label htmlFor="guardian-phone">
                                No. Telepon{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="guardian-phone"
                                value={data.phone ?? ''}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="guardian-address">
                                Alamat{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Textarea
                                id="guardian-address"
                                value={data.address ?? ''}
                                onChange={(event) =>
                                    setData('address', event.target.value)
                                }
                                placeholder="Alamat lengkap..."
                                rows={3}
                            />
                            <InputError message={(errors as any).address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="guardian-students">
                                Santri yang Diasuh{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <MultiSelect
                                options={availableStudents}
                                selected={data.student_ids ?? []}
                                onChange={(selected) => setData('student_ids', selected as number[])}
                                placeholder="Pilih santri..."
                            />
                            <InputError message={(errors as any).student_ids} />
                            <p className="text-xs text-muted-foreground">
                                Satu wali dapat mengasuh banyak santri
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
                                  : 'Tambah wali'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
