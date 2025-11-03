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
import { Progress } from '@/components/ui/progress';
import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'react-toastify';

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string; // "Upload Santri" | "Upload Guru"
    action: string; // route('students.import') | route('teachers.import')
    sampleUrl?: string; // opsional link template CSV
    description?: React.ReactNode;
};

export default function UploadCsvModal({
    open,
    onOpenChange,
    title,
    action,
    sampleUrl,
    description,
}: Props) {
    const { data, setData, post, processing, errors, reset, progress } =
        useForm<{
            file: File | null;
        }>({ file: null });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(action, {
            forceFormData: true, // penting: kirim multipart
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
            onError: (formErrors) => {
                const firstError =
                    Object.values(formErrors)[0] ?? 'Upload gagal.';
                toast.error(
                    <div>
                        <div className="font-semibold">
                            Gagal mengunggah berkas
                        </div>
                        <div className="text-sm">{String(firstError)}</div>
                    </div>,
                );
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={onSubmit}>
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>
                                {description ?? (
                                    <>
                                        Pastikan file berformat{' '}
                                        <b>CSV</b> atau <b>XLSX</b>.{' '}
                                        {sampleUrl && (
                                            <>
                                                Unduh contoh template:{' '}
                                                <a
                                                    className="underline"
                                                    href={sampleUrl}
                                                >
                                                    template.csv
                                                </a>
                                            </>
                                        )}
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                    <div className="space-y-3 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="file">Pilih File CSV</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".csv,.txt,.xlsx"
                                onChange={(e) =>
                                    setData(
                                        'file',
                                        e.currentTarget.files?.[0] ?? null,
                                    )
                                }
                                required
                            />
                            {errors.file && (
                                <p className="text-sm text-red-600">
                                    {errors.file}
                                </p>
                            )}
                        </div>
                        {progress && (
                            <Progress value={progress.percentage} max={100}>
                                {progress.percentage}%
                            </Progress>
                        )}

                        <div className="rounded bg-muted p-3 text-sm">
                            <p className="mb-1 font-medium">Tips:</p>
                            <ul className="list-disc space-y-1 pl-4">
                                <li>Baris pertama = header (kolom).</li>
                                <li>
                                    Encoding UTF-8, delimiter koma (
                                    <code>,</code>).
                                </li>
                                <li>
                                    Ukuran file &lt; 2MB (bisa diubah di
                                    server).
                                </li>
                            </ul>
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
                            {processing ? 'Mengunggah…' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
