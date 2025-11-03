import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import UploadCsvModal from '@/components/upload-csv-modal';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle, UploadCloud } from 'lucide-react';
import * as React from 'react';
import { toast } from 'react-toastify';
import { buildGuardianColumns, type GuardianRow } from './columns';
import { GuardianTable } from './data-table';
import { GuardianFormModal, type GuardianPayload } from './guardian-form-modal';

type Failure = { row: number; errors: string[]; values?: Record<string, any> };

type GuardiansPageProps = {
    guardians: {
        data: GuardianRow[];
        links: unknown;
    } & Record<string, any>;
    filters: {
        search?: string;
        has_student?: boolean | null;
        date_from?: string;
        date_to?: string;
    };
    canManage: boolean;
};

export default function GuardiansIndex({
    guardians,
    filters,
    canManage,
}: GuardiansPageProps) {
    const [formOpen, setFormOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [selectedGuardian, setSelectedGuardian] = React.useState<
        GuardianPayload | undefined
    >(undefined);
    const [guardianToDelete, setGuardianToDelete] = React.useState<
        GuardianRow | undefined
    >();
    const [guardianToResetPassword, setGuardianToResetPassword] =
        React.useState<GuardianRow | undefined>();

    const page = usePage().props as {
        success?: string;
        error?: string;
        failures?: Failure[];
        flashId?: string | null;
    };

    const failures = Array.isArray(page.failures) ? page.failures : [];

    const handleFilterChange = (name: string, value: string) => {
        const newFilters: Record<string, any> = {};

        // Keep existing filters
        if (filters.search) newFilters.search = filters.search;
        if (filters.has_student) newFilters.has_student = filters.has_student;

        // Update changed filter
        if (value === 'all') {
            delete newFilters[name];
        } else {
            newFilters[name] = value;
        }

        router.get('/guardians', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.location.href = '/guardians/export';
    };

    React.useEffect(() => {
        if (page.success) {
            toast.success(page.success, {
                toastId: `guardians-success-${page.flashId ?? page.success}`,
            });
        }
        if (page.error) {
            toast.error(page.error, {
                toastId: `guardians-error-${page.flashId ?? page.error}`,
            });
        }
    }, [page.success, page.error, page.flashId]);

    const columns = React.useMemo(
        () =>
            buildGuardianColumns({
                canManage,
                onEdit: (guardian) => {
                    setSelectedGuardian(guardian);
                    setFormOpen(true);
                },
                onDelete: (guardian) => {
                    setGuardianToDelete(guardian);
                },
                onResetPassword: (guardian) => {
                    setGuardianToResetPassword(guardian);
                },
            }),
        [canManage],
    );

    const openCreateModal = () => {
        setSelectedGuardian(undefined);
        setFormOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Wali" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                                <PlusCircle className="h-5 w-5 text-white" />
                            </div>
                            <span>Data Wali</span>
                        </CardTitle>
                        {canManage && (
                            <ButtonGroup>
                                <Button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:from-emerald-700 hover:to-teal-700"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Wali
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setUploadOpen(true)}
                                    className="border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 dark:from-teal-950/30 dark:to-emerald-950/30"
                                >
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload CSV
                                </Button>
                            </ButtonGroup>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-end gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="status-filter">
                                    Status Santri
                                </Label>
                                <Select
                                    value={
                                        filters.has_student?.toString() || 'all'
                                    }
                                    onValueChange={(value) =>
                                        handleFilterChange('has_student', value)
                                    }
                                >
                                    <SelectTrigger id="status-filter">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="true">
                                            Punya Santri
                                        </SelectItem>
                                        <SelectItem value="false">
                                            Belum Punya Santri
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* <Button onClick={handleExport} variant="outline">
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button> */}
                        </div>

                        <GuardianTable
                            columns={columns}
                            data={guardians.data}
                        />
                    </CardContent>
                </Card>

                {failures.length > 0 && (
                    <Alert variant="destructive">
                        <AlertTitle>Baris Gagal ({failures.length})</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc space-y-1 pl-5 text-sm">
                                {failures.map((failure, index) => (
                                    <li key={`${failure.row}-${index}`}>
                                        Baris {failure.row}:{' '}
                                        {failure.errors.join('; ')}
                                    </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {canManage && (
                <>
                    <GuardianFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        guardian={selectedGuardian}
                        title={selectedGuardian ? 'Edit Wali' : 'Tambah Wali'}
                    />
                    <UploadCsvModal
                        open={uploadOpen}
                        onOpenChange={setUploadOpen}
                        title="Upload Wali"
                        action="/guardians/import"
                    />
                    <Dialog
                        open={Boolean(guardianToDelete)}
                        onOpenChange={(openState) => {
                            if (!openState) setGuardianToDelete(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Hapus Wali</DialogTitle>
                                <DialogDescription>
                                    {guardianToDelete ? (
                                        <>
                                            Data wali{' '}
                                            <strong>
                                                {guardianToDelete.name}
                                            </strong>{' '}
                                            akan dihapus. Tindakan ini tidak
                                            bisa dibatalkan.
                                        </>
                                    ) : (
                                        'Data wali akan dihapus.'
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setGuardianToDelete(undefined)
                                    }
                                    disabled={!guardianToDelete}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (!guardianToDelete) return;

                                        router.delete(
                                            `/guardians/${guardianToDelete.id}`,
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setGuardianToDelete(
                                                        undefined,
                                                    ),
                                            },
                                        );
                                    }}
                                >
                                    Hapus
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={Boolean(guardianToResetPassword)}
                        onOpenChange={(openState) => {
                            if (!openState)
                                setGuardianToResetPassword(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    {guardianToResetPassword ? (
                                        <>
                                            Password untuk{' '}
                                            <strong>
                                                {guardianToResetPassword.name}
                                            </strong>{' '}
                                            akan direset ke{' '}
                                            <strong>Password!123</strong>
                                        </>
                                    ) : (
                                        'Password akan direset.'
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setGuardianToResetPassword(undefined)
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!guardianToResetPassword) return;

                                        router.post(
                                            '/admin/password/temp',
                                            {
                                                user_id:
                                                    guardianToResetPassword.user_id,
                                            },
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setGuardianToResetPassword(
                                                        undefined,
                                                    ),
                                            },
                                        );
                                    }}
                                >
                                    Reset Password
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </AppLayout>
    );
}
