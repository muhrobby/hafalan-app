import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { ChevronDownCircleIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'react-toastify';
import { columns, type User as TableUser } from './columns';
import { DataTable } from './data-table';

type Failure = { row: number; errors: string[]; values?: Record<string, any> };
type Stats = { created: number; updated: number; failed: number };
type HomeProps = {
    users: { data: TableUser[]; [key: string]: unknown };
};

export default function Home({ users }: HomeProps) {
    const [showErrorModal, setShowErrorModal] = React.useState(false);

    const page = usePage().props as {
        success?: string;
        error?: string;
        failures?: Failure[];
        stats?: Stats;
        flashId?: string | null;
        temporaryPassword?: string;
    };

    const success = page?.success;
    const error = page?.error;
    const failures = Array.isArray(page?.failures) ? page.failures : [];
    const stats = page?.stats;
    const flashId = page?.flashId ?? null;
    const temporaryPassword = page?.temporaryPassword;
    const hasStats =
        !!stats && (stats.created > 0 || stats.updated > 0 || stats.failed > 0);
    const hasFailures = failures.length > 0;
    const hasError = Boolean(error);
    const hasTemporaryPassword = Boolean(temporaryPassword);

    const statsLine = React.useMemo(() => {
        if (!hasStats || !stats) {
            return '';
        }

        const parts: string[] = [];
        if (stats.created > 0) {
            parts.push(`Dibuat: ${stats.created}`);
        }
        if (stats.updated > 0) {
            parts.push(`Diperbarui: ${stats.updated}`);
        }
        if (stats.failed > 0) {
            parts.push(`Gagal: ${stats.failed}`);
        }
        return parts.join(' · ');
    }, [hasStats, stats]);

    const successSignature = React.useMemo(
        () =>
            success
                ? JSON.stringify({
                      id: flashId,
                      success,
                      stats: stats ?? null,
                  })
                : '',
        [flashId, stats, success],
    );

    const lastSuccessRef = React.useRef<string>('');

    React.useEffect(() => {
        if (
            success &&
            successSignature &&
            successSignature !== lastSuccessRef.current
        ) {
            const content = (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">{success}</span>
                    {statsLine && (
                        <span className="text-xs text-white/90">
                            {statsLine}
                        </span>
                    )}
                </div>
            );

            toast.success(content, {
                toastId: successSignature,
                autoClose: 6000,
            });
            lastSuccessRef.current = successSignature;
        } else if (!success) {
            lastSuccessRef.current = '';
        }
    }, [success, statsLine, successSignature]);

    React.useEffect(() => {
        if (!temporaryPassword) {
            return;
        }

        const toastId = `temporary-password-${flashId ?? temporaryPassword}`;

        toast.info(
            <div className="flex flex-col gap-1">
                <span className="font-semibold">Password sementara dibuat</span>
                <span className="text-sm">
                    Bagikan password sementara berikut kepada pengguna:{' '}
                    <code className="rounded bg-white/20 px-1 py-0.5 text-white">
                        {temporaryPassword}
                    </code>
                </span>
            </div>,
            {
                toastId,
                autoClose: 10000,
            },
        );
    }, [temporaryPassword, flashId]);

    const openErrorDetails = React.useCallback(
        () => setShowErrorModal(true),
        [],
    );

    const errorSignature = React.useMemo(
        () =>
            JSON.stringify({
                id: flashId,
                error: error ?? '',
                failures: failures.map((f) => ({
                    row: f.row,
                    errors: f.errors.join('|'),
                })),
            }),
        [error, failures, flashId],
    );
    const lastErrorSignature = React.useRef<string>('');

    React.useEffect(() => {
        if (hasError || hasFailures) {
            if (errorSignature !== lastErrorSignature.current) {
                lastErrorSignature.current = errorSignature;
                const message = hasError
                    ? (error ?? 'Terjadi kesalahan.')
                    : `Beberapa baris gagal diproses (${failures.length}).`;
                const content = (
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <div className="font-semibold">
                                Import santri bermasalah
                            </div>
                            <div className="text-sm">{message}</div>
                        </div>
                        {/* {hasFailures && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toast.dismiss(errorSignature);
                                    openErrorDetails();
                                }}
                            >
                                Detail
                            </Button>
                        )} */}
                    </div>
                );

                toast.error(content, {
                    toastId: errorSignature,
                    autoClose: hasFailures ? 8000 : 7000,
                });
                setShowErrorModal(true);
            }
        } else {
            lastErrorSignature.current = '';
            setShowErrorModal(false);
        }
    }, [
        errorSignature,
        hasError,
        hasFailures,
        failures.length,
        openErrorDetails,
        error,
    ]);

    return (
        <AppLayout>
            <Head title="User" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {hasTemporaryPassword && temporaryPassword && (
                    <Alert>
                        <AlertTitle>Password sementara</AlertTitle>
                        <AlertDescription>
                            Password sementara untuk pengguna:{' '}
                            <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                {temporaryPassword}
                            </code>
                            Pastikan pengguna diminta mengganti password saat
                            pertama login.
                        </AlertDescription>
                    </Alert>
                )}
                {hasFailures && (
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={openErrorDetails}
                        >
                            Detail kegagalan terakhir
                        </Button>
                    </div>
                )}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="col-2">USERS</CardTitle>
                            <div className="flex items-center gap-2">
                                <ButtonGroup>
                                    <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    aria-label="More Options"
                                                >
                                                Guru <ChevronDownCircleIcon />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-25"
                                        >
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem>
                                                    Input Guru
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Upload Guru
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </ButtonGroup>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="py-5">
                            <DataTable columns={columns} data={users.data} />
                        </div>
                    </CardContent>
                </Card>
                <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                Detail Kesalahan Import Santri
                            </DialogTitle>
                            <DialogDescription>
                                Periksa pesan berikut sebelum mencoba lagi.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Pesan Sistem</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {hasFailures && (
                                <div className="rounded-md border p-3">
                                    <div className="mb-2 font-semibold">
                                        Baris gagal ({failures.length})
                                    </div>
                                    <ul className="max-h-60 list-disc space-y-2 overflow-auto pl-5 text-sm">
                                        {failures.map((f, i) => (
                                            <li key={`${f.row}-${i}`}>
                                                Baris {f.row}:{' '}
                                                {f.errors.join('; ')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowErrorModal(false)}
                            >
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
