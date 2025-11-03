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
import UploadCsvModal from '@/components/upload-csv-modal';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle, UploadCloud } from 'lucide-react';
import * as React from 'react';
import { toast } from 'react-toastify';
import { AdminFormModal, type AdminPayload } from './admin-form-modal';
import { buildAdminColumns, type AdminRow } from './columns';
import { AdminTable } from './data-table';

type Failure = { row: number; errors: string[]; values?: Record<string, any> };

type AdminsPageProps = {
    admins: {
        data: AdminRow[];
        links: unknown;
    } & Record<string, any>;
    filters: {
        search?: string;
    };
    canManage: boolean;
};

export default function AdminsIndex({
    admins,
    filters,
    canManage,
}: AdminsPageProps) {
    const [formOpen, setFormOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [selectedAdmin, setSelectedAdmin] = React.useState<
        AdminPayload | undefined
    >(undefined);
    const [adminToDelete, setAdminToDelete] = React.useState<
        AdminRow | undefined
    >();
    const [adminToResetPassword, setAdminToResetPassword] = React.useState<
        AdminRow | undefined
    >();

    const page = usePage().props as {
        success?: string;
        error?: string;
        failures?: Failure[];
        flashId?: string | null;
    };

    const failures = Array.isArray(page.failures) ? page.failures : [];

    const handleExport = () => {
        window.location.href = '/admins/export';
    };

    React.useEffect(() => {
        if (page.success) {
            toast.success(page.success, {
                toastId: `admins-success-${page.flashId ?? page.success}`,
            });
        }
        if (page.error) {
            toast.error(page.error, {
                toastId: `admins-error-${page.flashId ?? page.error}`,
            });
        }
    }, [page.success, page.error, page.flashId]);

    const columns = React.useMemo(
        () =>
            buildAdminColumns({
                canManage,
                onEdit: (admin) => {
                    setSelectedAdmin(admin);
                    setFormOpen(true);
                },
                onDelete: (admin) => {
                    setAdminToDelete(admin);
                },
                onResetPassword: (admin) => {
                    setAdminToResetPassword(admin);
                },
            }),
        [canManage],
    );

    const openCreateModal = () => {
        setSelectedAdmin(undefined);
        setFormOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-md">
                                <PlusCircle className="h-5 w-5 text-white" />
                            </div>
                            <span>Data Admin</span>
                        </CardTitle>
                        {canManage && (
                            <ButtonGroup>
                                <Button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-red-600 to-rose-600 shadow-md hover:from-red-700 hover:to-rose-700"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Admin
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setUploadOpen(true)}
                                    className="border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 dark:from-rose-950/30 dark:to-red-950/30"
                                >
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload CSV
                                </Button>
                            </ButtonGroup>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-end gap-4">
                            <div className="flex-1"></div>

                            <Button
                                onClick={handleExport}
                                variant="outline"
                                className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>

                        <AdminTable columns={columns} data={admins.data} />
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
                    <AdminFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        admin={selectedAdmin}
                        title={selectedAdmin ? 'Edit Admin' : 'Tambah Admin'}
                    />
                    <UploadCsvModal
                        open={uploadOpen}
                        onOpenChange={setUploadOpen}
                        title="Upload Admin"
                        action="/admins/import"
                    />
                    <Dialog
                        open={Boolean(adminToDelete)}
                        onOpenChange={(openState) => {
                            if (!openState) setAdminToDelete(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Hapus Admin</DialogTitle>
                                <DialogDescription>
                                    {adminToDelete ? (
                                        <>
                                            Admin{' '}
                                            <strong>
                                                {adminToDelete.name}
                                            </strong>{' '}
                                            akan dihapus. Tindakan ini tidak
                                            bisa dibatalkan.
                                        </>
                                    ) : (
                                        'Data admin akan dihapus.'
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAdminToDelete(undefined)}
                                    disabled={!adminToDelete}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (!adminToDelete) return;

                                        router.delete(
                                            `/admins/${adminToDelete.id}`,
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setAdminToDelete(undefined),
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
                        open={Boolean(adminToResetPassword)}
                        onOpenChange={(openState) => {
                            if (!openState) setAdminToResetPassword(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    {adminToResetPassword ? (
                                        <>
                                            Password admin{' '}
                                            <strong>
                                                {adminToResetPassword.name}
                                            </strong>{' '}
                                            akan direset menjadi{' '}
                                            <strong>Password!123</strong>.
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
                                        setAdminToResetPassword(undefined)
                                    }
                                    disabled={!adminToResetPassword}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!adminToResetPassword) return;

                                        router.post(
                                            '/admin/password/temp',
                                            {
                                                user_id:
                                                    adminToResetPassword.id,
                                            },
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setAdminToResetPassword(
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
