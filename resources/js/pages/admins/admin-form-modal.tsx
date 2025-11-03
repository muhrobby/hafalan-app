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
import { useForm } from '@inertiajs/react';
import * as React from 'react';

export type AdminPayload = {
    id?: number;
    name: string;
    email: string;
    password?: string;
};

type AdminFormModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    admin?: AdminPayload | null;
    title: string;
};

export function AdminFormModal({
    open,
    onOpenChange,
    admin,
    title,
}: AdminFormModalProps) {
    const isEditing = Boolean(admin);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<AdminPayload>({
            id: admin?.id,
            name: admin?.name ?? '',
            email: admin?.email ?? '',
            password: '',
        });

    React.useEffect(() => {
        if (open) {
            setData({
                id: admin?.id,
                name: admin?.name ?? '',
                email: admin?.email ?? '',
                password: '',
            });
        } else {
            reset();
        }
    }, [open, admin, reset, setData]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && admin?.id) {
            put(`/admins/${admin.id}`, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post('/admins', {
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
                            Admin memiliki akses penuh. Password kosong akan
                            menggunakan default.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-2">
                            <Label htmlFor="admin-name">Nama</Label>
                            <Input
                                id="admin-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                                placeholder="Nama admin"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin-email">Email</Label>
                            <Input
                                id="admin-email"
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
                            <Label htmlFor="admin-password">
                                Password{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="admin-password"
                                type="password"
                                value={data.password ?? ''}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                placeholder="Minimal 8 karakter"
                            />
                            <InputError message={errors.password} />
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
                                  : 'Tambah admin'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
