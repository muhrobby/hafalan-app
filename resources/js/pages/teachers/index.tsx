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
import { buildTeacherColumns, type TeacherRow } from './columns';
import { TeacherTable } from './data-table';
import { TeacherFormModal, type TeacherPayload } from './teacher-form-modal';

type Failure = { row: number; errors: string[]; values?: Record<string, any> };

type TeachersPageProps = {
    teachers: {
        data: TeacherRow[];
        links: unknown;
    } & Record<string, any>;
    filters: {
        search?: string;
        has_class?: boolean | null;
        date_from?: string;
        date_to?: string;
    };
    canManage: boolean;
};

export default function TeachersIndex({
    teachers,
    filters,
    canManage,
}: TeachersPageProps) {
    const [formOpen, setFormOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [selectedTeacher, setSelectedTeacher] = React.useState<
        TeacherPayload | undefined
    >(undefined);
    const [teacherToDelete, setTeacherToDelete] = React.useState<
        TeacherRow | undefined
    >();
    const [teacherToResetPassword, setTeacherToResetPassword] = React.useState<
        TeacherRow | undefined
    >();

    const page = usePage().props as {
        success?: string;
        error?: string;
        failures?: Failure[];
        flashId?: string | null;
    };

    const failures = Array.isArray(page.failures) ? page.failures : [];

    const handleFilterChange = (name: string, value: string) => {
        const newFilters: Record<string, any> = {};

        if (filters.search) newFilters.search = filters.search;
        if (filters.has_class) newFilters.has_class = filters.has_class;

        if (value === 'all') {
            delete newFilters[name];
        } else {
            newFilters[name] = value;
        }

        router.get('/teachers', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.location.href = '/teachers/export';
    };

    React.useEffect(() => {
        if (page.success) {
            toast.success(page.success, {
                toastId: `teachers-success-${page.flashId ?? page.success}`,
            });
        }
        if (page.error) {
            toast.error(page.error, {
                toastId: `teachers-error-${page.flashId ?? page.error}`,
            });
        }
    }, [page.success, page.error, page.flashId]);

    const columns = React.useMemo(
        () =>
            buildTeacherColumns({
                canManage,
                onEdit: (teacher) => {
                    setSelectedTeacher(teacher);
                    setFormOpen(true);
                },
                onDelete: (teacher) => {
                    setTeacherToDelete(teacher);
                },
                onResetPassword: (teacher) => {
                    setTeacherToResetPassword(teacher);
                },
            }),
        [canManage],
    );

    const openCreateModal = () => {
        setSelectedTeacher(undefined);
        setFormOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Guru" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                                <PlusCircle className="h-5 w-5 text-white" />
                            </div>
                            <span>Data Guru</span>
                        </CardTitle>
                        {canManage && (
                            <ButtonGroup>
                                <Button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 shadow-md hover:from-amber-700 hover:to-orange-700"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Guru
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setUploadOpen(true)}
                                    className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30"
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
                                    Status Kelas
                                </Label>
                                <Select
                                    value={
                                        filters.has_class?.toString() || 'all'
                                    }
                                    onValueChange={(value) =>
                                        handleFilterChange('has_class', value)
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
                                            Mengajar Kelas
                                        </SelectItem>
                                        <SelectItem value="false">
                                            Belum Mengajar
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleExport} variant="outline">
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>

                        <TeacherTable columns={columns} data={teachers.data} />
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
                    <TeacherFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        teacher={selectedTeacher}
                        title={selectedTeacher ? 'Edit Guru' : 'Tambah Guru'}
                    />
                    <UploadCsvModal
                        open={uploadOpen}
                        onOpenChange={setUploadOpen}
                        title="Upload Guru"
                        action="/teachers/import"
                        sampleUrl="/teachers/template"
                        description={
                            <>
                                Pastikan file berformat <b>CSV</b> atau{' '}
                                <b>XLSX</b>. Kolom <code>nip</code> boleh
                                dikosongkan dan sistem akan membuat NIP dengan
                                pola <code>USTyy######</code>.{' '}
                                <a
                                    className="underline"
                                    href="/teachers/template"
                                >
                                    Unduh template contoh
                                </a>
                                .
                            </>
                        }
                    />
                    <Dialog
                        open={Boolean(teacherToDelete)}
                        onOpenChange={(openState) => {
                            if (!openState) setTeacherToDelete(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Hapus Guru</DialogTitle>
                                <DialogDescription>
                                    {teacherToDelete ? (
                                        <>
                                            Data guru{' '}
                                            <strong>
                                                {teacherToDelete.name}
                                            </strong>{' '}
                                            akan dihapus. Tindakan ini tidak
                                            bisa dibatalkan.
                                        </>
                                    ) : (
                                        'Data guru akan dihapus.'
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setTeacherToDelete(undefined)
                                    }
                                    disabled={!teacherToDelete}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (!teacherToDelete) return;

                                        router.delete(
                                            `/teachers/${teacherToDelete.id}`,
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setTeacherToDelete(
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
                        open={Boolean(teacherToResetPassword)}
                        onOpenChange={(openState) => {
                            if (!openState)
                                setTeacherToResetPassword(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    {teacherToResetPassword ? (
                                        <>
                                            Password untuk{' '}
                                            <strong>
                                                {teacherToResetPassword.name}
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
                                        setTeacherToResetPassword(undefined)
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!teacherToResetPassword) return;

                                        router.post(
                                            '/admin/password/temp',
                                            {
                                                user_id:
                                                    teacherToResetPassword.user_id,
                                            },
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setTeacherToResetPassword(
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
