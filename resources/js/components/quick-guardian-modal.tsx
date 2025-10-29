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
import * as React from 'react';

type QuickGuardianPayload = {
    name: string;
    email: string;
    phone?: string;
    address?: string;
};

type QuickGuardianModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    onSuccess: (guardianId: number, guardianName: string) => void;
};

export function QuickGuardianModal({
    open,
    onOpenChange,
    onSuccess,
}: QuickGuardianModalProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<QuickGuardianPayload>({
            name: '',
            email: '',
            phone: '',
            address: '',
        });

    React.useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/guardians/quick', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const newGuardian = page.props.newGuardian;
                if (newGuardian) {
                    onSuccess(newGuardian.id, newGuardian.name);
                    onOpenChange(false);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Buat Wali Baru (Quick)</DialogTitle>
                    <DialogDescription>
                        Wali baru akan langsung tersedia untuk dipilih
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quick-name">
                                Nama <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="quick-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap wali"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quick-email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="quick-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quick-phone">No. Telepon</Label>
                            <Input
                                id="quick-phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="08123456789"
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quick-address">Alamat</Label>
                            <Textarea
                                id="quick-address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Alamat lengkap"
                                rows={3}
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan & Pilih'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
