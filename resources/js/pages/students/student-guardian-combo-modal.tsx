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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import * as React from 'react';

type ComboPayload = {
    // Student data
    student_name: string;
    student_email: string;
    student_class_name?: string;
    student_birth_date?: string;
    student_nis?: string;
    student_phone?: string;
    
    // Guardian data
    guardian_name: string;
    guardian_email: string;
    guardian_phone?: string;
    guardian_address?: string;
};

type StudentGuardianComboModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
};

export function StudentGuardianComboModal({
    open,
    onOpenChange,
}: StudentGuardianComboModalProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<ComboPayload>({
            student_name: '',
            student_email: '',
            student_class_name: '',
            student_birth_date: '',
            student_nis: '',
            student_phone: '',
            guardian_name: '',
            guardian_email: '',
            guardian_phone: '',
            guardian_address: '',
        });

    React.useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/students/with-guardian', {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Santri + Wali Sekaligus</DialogTitle>
                    <DialogDescription>
                        Buat santri baru beserta walinya dalam satu langkah
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit}>
                    <div className="space-y-6 py-4">
                        {/* STUDENT SECTION */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                    1
                                </div>
                                <h3 className="text-lg font-semibold">Data Santri</h3>
                            </div>

                            <div className="ml-10 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="combo-student-name">
                                        Nama Santri <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="combo-student-name"
                                        value={data.student_name}
                                        onChange={(e) => setData('student_name', e.target.value)}
                                        placeholder="Nama lengkap santri"
                                        required
                                    />
                                    <InputError message={(errors as any).student_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="combo-student-email">
                                        Email Santri <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="combo-student-email"
                                        type="email"
                                        value={data.student_email}
                                        onChange={(e) => setData('student_email', e.target.value)}
                                        placeholder="santri@example.com"
                                        required
                                    />
                                    <InputError message={(errors as any).student_email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="combo-student-class">
                                        Kelas <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="combo-student-class"
                                        value={data.student_class_name}
                                        onChange={(e) => setData('student_class_name', e.target.value)}
                                        placeholder="Contoh: 7A"
                                        required
                                    />
                                    <InputError message={(errors as any).student_class_name} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="combo-student-birthdate">
                                            Tanggal Lahir{' '}
                                            <span className="text-muted-foreground">(opsional)</span>
                                        </Label>
                                        <Input
                                            id="combo-student-birthdate"
                                            type="date"
                                            value={data.student_birth_date}
                                            onChange={(e) => setData('student_birth_date', e.target.value)}
                                        />
                                        <InputError message={(errors as any).student_birth_date} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="combo-student-phone">
                                            No. Telepon{' '}
                                            <span className="text-muted-foreground">(opsional)</span>
                                        </Label>
                                        <Input
                                            id="combo-student-phone"
                                            value={data.student_phone}
                                            onChange={(e) => setData('student_phone', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        <InputError message={(errors as any).student_phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="combo-student-nis">
                                        NIS{' '}
                                        <span className="text-muted-foreground">(opsional, auto-generate)</span>
                                    </Label>
                                    <Input
                                        id="combo-student-nis"
                                        value={data.student_nis}
                                        onChange={(e) => setData('student_nis', e.target.value)}
                                        placeholder="Kosongkan untuk otomatis"
                                    />
                                    <InputError message={(errors as any).student_nis} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* GUARDIAN SECTION */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                    2
                                </div>
                                <h3 className="text-lg font-semibold">Data Wali</h3>
                            </div>

                            <div className="ml-10 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="combo-guardian-name">
                                        Nama Wali <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="combo-guardian-name"
                                        value={data.guardian_name}
                                        onChange={(e) => setData('guardian_name', e.target.value)}
                                        placeholder="Nama lengkap wali"
                                        required
                                    />
                                    <InputError message={(errors as any).guardian_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="combo-guardian-email">
                                        Email Wali <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="combo-guardian-email"
                                        type="email"
                                        value={data.guardian_email}
                                        onChange={(e) => setData('guardian_email', e.target.value)}
                                        placeholder="wali@example.com"
                                        required
                                    />
                                    <InputError message={(errors as any).guardian_email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="combo-guardian-phone">
                                        No. Telepon Wali{' '}
                                        <span className="text-muted-foreground">(opsional)</span>
                                    </Label>
                                    <Input
                                        id="combo-guardian-phone"
                                        value={data.guardian_phone}
                                        onChange={(e) => setData('guardian_phone', e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                    <InputError message={(errors as any).guardian_phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="combo-guardian-address">
                                        Alamat Wali{' '}
                                        <span className="text-muted-foreground">(opsional)</span>
                                    </Label>
                                    <Textarea
                                        id="combo-guardian-address"
                                        value={data.guardian_address}
                                        onChange={(e) => setData('guardian_address', e.target.value)}
                                        placeholder="Alamat lengkap"
                                        rows={3}
                                    />
                                    <InputError message={(errors as any).guardian_address} />
                                </div>
                            </div>
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
                            {processing ? 'Menyimpan...' : 'Simpan Santri + Wali'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
