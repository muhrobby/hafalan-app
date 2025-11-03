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
import { buildStudentColumns, type StudentRow } from './columns';
import { StudentTable } from './data-table';
import { StudentFormModal, type StudentPayload } from './student-form-modal';
import { StudentGuardianComboModal } from './student-guardian-combo-modal';

type Failure = { row: number; errors: string[]; values?: Record<string, any> };

type StudentsPageProps = {
    students: {
        data: StudentRow[];
        links: unknown;
    } & Record<string, any>;
    filters: {
        search?: string;
        class_id?: string | null;
        has_guardian?: string | null;
    };
    canManage: boolean;
};

export default function StudentsIndex({
    students,
    filters,
    canManage,
}: StudentsPageProps) {
    const [formOpen, setFormOpen] = React.useState(false);
    const [comboFormOpen, setComboFormOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [selectedStudent, setSelectedStudent] = React.useState<
        StudentPayload | undefined
    >(undefined);
    const [studentToDelete, setStudentToDelete] = React.useState<
        StudentRow | undefined
    >();
    const [studentToResetPassword, setStudentToResetPassword] = React.useState<
        StudentRow | undefined
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
        if (filters.has_guardian)
            newFilters.has_guardian = filters.has_guardian;
        if (filters.class_id) newFilters.class_id = filters.class_id;

        if (value === 'all') {
            delete newFilters[name];
        } else {
            newFilters[name] = value;
        }

        router.get('/students', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.location.href = '/students/export';
    };

    React.useEffect(() => {
        if (page.success) {
            toast.success(page.success, {
                toastId: `students-success-${page.flashId ?? page.success}`,
            });
        }
        if (page.error) {
            toast.error(page.error, {
                toastId: `students-error-${page.flashId ?? page.error}`,
            });
        }
    }, [page.success, page.error, page.flashId]);

    const columns = React.useMemo(
        () =>
            buildStudentColumns({
                canManage,
                onEdit: (student) => {
                    setSelectedStudent(student);
                    setFormOpen(true);
                },
                onDelete: (student) => {
                    setStudentToDelete(student);
                },
                onResetPassword: (student) => {
                    setStudentToResetPassword(student);
                },
            }),
        [canManage],
    );

    const openCreateModal = () => {
        setSelectedStudent(undefined);
        setFormOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Santri" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                                <PlusCircle className="h-5 w-5 text-white" />
                            </div>
                            <span>Data Santri</span>
                        </CardTitle>
                        {canManage && (
                            <ButtonGroup>
                                <Button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:from-blue-700 hover:to-purple-700"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Santri
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setComboFormOpen(true)}
                                    className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 dark:text-emerald-300"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Santri + Wali
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setUploadOpen(true)}
                                    className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30"
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
                                    Status Wali
                                </Label>
                                <Select
                                    value={filters.has_guardian || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange(
                                            'has_guardian',
                                            value,
                                        )
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
                                            Punya Wali
                                        </SelectItem>
                                        <SelectItem value="false">
                                            Belum Punya Wali
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleExport}
                                variant="outline"
                                className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>

                        <StudentTable
                            columns={columns}
                            data={students.data}
                            searchPlaceholder="Cari nama, email, atau NIS..."
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
                    <StudentFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        student={selectedStudent}
                        title={
                            selectedStudent ? 'Edit Santri' : 'Tambah Santri'
                        }
                    />
                    <StudentGuardianComboModal
                        open={comboFormOpen}
                        onOpenChange={setComboFormOpen}
                    />
                    <UploadCsvModal
                        open={uploadOpen}
                        onOpenChange={setUploadOpen}
                        title="Upload Santri"
                        action="/students/import"
                        sampleUrl="/students/template"
                        description={
                            <>
                                Pastikan file berformat <b>CSV</b> atau{' '}
                                <b>XLSX</b>. Kolom <code>nis</code> boleh
                                dikosongkan dan sistem akan membuat NIS dengan
                                pola <code>yymmdd######</code>.{' '}
                                <a
                                    className="underline"
                                    href="/students/template"
                                >
                                    Unduh template contoh
                                </a>
                                .
                            </>
                        }
                    />
                    <Dialog
                        open={Boolean(studentToDelete)}
                        onOpenChange={(openState) => {
                            if (!openState) setStudentToDelete(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Hapus Santri</DialogTitle>
                                <DialogDescription>
                                    {studentToDelete ? (
                                        <>
                                            Data santri{' '}
                                            <strong>
                                                {studentToDelete.name}
                                            </strong>{' '}
                                            akan dihapus. Tindakan ini tidak
                                            bisa dibatalkan.
                                        </>
                                    ) : (
                                        'Data santri akan dihapus.'
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setStudentToDelete(undefined)
                                    }
                                    disabled={!studentToDelete}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (!studentToDelete) return;

                                        router.delete(
                                            `/students/${studentToDelete.id}`,
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setStudentToDelete(
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
                        open={Boolean(studentToResetPassword)}
                        onOpenChange={(openState) => {
                            if (!openState)
                                setStudentToResetPassword(undefined);
                        }}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    {studentToResetPassword ? (
                                        <>
                                            Password untuk{' '}
                                            <strong>
                                                {studentToResetPassword.name}
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
                                        setStudentToResetPassword(undefined)
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!studentToResetPassword) return;

                                        router.post(
                                            '/admin/password/temp',
                                            {
                                                user_id:
                                                    studentToResetPassword.user_id,
                                            },
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setStudentToResetPassword(
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
