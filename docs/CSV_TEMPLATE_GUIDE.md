# 📄 CSV TEMPLATE GUIDE & IMPLEMENTATION

**Tanggal:** 26 Oktober 2025  
**Tujuan:** Membuat template CSV yang user-friendly dengan dokumentasi lengkap dan validasi

---

## 📋 PART 1: TEMPLATE FILES

### **1. Template Santri (Students)**

**File:** `storage/templates/template-santri.csv`

```csv
name,email,class_name,birth_date,phone,nis,guardian_emails
Ahmad Fauzi,ahmad.fauzi@example.com,Kelas 1A,2012-03-14,081234567890,251026000001,"wali.ahmad@example.com,ibu.ahmad@example.com"
Aisyah Nur,aisyah.nur@example.com,Kelas 1A,2011-08-21,081234567891,251026000002,wali.aisyah@example.com
Muhammad Rizki,rizki.muhammad@example.com,Kelas 1B,2012-05-10,081234567892,,wali.rizki@example.com
Fatimah Zahra,fatimah.zahra@example.com,Kelas 2A,2011-01-15,081234567893,251026000003,
```

**File:** `storage/templates/template-santri-with-docs.csv`

```csv
# TEMPLATE IMPORT SANTRI - HAFALAN APP
# =====================================
# 
# KOLOM WAJIB:
# - name: Nama lengkap santri (maksimal 100 karakter)
# - email: Email unik untuk login (format: nama@domain.com)
#
# KOLOM OPSIONAL:
# - class_name: Nama kelas (akan dibuat otomatis jika belum ada)
# - birth_date: Tanggal lahir (format: YYYY-MM-DD, contoh: 2012-03-14)
# - phone: Nomor telepon santri (format: 08xxxxxxxxxx)
# - nis: Nomor Induk Santri (kosongkan untuk generate otomatis dengan pola: yymmdd######)
# - guardian_emails: Email wali santri (pisahkan dengan koma jika lebih dari satu, contoh: "wali1@example.com,wali2@example.com")
#
# CATATAN PENTING:
# 1. Baris yang diawali # akan diabaikan
# 2. Email harus unik (tidak boleh duplikat)
# 3. Jika email wali belum terdaftar, akan dibuat akun wali baru otomatis
# 4. Password default untuk akun baru: Password!123 (harus diganti saat login pertama)
# 5. Maksimal ukuran file: 5MB (~10,000 baris)
# 6. Format file: CSV atau XLSX
#
# CONTOH DATA:
name,email,class_name,birth_date,phone,nis,guardian_emails
Ahmad Fauzi,ahmad.fauzi@example.com,Kelas 1A,2012-03-14,081234567890,251026000001,"wali.ahmad@example.com,ibu.ahmad@example.com"
Aisyah Nur,aisyah.nur@example.com,Kelas 1A,2011-08-21,081234567891,251026000002,wali.aisyah@example.com
Muhammad Rizki,rizki.muhammad@example.com,Kelas 1B,2012-05-10,081234567892,,wali.rizki@example.com
Fatimah Zahra,fatimah.zahra@example.com,Kelas 2A,2011-01-15,081234567893,251026000003,
```

### **2. Template Wali (Guardians)**

**File:** `storage/templates/template-wali.csv`

```csv
name,email,phone,student_emails,address
Bapak Ahmad Santoso,wali.ahmad@example.com,081234567890,"ahmad.fauzi@example.com,aisyah.nur@example.com","Jl. Merdeka No. 123, Jakarta"
Ibu Siti Nurhaliza,wali.aisyah@example.com,081234567891,aisyah.nur@example.com,"Jl. Sudirman No. 45, Bandung"
Bapak Muhammad Hasan,wali.rizki@example.com,081234567892,rizki.muhammad@example.com,"Jl. Asia Afrika No. 67, Surabaya"
Ibu Fatimah Azzahra,wali.fatimah@example.com,081234567893,fatimah.zahra@example.com,"Jl. Gatot Subroto No. 89, Yogyakarta"
```

**File:** `storage/templates/template-wali-with-docs.csv`

```csv
# TEMPLATE IMPORT WALI - HAFALAN APP
# ===================================
# 
# KOLOM WAJIB:
# - name: Nama lengkap wali/orang tua (maksimal 100 karakter)
# - email: Email unik untuk login (format: nama@domain.com)
#
# KOLOM OPSIONAL:
# - phone: Nomor telepon wali (format: 08xxxxxxxxxx atau +62xxx)
# - student_emails: Email santri yang diasuh (pisahkan dengan koma jika lebih dari satu)
# - address: Alamat lengkap wali
#
# CATATAN PENTING:
# 1. Email harus unik (tidak boleh duplikat)
# 2. student_emails harus merujuk ke email santri yang SUDAH terdaftar
# 3. Jika student_emails kosong, wali akan dibuat tanpa relasi ke santri (bisa ditambahkan nanti)
# 4. Password default: Password!123 (harus diganti saat login pertama)
# 5. Satu wali bisa mengasuh banyak santri
# 6. Maksimal ukuran file: 5MB
#
# CONTOH DATA:
name,email,phone,student_emails,address
Bapak Ahmad Santoso,wali.ahmad@example.com,081234567890,"ahmad.fauzi@example.com,aisyah.nur@example.com","Jl. Merdeka No. 123, Jakarta"
Ibu Siti Nurhaliza,wali.aisyah@example.com,081234567891,aisyah.nur@example.com,"Jl. Sudirman No. 45, Bandung"
Bapak Muhammad Hasan,wali.rizki@example.com,081234567892,rizki.muhammad@example.com,"Jl. Asia Afrika No. 67, Surabaya"
```

### **3. Template Guru (Teachers)**

**File:** `storage/templates/template-guru.csv`

```csv
name,email,phone,nip,class_names
Ustadz Ahmad Dahlan,ustadz.ahmad@example.com,081234567890,20251026001,"Kelas 1A,Kelas 1B,Kelas 2A"
Ustadzah Siti Khadijah,ustadzah.siti@example.com,081234567891,20251026002,"Kelas 1A,Kelas 3A"
Ustadz Muhammad Iqbal,ustadz.iqbal@example.com,081234567892,,"Kelas 2B,Kelas 3B"
Ustadzah Fatimah Rahman,ustadzah.fatimah@example.com,081234567893,20251026003,Kelas 4A
```

**File:** `storage/templates/template-guru-with-docs.csv`

```csv
# TEMPLATE IMPORT GURU - HAFALAN APP
# ===================================
# 
# KOLOM WAJIB:
# - name: Nama lengkap ustadz/ustadzah (maksimal 100 karakter)
# - email: Email unik untuk login (format: nama@domain.com)
#
# KOLOM OPSIONAL:
# - phone: Nomor telepon (format: 08xxxxxxxxxx atau +62xxx)
# - nip: Nomor Induk Pegawai (kosongkan untuk generate otomatis dengan pola: yyyymmdd####)
# - class_names: Nama kelas yang diampu (pisahkan dengan koma jika lebih dari satu)
#
# CATATAN PENTING:
# 1. Email harus unik (tidak boleh duplikat)
# 2. class_names: kelas akan dibuat otomatis jika belum ada
# 3. Satu guru bisa mengajar banyak kelas
# 4. Password default: Password!123 (harus diganti saat login pertama)
# 5. NIP akan di-generate otomatis jika kosong (format: YYYYMMDD + 4 digit urut)
# 6. Maksimal ukuran file: 5MB
#
# CONTOH DATA:
name,email,phone,nip,class_names
Ustadz Ahmad Dahlan,ustadz.ahmad@example.com,081234567890,20251026001,"Kelas 1A,Kelas 1B,Kelas 2A"
Ustadzah Siti Khadijah,ustadzah.siti@example.com,081234567891,20251026002,"Kelas 1A,Kelas 3A"
Ustadz Muhammad Iqbal,ustadz.iqbal@example.com,081234567892,,"Kelas 2B,Kelas 3B"
Ustadzah Fatimah Rahman,ustadzah.fatimah@example.com,081234567893,20251026003,Kelas 4A
```

### **4. Template Admin**

**File:** `storage/templates/template-admin.csv`

```csv
name,email
Admin Utama,admin.utama@example.com
Admin Akademik,admin.akademik@example.com
Admin Keuangan,admin.keuangan@example.com
```

**File:** `storage/templates/template-admin-with-docs.csv`

```csv
# TEMPLATE IMPORT ADMIN - HAFALAN APP
# ====================================
# 
# KOLOM WAJIB:
# - name: Nama lengkap admin (maksimal 100 karakter)
# - email: Email unik untuk login (format: nama@domain.com)
#
# CATATAN PENTING:
# 1. Email harus unik (tidak boleh duplikat)
# 2. Password default: Password!123 (harus diganti saat login pertama)
# 3. Admin memiliki akses penuh ke semua fitur sistem
# 4. Maksimal ukuran file: 5MB
# 5. Tidak ada kolom tambahan untuk admin (hanya name dan email)
#
# CONTOH DATA:
name,email
Admin Utama,admin.utama@example.com
Admin Akademik,admin.akademik@example.com
Admin Keuangan,admin.keuangan@example.com
```

---

## 🔧 PART 2: BACKEND IMPLEMENTATION

### **1. Create Template Controller**

**File:** `app/Http/Controllers/TemplateController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TemplateController extends Controller
{
    /**
     * Download template santri
     */
    public function students(Request $request): StreamedResponse
    {
        $withDocs = $request->query('docs', false);

        return $this->streamTemplate(
            'template-santri.csv',
            $withDocs ? $this->getStudentTemplateWithDocs() : $this->getStudentTemplate()
        );
    }

    /**
     * Download template wali
     */
    public function guardians(Request $request): StreamedResponse
    {
        $withDocs = $request->query('docs', false);

        return $this->streamTemplate(
            'template-wali.csv',
            $withDocs ? $this->getGuardianTemplateWithDocs() : $this->getGuardianTemplate()
        );
    }

    /**
     * Download template guru
     */
    public function teachers(Request $request): StreamedResponse
    {
        $withDocs = $request->query('docs', false);

        return $this->streamTemplate(
            'template-guru.csv',
            $withDocs ? $this->getTeacherTemplateWithDocs() : $this->getTeacherTemplate()
        );
    }

    /**
     * Download template admin
     */
    public function admins(Request $request): StreamedResponse
    {
        $withDocs = $request->query('docs', false);

        return $this->streamTemplate(
            'template-admin.csv',
            $withDocs ? $this->getAdminTemplateWithDocs() : $this->getAdminTemplate()
        );
    }

    /**
     * Stream CSV template
     */
    private function streamTemplate(string $filename, array $data): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-store, no-cache',
            'Pragma' => 'no-cache',
        ];

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for Excel UTF-8 support
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            foreach ($data as $row) {
                fputcsv($handle, $row);
            }
            
            fclose($handle);
        }, $filename, $headers);
    }

    /**
     * Get student template data
     */
    private function getStudentTemplate(): array
    {
        return [
            ['name', 'email', 'class_name', 'birth_date', 'phone', 'nis', 'guardian_emails'],
            ['Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Kelas 1A', '2012-03-14', '081234567890', '251026000001', 'wali.ahmad@example.com,ibu.ahmad@example.com'],
            ['Aisyah Nur', 'aisyah.nur@example.com', 'Kelas 1A', '2011-08-21', '081234567891', '251026000002', 'wali.aisyah@example.com'],
            ['Muhammad Rizki', 'rizki.muhammad@example.com', 'Kelas 1B', '2012-05-10', '081234567892', '', 'wali.rizki@example.com'],
            ['Fatimah Zahra', 'fatimah.zahra@example.com', 'Kelas 2A', '2011-01-15', '081234567893', '251026000003', ''],
        ];
    }

    /**
     * Get student template with documentation
     */
    private function getStudentTemplateWithDocs(): array
    {
        return [
            ['# TEMPLATE IMPORT SANTRI - HAFALAN APP'],
            ['# ====================================='],
            ['# '],
            ['# KOLOM WAJIB:'],
            ['# - name: Nama lengkap santri (maksimal 100 karakter)'],
            ['# - email: Email unik untuk login (format: nama@domain.com)'],
            ['# '],
            ['# KOLOM OPSIONAL:'],
            ['# - class_name: Nama kelas (akan dibuat otomatis jika belum ada)'],
            ['# - birth_date: Tanggal lahir (format: YYYY-MM-DD, contoh: 2012-03-14)'],
            ['# - phone: Nomor telepon santri (format: 08xxxxxxxxxx)'],
            ['# - nis: Nomor Induk Santri (kosongkan untuk generate otomatis)'],
            ['# - guardian_emails: Email wali santri (pisahkan dengan koma jika lebih dari satu)'],
            ['# '],
            ['# CATATAN PENTING:'],
            ['# 1. Baris yang diawali # akan diabaikan'],
            ['# 2. Email harus unik (tidak boleh duplikat)'],
            ['# 3. Jika email wali belum terdaftar, akan dibuat akun wali baru otomatis'],
            ['# 4. Password default: Password!123 (harus diganti saat login pertama)'],
            ['# 5. Maksimal ukuran file: 5MB (~10,000 baris)'],
            ['# '],
            ['name', 'email', 'class_name', 'birth_date', 'phone', 'nis', 'guardian_emails'],
            ['Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Kelas 1A', '2012-03-14', '081234567890', '251026000001', 'wali.ahmad@example.com,ibu.ahmad@example.com'],
            ['Aisyah Nur', 'aisyah.nur@example.com', 'Kelas 1A', '2011-08-21', '081234567891', '251026000002', 'wali.aisyah@example.com'],
            ['Muhammad Rizki', 'rizki.muhammad@example.com', 'Kelas 1B', '2012-05-10', '081234567892', '', 'wali.rizki@example.com'],
        ];
    }

    /**
     * Get guardian template data
     */
    private function getGuardianTemplate(): array
    {
        return [
            ['name', 'email', 'phone', 'student_emails', 'address'],
            ['Bapak Ahmad Santoso', 'wali.ahmad@example.com', '081234567890', 'ahmad.fauzi@example.com,aisyah.nur@example.com', 'Jl. Merdeka No. 123, Jakarta'],
            ['Ibu Siti Nurhaliza', 'wali.aisyah@example.com', '081234567891', 'aisyah.nur@example.com', 'Jl. Sudirman No. 45, Bandung'],
            ['Bapak Muhammad Hasan', 'wali.rizki@example.com', '081234567892', 'rizki.muhammad@example.com', 'Jl. Asia Afrika No. 67, Surabaya'],
        ];
    }

    /**
     * Get guardian template with documentation
     */
    private function getGuardianTemplateWithDocs(): array
    {
        return [
            ['# TEMPLATE IMPORT WALI - HAFALAN APP'],
            ['# ==================================='],
            ['# '],
            ['# KOLOM WAJIB:'],
            ['# - name: Nama lengkap wali/orang tua (maksimal 100 karakter)'],
            ['# - email: Email unik untuk login'],
            ['# '],
            ['# KOLOM OPSIONAL:'],
            ['# - phone: Nomor telepon wali'],
            ['# - student_emails: Email santri yang diasuh (pisahkan dengan koma)'],
            ['# - address: Alamat lengkap wali'],
            ['# '],
            ['# CATATAN PENTING:'],
            ['# 1. Email harus unik (tidak boleh duplikat)'],
            ['# 2. student_emails harus merujuk ke email santri yang SUDAH terdaftar'],
            ['# 3. Password default: Password!123'],
            ['# 4. Maksimal ukuran file: 5MB'],
            ['# '],
            ['name', 'email', 'phone', 'student_emails', 'address'],
            ['Bapak Ahmad Santoso', 'wali.ahmad@example.com', '081234567890', 'ahmad.fauzi@example.com,aisyah.nur@example.com', 'Jl. Merdeka No. 123, Jakarta'],
            ['Ibu Siti Nurhaliza', 'wali.aisyah@example.com', '081234567891', 'aisyah.nur@example.com', 'Jl. Sudirman No. 45, Bandung'],
        ];
    }

    /**
     * Get teacher template data
     */
    private function getTeacherTemplate(): array
    {
        return [
            ['name', 'email', 'phone', 'nip', 'class_names'],
            ['Ustadz Ahmad Dahlan', 'ustadz.ahmad@example.com', '081234567890', '20251026001', 'Kelas 1A,Kelas 1B,Kelas 2A'],
            ['Ustadzah Siti Khadijah', 'ustadzah.siti@example.com', '081234567891', '20251026002', 'Kelas 1A,Kelas 3A'],
            ['Ustadz Muhammad Iqbal', 'ustadz.iqbal@example.com', '081234567892', '', 'Kelas 2B,Kelas 3B'],
        ];
    }

    /**
     * Get teacher template with documentation
     */
    private function getTeacherTemplateWithDocs(): array
    {
        return [
            ['# TEMPLATE IMPORT GURU - HAFALAN APP'],
            ['# ==================================='],
            ['# '],
            ['# KOLOM WAJIB:'],
            ['# - name: Nama lengkap ustadz/ustadzah'],
            ['# - email: Email unik untuk login'],
            ['# '],
            ['# KOLOM OPSIONAL:'],
            ['# - phone: Nomor telepon'],
            ['# - nip: Nomor Induk Pegawai (kosongkan untuk generate otomatis)'],
            ['# - class_names: Nama kelas yang diampu (pisahkan dengan koma)'],
            ['# '],
            ['# CATATAN:'],
            ['# 1. Kelas akan dibuat otomatis jika belum ada'],
            ['# 2. Password default: Password!123'],
            ['# 3. Maksimal ukuran file: 5MB'],
            ['# '],
            ['name', 'email', 'phone', 'nip', 'class_names'],
            ['Ustadz Ahmad Dahlan', 'ustadz.ahmad@example.com', '081234567890', '20251026001', 'Kelas 1A,Kelas 1B'],
            ['Ustadzah Siti Khadijah', 'ustadzah.siti@example.com', '081234567891', '20251026002', 'Kelas 1A,Kelas 3A'],
        ];
    }

    /**
     * Get admin template data
     */
    private function getAdminTemplate(): array
    {
        return [
            ['name', 'email'],
            ['Admin Utama', 'admin.utama@example.com'],
            ['Admin Akademik', 'admin.akademik@example.com'],
            ['Admin Keuangan', 'admin.keuangan@example.com'],
        ];
    }

    /**
     * Get admin template with documentation
     */
    private function getAdminTemplateWithDocs(): array
    {
        return [
            ['# TEMPLATE IMPORT ADMIN - HAFALAN APP'],
            ['# ===================================='],
            ['# '],
            ['# KOLOM WAJIB:'],
            ['# - name: Nama lengkap admin'],
            ['# - email: Email unik untuk login'],
            ['# '],
            ['# CATATAN:'],
            ['# 1. Email harus unik'],
            ['# 2. Password default: Password!123'],
            ['# 3. Admin memiliki akses penuh ke sistem'],
            ['# '],
            ['name', 'email'],
            ['Admin Utama', 'admin.utama@example.com'],
            ['Admin Akademik', 'admin.akademik@example.com'],
        ];
    }
}
```

### **2. Add Routes**

**File:** `routes/web.php`

```php
Route::middleware(['auth', 'verified', 'force.password.change'])->group(function () {
    // ... existing routes ...

    // CSV Template Downloads
    Route::get('templates/students', [TemplateController::class, 'students'])
        ->name('templates.students');
    Route::get('templates/guardians', [TemplateController::class, 'guardians'])
        ->name('templates.guardians');
    Route::get('templates/teachers', [TemplateController::class, 'teachers'])
        ->name('templates.teachers');
    Route::get('templates/admins', [TemplateController::class, 'admins'])
        ->name('templates.admins');
});
```

### **3. Update Import Classes to Skip Comment Lines**

**File:** `app/Imports/StudentImport.php`

```php
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class StudentImport implements 
    ToModel, 
    WithHeadingRow, 
    WithValidation, 
    SkipsOnFailure, 
    SkipsEmptyRows,
    WithStartRow  // Add this
{
    use SkipsFailures;

    // Skip comment lines and get starting row
    public function startRow(): int
    {
        return 1; // Will be overridden by WithHeadingRow
    }

    // Override prepareForValidation to skip comments
    public function prepareForValidation(array $data, $index)
    {
        // Skip rows that start with # (comments)
        if (isset($data['name']) && str_starts_with($data['name'], '#')) {
            return null; // Skip this row
        }

        // ... existing validation logic ...
        
        return $data;
    }

    // ... rest of the import class
}
```

---

## 🎨 PART 3: FRONTEND IMPLEMENTATION

### **1. Update Upload CSV Modal**

**File:** `resources/js/components/upload-csv-modal.tsx`

```tsx
import * as React from 'react';
import { useForm } from '@inertiajs/react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Info, Upload } from 'lucide-react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

type UploadCsvModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    title: string;
    action: string;
    templateUrl?: string; // URL to download template
    description?: React.ReactNode;
    maxSize?: number; // in KB
};

export default function UploadCsvModal({
    open,
    onOpenChange,
    title,
    action,
    templateUrl,
    description,
    maxSize = 5120, // 5MB default
}: UploadCsvModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.file) {
            return;
        }

        post(action, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            setData('file', file);
        }
    };

    const downloadTemplate = (withDocs: boolean = false) => {
        if (!templateUrl) return;

        const url = withDocs 
            ? `${templateUrl}?docs=1` 
            : templateUrl;
        
        window.location.href = url;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Template Download Section */}
                        {templateUrl && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription className="space-y-3">
                                    <p className="text-sm">
                                        Belum punya template? Download terlebih dahulu:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate(false)}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Template Sederhana
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate(true)}
                                            className="gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Template + Dokumentasi
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <Label htmlFor="file">File CSV atau XLSX</Label>
                            <div
                                className={cn(
                                    'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                                    dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                                    errors.file && 'border-destructive',
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />

                                {data.file ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-sm font-medium">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <span>{data.file.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(data.file.size)}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setData('file', null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            Ganti File
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-center">
                                            <Upload className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Drag & drop file di sini
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                atau
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Pilih File
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            Format: CSV atau XLSX (Maks. {maxSize / 1024}MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                            <InputError message={errors.file} />
                        </div>

                        {/* Instructions */}
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                <ul className="ml-4 mt-1 list-disc space-y-1">
                                    <li>Pastikan file sesuai dengan format template</li>
                                    <li>Email harus unik dan belum terdaftar</li>
                                    <li>Baris yang diawali # akan diabaikan</li>
                                    <li>Import akan diproses di background (tidak perlu menunggu)</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
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
                        <Button type="submit" disabled={processing || !data.file}>
                            {processing ? 'Mengupload...' : 'Upload & Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

### **2. Update Index Pages to Use New Upload Modal**

**File:** `resources/js/pages/students/index.tsx`

```tsx
<UploadCsvModal
    open={uploadOpen}
    onOpenChange={setUploadOpen}
    title="Upload Santri"
    action="/students/import"
    templateUrl="/templates/students"
    description={
        <>
            Upload file CSV atau XLSX dengan data santri. Anda bisa
            sekaligus menghubungkan dengan wali yang ada atau membuat wali
            baru otomatis.
        </>
    }
/>
```

**File:** `resources/js/pages/guardians/index.tsx`

```tsx
<UploadCsvModal
    open={uploadOpen}
    onOpenChange={setUploadOpen}
    title="Upload Wali"
    action="/guardians/import"
    templateUrl="/templates/guardians"
    description={
        <>
            Upload file CSV atau XLSX dengan data wali. Anda bisa langsung
            menghubungkan dengan santri yang sudah terdaftar.
        </>
    }
/>
```

**File:** `resources/js/pages/teachers/index.tsx`

```tsx
<UploadCsvModal
    open={uploadOpen}
    onOpenChange={setUploadOpen}
    title="Upload Guru"
    action="/teachers/import"
    templateUrl="/templates/teachers"
    description={
        <>
            Upload file CSV atau XLSX dengan data guru. Anda bisa langsung
            assign kelas yang diampu.
        </>
    }
/>
```

**File:** `resources/js/pages/admins/index.tsx`

```tsx
<UploadCsvModal
    open={uploadOpen}
    onOpenChange={setUploadOpen}
    title="Upload Admin"
    action="/admins/import"
    templateUrl="/templates/admins"
    description={
        <>
            Upload file CSV atau XLSX dengan data admin. Admin akan memiliki
            akses penuh ke sistem.
        </>
    }
/>
```

---

## 📝 PART 4: DOCUMENTATION PAGE

### **Create Help Page for Templates**

**File:** `resources/js/pages/help/csv-templates.tsx`

```tsx
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';

export default function CsvTemplatesHelp() {
    return (
        <AppLayout>
            <Head title="Panduan Template CSV" />

            <div className="container mx-auto max-w-4xl space-y-6 py-8">
                <div>
                    <h1 className="text-3xl font-bold">Panduan Template CSV</h1>
                    <p className="text-muted-foreground">
                        Panduan lengkap untuk menggunakan template CSV import
                    </p>
                </div>

                {/* Santri */}
                <Card>
                    <CardHeader>
                        <CardTitle>Template Santri</CardTitle>
                        <CardDescription>
                            Import data santri dengan/tanpa relasi ke wali
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/students">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/students?docs=1">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Template + Docs
                                </a>
                            </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <h4 className="font-semibold">Kolom yang tersedia:</h4>
                            <ul className="ml-6 list-disc space-y-1">
                                <li><strong>name*</strong>: Nama lengkap santri (wajib)</li>
                                <li><strong>email*</strong>: Email unik untuk login (wajib)</li>
                                <li><strong>class_name</strong>: Nama kelas (opsional)</li>
                                <li><strong>birth_date</strong>: Tanggal lahir format YYYY-MM-DD (opsional)</li>
                                <li><strong>phone</strong>: Nomor telepon (opsional)</li>
                                <li><strong>nis</strong>: Nomor Induk (kosongkan untuk auto-generate)</li>
                                <li><strong>guardian_emails</strong>: Email wali (comma-separated, opsional)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Wali */}
                <Card>
                    <CardHeader>
                        <CardTitle>Template Wali</CardTitle>
                        <CardDescription>
                            Import data wali dengan relasi ke santri
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/guardians">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/guardians?docs=1">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Template + Docs
                                </a>
                            </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <h4 className="font-semibold">Kolom yang tersedia:</h4>
                            <ul className="ml-6 list-disc space-y-1">
                                <li><strong>name*</strong>: Nama lengkap wali (wajib)</li>
                                <li><strong>email*</strong>: Email unik untuk login (wajib)</li>
                                <li><strong>phone</strong>: Nomor telepon (opsional)</li>
                                <li><strong>student_emails</strong>: Email santri yang diasuh (comma-separated)</li>
                                <li><strong>address</strong>: Alamat lengkap (opsional)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Guru */}
                <Card>
                    <CardHeader>
                        <CardTitle>Template Guru</CardTitle>
                        <CardDescription>
                            Import data guru dengan kelas yang diampu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/teachers">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/teachers?docs=1">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Template + Docs
                                </a>
                            </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <h4 className="font-semibold">Kolom yang tersedia:</h4>
                            <ul className="ml-6 list-disc space-y-1">
                                <li><strong>name*</strong>: Nama lengkap guru (wajib)</li>
                                <li><strong>email*</strong>: Email unik untuk login (wajib)</li>
                                <li><strong>phone</strong>: Nomor telepon (opsional)</li>
                                <li><strong>nip</strong>: Nomor Induk Pegawai (kosongkan untuk auto-generate)</li>
                                <li><strong>class_names</strong>: Nama kelas (comma-separated, opsional)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Admin */}
                <Card>
                    <CardHeader>
                        <CardTitle>Template Admin</CardTitle>
                        <CardDescription>
                            Import data admin (akses penuh sistem)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/admins">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a href="/templates/admins?docs=1">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Template + Docs
                                </a>
                            </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <h4 className="font-semibold">Kolom yang tersedia:</h4>
                            <ul className="ml-6 list-disc space-y-1">
                                <li><strong>name*</strong>: Nama lengkap admin (wajib)</li>
                                <li><strong>email*</strong>: Email unik untuk login (wajib)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
```

**Add Route:**
```php
Route::get('/help/csv-templates', function () {
    return Inertia::render('help/csv-templates');
})->name('help.csv-templates');
```

---

## ✅ CHECKLIST IMPLEMENTATION

- [ ] Create `TemplateController` with all template methods
- [ ] Add template download routes
- [ ] Update Import classes to skip comment lines
- [ ] Update `UploadCsvModal` component with template download buttons
- [ ] Update all index pages to use new `UploadCsvModal`
- [ ] Create help page for CSV templates documentation
- [ ] Test all template downloads (simple & with docs)
- [ ] Test drag & drop file upload
- [ ] Test comment lines are skipped during import
- [ ] Test UTF-8 characters (BOM for Excel)

---

**Dibuat oleh:** Droid AI Assistant  
**Untuk:** @muhrobby  
**Proyek:** Hafalan App - CSV Template System  
**Status:** 🟢 READY TO IMPLEMENT
