import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { router, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Download, Upload } from 'lucide-react';
import { useState } from 'react';

interface BulkImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    importType: 'student-guardian' | 'teachers' | 'guardians';
    templateUrl: string;
    importUrl: string;
}

export function BulkImportModal({
    open,
    onOpenChange,
    importType,
    templateUrl,
    importUrl,
}: BulkImportModalProps) {
    const { flash } = usePage<any>().props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const titles = {
        'student-guardian': 'Upload Santri + Wali (Excel)',
        teachers: 'Upload Guru (Excel)',
        guardians: 'Upload Wali (Excel)',
    };

    const descriptions = {
        'student-guardian':
            'Upload file Excel berisi data santri beserta wali mereka. Satu santri dengan wali yang terkait.',
        teachers: 'Upload file Excel berisi data guru.',
        guardians: 'Upload file Excel berisi data wali saja (tanpa santri).',
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = templateUrl;
    };

    const handleUpload = () => {
        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        router.post(
            importUrl,
            {
                file: selectedFile,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setSelectedFile(null);
                    setIsUploading(false);
                    onOpenChange(false);
                },
                onError: () => {
                    setIsUploading(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{titles[importType]}</DialogTitle>
                    <DialogDescription>
                        {descriptions[importType]}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Flash Messages */}
                    {flash?.message && (
                        <Alert
                            variant={
                                flash.type === 'success'
                                    ? 'default'
                                    : 'destructive'
                            }
                        >
                            {flash.type === 'success' ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Download Template */}
                    <div className="rounded-lg border border-dashed border-gray-300 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium">
                                    Download Template Excel
                                </h4>
                                <p className="mt-1 text-xs text-gray-500">
                                    Gunakan template ini untuk memastikan format
                                    data Anda benar
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Pilih File Excel</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        {selectedFile && (
                            <p className="text-sm text-gray-500">
                                File terpilih: {selectedFile.name}
                            </p>
                        )}
                    </div>

                    {/* Validation Errors */}
                    {flash?.errors && flash.errors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="mb-2 font-medium">
                                    Terdapat {flash.errors.length} error pada
                                    file Excel:
                                </div>
                                <div className="max-h-40 space-y-1 overflow-y-auto">
                                    {flash.errors
                                        .slice(0, 5)
                                        .map((error: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="rounded bg-red-50 p-2 text-xs"
                                            >
                                                <strong>
                                                    Baris {error.row}:
                                                </strong>{' '}
                                                {error.errors.join(', ')}
                                            </div>
                                        ))}
                                    {flash.errors.length > 5 && (
                                        <p className="text-xs italic">
                                            ... dan {flash.errors.length - 5}{' '}
                                            error lainnya
                                        </p>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isUploading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Mengupload...' : 'Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
