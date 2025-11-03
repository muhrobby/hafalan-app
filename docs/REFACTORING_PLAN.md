# 📋 PLAN REFACTORING: MANAJEMEN PENGGUNA SANTRI, WALI & USTADZ

**Tanggal:** 26 Oktober 2025  
**Tujuan:** Memperbaiki fitur manajemen pengguna agar bisa mengelola relasi antar entitas (santri-wali, ustadz-kelas) baik saat input manual maupun upload CSV

---

## 🎯 MASALAH YANG HARUS DIPERBAIKI

### 1. **Manajemen Santri**
- ❌ Saat tambah/edit santri, tidak bisa langsung menambah/memilih wali
- ❌ Saat upload CSV santri, tidak bisa sekalian menghubungkan dengan wali
- ❌ Tidak ada tombol Reset Password di halaman manajemen santri

### 2. **Manajemen Wali**
- ❌ Saat tambah/edit wali, tidak bisa langsung menghubungkan dengan santri yang menjadi anak asuhnya
- ❌ Saat upload CSV wali, tidak bisa sekalian menghubungkan dengan santri
- ❌ Tidak ada tombol Reset Password di halaman manajemen wali

### 3. **Manajemen Ustadz/Guru**
- ❌ Saat tambah/edit ustadz, tidak bisa langsung assign kelas yang diampu
- ❌ Saat upload CSV ustadz, tidak bisa sekalian menambah/assign kelas
- ❌ Tidak ada tombol Reset Password di halaman manajemen ustadz

### 4. **Reset Password**
- ❌ Fitur reset password hanya ada di halaman `/users` yang sekarang sudah dihapus dari menu
- ❌ Tidak ada tombol reset password di halaman Admin, Guru, Santri, dan Wali

---

## 🏗️ SOLUSI ARSITEKTUR

### **Relasi Database yang Sudah Ada:**

```
students ←→ guardians (many-to-many via guardian_student)
students → classes (many-to-one)
classes → teachers (many-to-one)
```

### **Perlu Ditambahkan:**
- Teacher dapat mengajar di **banyak kelas** (one-to-many atau many-to-many)
- Form input manual dan CSV import harus support mengelola relasi ini

---

## 📦 LANGKAH-LANGKAH REFACTORING

### **FASE 1: BACKEND - DATABASE & MODELS**

#### 1.1. Update Relasi Teacher-Class
**File:** `database/migrations/YYYY_MM_DD_update_teacher_class_relation.php`

**Aksi:**
```php
// Opsi 1: One-to-Many (satu guru bisa ngajar banyak kelas)
// Sudah OK dengan struktur sekarang (classes.teacher_id)

// Opsi 2: Many-to-Many (lebih fleksibel)
// Buat tabel pivot baru: class_teacher
Schema::create('class_teacher', function (Blueprint $table) {
    $table->id();
    $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
    $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
    $table->timestamps();
    $table->unique(['teacher_id', 'class_id']);
});
```

**Model Updates:**
```php
// App\Models\Teacher
public function classes(): BelongsToMany
{
    return $this->belongsToMany(Classe::class, 'class_teacher')->withTimestamps();
}

// App\Models\Classe
public function teachers(): BelongsToMany
{
    return $this->belongsToMany(Teacher::class, 'class_teacher')->withTimestamps();
}
```

---

### **FASE 2: BACKEND - CONTROLLERS**

#### 2.1. Update `StudentsController`

**File:** `app/Http/Controllers/StudentsController.php`

**Method `index()` - Tambah data guardians untuk dropdown:**
```php
public function index(Request $request)
{
    // ... existing code ...
    
    return Inertia::render('students/index', [
        'students'  => $students,
        'filters'   => $request->only('search'),
        'canManage' => $request->user()?->can('manage-users') ?? false,
        'availableGuardians' => Guardian::with('user:id,name,email')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'name' => $g->user->name,
                'email' => $g->user->email,
            ]),
    ]);
}
```

**Method `store()` & `update()` - Handle guardian_ids:**
```php
private function upsertStudent(array $data, ?Student $student = null): Student
{
    // ... existing user & student creation code ...
    
    // Sinkronisasi relasi dengan wali
    if (isset($data['guardian_ids']) && is_array($data['guardian_ids'])) {
        $studentModel->guardians()->sync($data['guardian_ids']);
    }
    
    return $studentModel;
}
```

**Update validation rules:**
```php
// StoreStudentRequest & UpdateStudentRequest
public function rules(): array
{
    return [
        'name'         => ['required', 'string', 'max:100'],
        'email'        => ['required', 'email', 'max:150'],
        'class_name'   => ['nullable', 'string', 'max:100'],
        'birth_date'   => ['nullable', 'date'],
        'nis'          => ['nullable', 'string', 'max:50'],
        'phone'        => ['nullable', 'string', 'max:30'],
        'guardian_ids' => ['nullable', 'array'],
        'guardian_ids.*' => ['exists:guardians,id'],
    ];
}
```

#### 2.2. Update `GuardianController`

**File:** `app/Http/Controllers/GuardianController.php`

**Method `index()` - Tambah data students untuk dropdown:**
```php
public function index(Request $request)
{
    // ... existing code ...
    
    return Inertia::render('guardians/index', [
        'guardians' => $guardians,
        'filters'   => $request->only('search'),
        'canManage' => $request->user()?->can('manage-users') ?? false,
        'availableStudents' => Student::with('user:id,name,email')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
                'email' => $s->user->email,
                'nis' => $s->nis,
            ]),
    ]);
}
```

**Method `store()` & `update()` - Handle student_ids:**
```php
private function upsertGuardian(array $data, ?Guardian $guardian = null): Guardian
{
    // ... existing user & guardian creation code ...
    
    // Sinkronisasi relasi dengan santri
    if (isset($data['student_ids']) && is_array($data['student_ids'])) {
        $guardianModel->students()->sync($data['student_ids']);
    }
    
    return $guardianModel;
}
```

**Update validation rules:**
```php
// StoreGuardianRequest & UpdateGuardianRequest
public function rules(): array
{
    return [
        'name'  => ['required', 'string', 'max:100'],
        'email' => ['required', 'email', 'max:150'],
        'phone' => ['nullable', 'string', 'max:30'],
        'student_ids' => ['nullable', 'array'],
        'student_ids.*' => ['exists:students,id'],
    ];
}
```

#### 2.3. Update `TeachersController`

**File:** `app/Http/Controllers/TeachersController.php`

**Method `index()` - Tambah data classes untuk dropdown:**
```php
public function index(Request $request)
{
    // ... existing code ...
    
    return Inertia::render('teachers/index', [
        'teachers'  => $teachers,
        'filters'   => $request->only('search'),
        'canManage' => $request->user()?->can('manage-users') ?? false,
        'availableClasses' => Classe::select('id', 'name')
            ->orderBy('name')
            ->get(),
    ]);
}
```

**Method `store()` & `update()` - Handle class_ids:**
```php
private function upsertTeacher(array $data, ?Teacher $teacher = null): Teacher
{
    // ... existing user & teacher creation code ...
    
    // Sinkronisasi relasi dengan kelas
    if (isset($data['class_ids']) && is_array($data['class_ids'])) {
        $teacherModel->classes()->sync($data['class_ids']);
    }
    
    return $teacherModel;
}
```

**Update validation rules:**
```php
// StoreTeacherRequest & UpdateTeacherRequest
public function rules(): array
{
    return [
        'name'  => ['required', 'string', 'max:100'],
        'email' => ['required', 'email', 'max:150'],
        'nip'   => ['nullable', 'string', 'max:50'],
        'phone' => ['nullable', 'string', 'max:30'],
        'class_ids' => ['nullable', 'array'],
        'class_ids.*' => ['exists:classes,id'],
    ];
}
```

---

### **FASE 3: BACKEND - CSV IMPORTS**

#### 3.1. Update `StudentImport`

**File:** `app/Imports/StudentImport.php`

**Header CSV baru:**
```csv
name,email,class_name,birth_date,phone,guardian_emails
```

**Contoh data:**
```csv
Ahmad Fauzi,ahmad@example.com,Kelas 1,2012-03-14,081234567890,"wali1@example.com,wali2@example.com"
```

**Logic update:**
```php
public function model(array $row)
{
    // ... existing student creation code ...
    
    // Handle guardian_emails (comma-separated)
    if (!empty($row['guardian_emails'])) {
        $emails = array_map('trim', explode(',', $row['guardian_emails']));
        $guardianIds = [];
        
        foreach ($emails as $email) {
            // Cari atau buat guardian baru
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => explode('@', $email)[0], // Default name dari email
                    'password' => Hash::make('Password!123'),
                    'email_verified_at' => now(),
                ]
            );
            
            if (!$user->hasRole('guardian')) {
                $user->assignRole('guardian');
            }
            
            $guardian = Guardian::firstOrCreate(['user_id' => $user->id]);
            $guardianIds[] = $guardian->id;
        }
        
        // Sync guardians
        $student->guardians()->sync($guardianIds);
    }
    
    return $student;
}

public function rules(): array
{
    return [
        'name'            => ['required', 'string', 'max:100'],
        'email'           => ['required', 'email', 'max:150'],
        'nis'             => ['nullable', 'string', 'max:50'],
        'class_name'      => ['nullable', 'string', 'max:100'],
        'birth_date'      => ['nullable', 'date'],
        'phone'           => ['nullable', 'string', 'max:30'],
        'guardian_emails' => ['nullable', 'string'], // Comma-separated emails
    ];
}
```

#### 3.2. Update `GuardianImport`

**File:** `app/Imports/GuardianImport.php`

**Header CSV baru:**
```csv
name,email,phone,student_emails
```

**Contoh data:**
```csv
Bapak Ahmad,wali1@example.com,081234567890,"ahmad@example.com,aisyah@example.com"
```

**Logic update:**
```php
public function model(array $row)
{
    // ... existing guardian creation code ...
    
    // Handle student_emails (comma-separated)
    if (!empty($row['student_emails'])) {
        $emails = array_map('trim', explode(',', $row['student_emails']));
        $studentIds = [];
        
        foreach ($emails as $email) {
            // Cari student berdasarkan email
            $user = User::where('email', $email)->first();
            if ($user && $user->student) {
                $studentIds[] = $user->student->id;
            }
        }
        
        // Sync students
        if (!empty($studentIds)) {
            $guardian->students()->sync($studentIds);
        }
    }
    
    return $guardian;
}

public function rules(): array
{
    return [
        'name'           => ['required', 'string', 'max:100'],
        'email'          => ['required', 'email', 'max:150'],
        'phone'          => ['nullable', 'string', 'max:30'],
        'student_emails' => ['nullable', 'string'], // Comma-separated emails
    ];
}
```

#### 3.3. Update `TeacherImport`

**File:** `app/Imports/TeacherImport.php`

**Header CSV baru:**
```csv
name,email,phone,class_names
```

**Contoh data:**
```csv
Ustadz Ahmad,ustadz@example.com,081234567890,"Kelas 1,Kelas 2,Kelas 3"
```

**Logic update:**
```php
public function model(array $row)
{
    // ... existing teacher creation code ...
    
    // Handle class_names (comma-separated)
    if (!empty($row['class_names'])) {
        $classNames = array_map('trim', explode(',', $row['class_names']));
        $classIds = [];
        
        foreach ($classNames as $className) {
            // Buat kelas baru jika belum ada
            $class = Classe::firstOrCreate(['name' => $className]);
            $classIds[] = $class->id;
        }
        
        // Sync classes
        $teacher->classes()->sync($classIds);
    }
    
    return $teacher;
}

public function rules(): array
{
    return [
        'name'        => ['required', 'string', 'max:100'],
        'email'       => ['required', 'email', 'max:150'],
        'nip'         => ['nullable', 'string', 'max:50'],
        'phone'       => ['nullable', 'string', 'max:30'],
        'class_names' => ['nullable', 'string'], // Comma-separated class names
    ];
}
```

---

### **FASE 4: FRONTEND - FORM MODALS**

#### 4.1. Buat Komponen Multi-Select

**File:** `resources/js/components/ui/multi-select.tsx`

```tsx
import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type MultiSelectOption = {
    value: string | number;
    label: string;
};

type MultiSelectProps = {
    options: MultiSelectOption[];
    selected: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    placeholder?: string;
    emptyText?: string;
};

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Pilih...',
    emptyText = 'Tidak ada data',
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: string | number) => {
        const newSelected = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleRemove = (value: string | number) => {
        onChange(selected.filter((v) => v !== value));
    };

    const selectedLabels = options
        .filter((opt) => selected.includes(opt.value))
        .map((opt) => opt.label);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedLabels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {selectedLabels.map((label, index) => (
                                <Badge key={index} variant="secondary" className="mr-1">
                                    {label}
                                    <button
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleRemove(selected[index]);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove(selected[index]);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Cari..." />
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                onSelect={() => handleSelect(option.value)}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        selected.includes(option.value)
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
```

#### 4.2. Update `StudentFormModal`

**File:** `resources/js/pages/students/student-form-modal.tsx`

**Tambahkan:**
```tsx
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';

export type StudentPayload = {
    id?: number;
    name: string;
    email: string;
    class_name?: string | null;
    birth_date?: string | null;
    nis?: string | null;
    phone?: string | null;
    guardian_ids?: number[]; // TAMBAH INI
};

type StudentFormModalProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    student?: StudentPayload | null;
    title: string;
    availableGuardians?: MultiSelectOption[]; // TAMBAH INI
};

export function StudentFormModal({
    open,
    onOpenChange,
    student,
    title,
    availableGuardians = [], // TAMBAH INI
}: StudentFormModalProps) {
    // ... existing code ...
    
    const { data, setData, post, put, processing, errors, reset } =
        useForm<StudentPayload>({
            // ... existing fields ...
            guardian_ids: student?.guardian_ids ?? [], // TAMBAH INI
        });

    // Di dalam form, tambahkan setelah field phone:
    return (
        // ... existing code ...
        <div className="grid gap-2">
            <Label htmlFor="student-guardians">
                Wali Santri{' '}
                <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <MultiSelect
                options={availableGuardians}
                selected={data.guardian_ids ?? []}
                onChange={(values) => setData('guardian_ids', values as number[])}
                placeholder="Pilih wali..."
                emptyText="Belum ada data wali"
            />
            <InputError message={(errors as any).guardian_ids} />
        </div>
        // ... rest of form ...
    );
}
```

#### 4.3. Update `GuardianFormModal`

**File:** `resources/js/pages/guardians/guardian-form-modal.tsx`

**Tambahkan:**
```tsx
export type GuardianPayload = {
    id?: number;
    name: string;
    email: string;
    phone?: string | null;
    student_ids?: number[]; // TAMBAH INI
};

type GuardianFormModalProps = {
    // ... existing props ...
    availableStudents?: MultiSelectOption[]; // TAMBAH INI
};

// Di dalam form, tambahkan field multi-select untuk students
<div className="grid gap-2">
    <Label htmlFor="guardian-students">
        Santri yang Diasuh{' '}
        <span className="text-muted-foreground">(opsional)</span>
    </Label>
    <MultiSelect
        options={availableStudents}
        selected={data.student_ids ?? []}
        onChange={(values) => setData('student_ids', values as number[])}
        placeholder="Pilih santri..."
        emptyText="Belum ada data santri"
    />
    <InputError message={(errors as any).student_ids} />
</div>
```

#### 4.4. Update `TeacherFormModal`

**File:** `resources/js/pages/teachers/teacher-form-modal.tsx`

**Tambahkan:**
```tsx
export type TeacherPayload = {
    id?: number;
    name: string;
    email: string;
    nip?: string | null;
    phone?: string | null;
    class_ids?: number[]; // TAMBAH INI
};

type TeacherFormModalProps = {
    // ... existing props ...
    availableClasses?: MultiSelectOption[]; // TAMBAH INI
};

// Di dalam form, tambahkan field multi-select untuk classes
<div className="grid gap-2">
    <Label htmlFor="teacher-classes">
        Kelas yang Diampu{' '}
        <span className="text-muted-foreground">(opsional)</span>
    </Label>
    <MultiSelect
        options={availableClasses}
        selected={data.class_ids ?? []}
        onChange={(values) => setData('class_ids', values as number[])}
        placeholder="Pilih kelas..."
        emptyText="Belum ada data kelas"
    />
    <InputError message={(errors as any).class_ids} />
</div>
```

---

### **FASE 5: FRONTEND - RESET PASSWORD BUTTONS**

#### 5.1. Update Columns untuk Students

**File:** `resources/js/pages/students/columns.tsx`

**Tambahkan action column:**
```tsx
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const buildStudentColumns = ({
    canManage,
    onEdit,
    onDelete,
}: {
    canManage: boolean;
    onEdit: (student: StudentRow) => void;
    onDelete: (student: StudentRow) => void;
}) => {
    const columns: ColumnDef<StudentRow>[] = [
        // ... existing columns ...
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const student = row.original;

                if (!canManage) {
                    return null;
                }

                const handleResetPassword = () => {
                    const confirmed = window.confirm(
                        `Atur password sementara untuk ${student.name}?`,
                    );

                    if (!confirmed) return;

                    router.post(
                        '/admin/password/temp',
                        {
                            user_id: student.user_id, // Pastikan user_id di-return dari backend
                        },
                        {
                            preserveScroll: true,
                        },
                    );
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                Aksi
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(student)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleResetPassword}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(student)}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return columns;
};
```

#### 5.2. Ulangi untuk Guardians, Teachers, dan Admins

Copy pattern yang sama ke:
- `resources/js/pages/guardians/columns.tsx`
- `resources/js/pages/teachers/columns.tsx`
- `resources/js/pages/admins/columns.tsx`

**CATATAN PENTING:** Pastikan backend mengembalikan `user_id` di setiap response agar bisa digunakan untuk reset password.

---

### **FASE 6: UPDATE INDEX PAGES**

#### 6.1. Update `students/index.tsx`

```tsx
export default function StudentsIndex({
    students,
    canManage,
    availableGuardians, // TAMBAH INI
}: StudentsPageProps) {
    // ... existing code ...
    
    <StudentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        student={selectedStudent}
        title={selectedStudent ? 'Edit Santri' : 'Tambah Santri'}
        availableGuardians={availableGuardians} // PASS PROP INI
    />
}
```

#### 6.2. Update `guardians/index.tsx`

```tsx
export default function GuardiansIndex({
    guardians,
    canManage,
    availableStudents, // TAMBAH INI
}: GuardiansPageProps) {
    // ... existing code ...
    
    <GuardianFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        guardian={selectedGuardian}
        title={selectedGuardian ? 'Edit Wali' : 'Tambah Wali'}
        availableStudents={availableStudents} // PASS PROP INI
    />
}
```

#### 6.3. Update `teachers/index.tsx`

```tsx
export default function TeachersIndex({
    teachers,
    canManage,
    availableClasses, // TAMBAH INI
}: TeachersPageProps) {
    // ... existing code ...
    
    <TeacherFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        teacher={selectedTeacher}
        title={selectedTeacher ? 'Edit Guru' : 'Tambah Guru'}
        availableClasses={availableClasses} // PASS PROP INI
    />
}
```

---

### **FASE 7: UPDATE CSV TEMPLATES**

#### 7.1. Update `StudentsController::template()`

```php
public function template(): StreamedResponse
{
    // ... existing code ...
    
    return response()->streamDownload(function () {
        $handle = fopen('php://output', 'w');
        fputcsv($handle, [
            'name',
            'email',
            'class_name',
            'birth_date',
            'phone',
            'guardian_emails' // TAMBAH INI
        ]);
        fputcsv($handle, [
            'Ahmad Fauzi',
            'ahmad@example.com',
            'Kelas 1',
            '2012-03-14',
            '081234567890',
            'wali1@example.com,wali2@example.com' // Contoh multiple emails
        ]);
        fclose($handle);
    }, 'template-santri.csv', $headers);
}
```

#### 7.2. Update `GuardianController::template()` (Buat baru)

```php
public function template(): StreamedResponse
{
    $this->authorize('create', Guardian::class);

    $headers = [
        'Content-Type' => 'text/csv',
        'Cache-Control' => 'no-store, no-cache',
        'Pragma' => 'no-cache',
    ];

    return response()->streamDownload(function () {
        $handle = fopen('php://output', 'w');
        fputcsv($handle, [
            'name',
            'email',
            'phone',
            'student_emails' // TAMBAH INI
        ]);
        fputcsv($handle, [
            'Bapak Ahmad',
            'wali1@example.com',
            '081234567890',
            'ahmad@example.com,aisyah@example.com'
        ]);
        fclose($handle);
    }, 'template-wali.csv', $headers);
}
```

#### 7.3. Update `TeachersController::template()`

```php
public function template(): StreamedResponse
{
    // ... existing code ...
    
    return response()->streamDownload(function () {
        $handle = fopen('php://output', 'w');
        fputcsv($handle, [
            'name',
            'email',
            'phone',
            'class_names' // TAMBAH INI
        ]);
        fputcsv($handle, [
            'Ustadz Ahmad',
            'ustadz.ahmad@example.com',
            '08123456789',
            'Kelas 1,Kelas 2,Kelas 3'
        ]);
        fclose($handle);
    }, 'template-guru.csv', $headers);
}
```

**Tambah route untuk template guardian:**
```php
Route::get('guardians/template', [GuardianController::class, 'template'])
    ->name('guardians.template');
```

---

### **FASE 8: UPDATE BACKEND RETURNS**

Pastikan semua controller index mengembalikan `user_id` untuk reset password:

```php
// StudentsController::index()
->through(fn (Student $student) => [
    'id'         => $student->id,
    'user_id'    => $student->user_id, // TAMBAH INI
    'name'       => $student->user->name,
    'email'      => $student->user->email,
    // ... rest
]);

// GuardianController::index()
->through(fn (Guardian $guardian) => [
    'id'     => $guardian->id,
    'user_id' => $guardian->user_id, // TAMBAH INI
    'name'   => $guardian->user->name,
    // ... rest
]);

// TeachersController::index()
->through(fn (Teacher $teacher) => [
    'id'    => $teacher->id,
    'user_id' => $teacher->user_id, // TAMBAH INI
    'name'  => $teacher->user->name,
    // ... rest
]);
```

---

## 📊 RINGKASAN PERUBAHAN FILE

### **Backend Files (PHP)**
```
✏️  database/migrations/YYYY_MM_DD_create_class_teacher_table.php (BARU)
✏️  app/Models/Teacher.php
✏️  app/Models/Classe.php
✏️  app/Http/Controllers/StudentsController.php
✏️  app/Http/Controllers/GuardianController.php
✏️  app/Http/Controllers/TeachersController.php
✏️  app/Http/Requests/StoreStudentRequest.php
✏️  app/Http/Requests/UpdateStudentRequest.php
✏️  app/Http/Requests/StoreGuardianRequest.php
✏️  app/Http/Requests/UpdateGuardianRequest.php
✏️  app/Http/Requests/StoreTeacherRequest.php
✏️  app/Http/Requests/UpdateTeacherRequest.php
✏️  app/Imports/StudentImport.php
✏️  app/Imports/GuardianImport.php
✏️  app/Imports/TeacherImport.php
✏️  routes/web.php (tambah route guardians.template)
```

### **Frontend Files (TSX)**
```
✏️  resources/js/components/ui/multi-select.tsx (BARU)
✏️  resources/js/components/ui/command.tsx (perlu dibuat jika belum ada)
✏️  resources/js/pages/students/student-form-modal.tsx
✏️  resources/js/pages/students/columns.tsx
✏️  resources/js/pages/students/index.tsx
✏️  resources/js/pages/guardians/guardian-form-modal.tsx
✏️  resources/js/pages/guardians/columns.tsx
✏️  resources/js/pages/guardians/index.tsx
✏️  resources/js/pages/teachers/teacher-form-modal.tsx
✏️  resources/js/pages/teachers/columns.tsx
✏️  resources/js/pages/teachers/index.tsx
✏️  resources/js/pages/admins/columns.tsx
```

---

## ✅ CHECKLIST TESTING

Setelah refactoring, test semua fitur berikut:

### **Manajemen Santri**
- [ ] Tambah santri manual tanpa wali → Berhasil
- [ ] Tambah santri manual dengan 1 wali → Relasi tersimpan
- [ ] Tambah santri manual dengan multiple wali → Relasi tersimpan
- [ ] Edit santri, tambah wali baru → Update relasi berhasil
- [ ] Edit santri, hapus wali → Relasi terhapus
- [ ] Upload CSV santri tanpa guardian_emails → Import berhasil
- [ ] Upload CSV santri dengan guardian_emails → Wali ter-create dan ter-link
- [ ] Reset password santri → Password temporary ter-set dan notifikasi muncul
- [ ] Hapus santri → Data dan relasi terhapus

### **Manajemen Wali**
- [ ] Tambah wali manual tanpa santri → Berhasil
- [ ] Tambah wali manual dengan santri → Relasi tersimpan
- [ ] Edit wali, update santri yang diasuh → Relasi ter-update
- [ ] Upload CSV wali tanpa student_emails → Import berhasil
- [ ] Upload CSV wali dengan student_emails → Relasi ter-link (santri harus sudah ada)
- [ ] Reset password wali → Password temporary ter-set
- [ ] Hapus wali → Data dan relasi terhapus

### **Manajemen Ustadz**
- [ ] Tambah ustadz manual tanpa kelas → Berhasil
- [ ] Tambah ustadz manual dengan kelas → Relasi tersimpan
- [ ] Edit ustadz, update kelas yang diampu → Relasi ter-update
- [ ] Upload CSV ustadz tanpa class_names → Import berhasil
- [ ] Upload CSV ustadz dengan class_names → Kelas ter-create dan ter-link
- [ ] Reset password ustadz → Password temporary ter-set
- [ ] Hapus ustadz → Data terhapus, relasi classes tidak terhapus

### **Manajemen Admin**
- [ ] Reset password admin → Password temporary ter-set
- [ ] Admin tidak bisa reset password diri sendiri → Error muncul

---

## 🚀 URUTAN PENGERJAAN YANG DISARANKAN

1. **Mulai dari Backend Database:**
   - Buat migration class_teacher (jika pilih many-to-many)
   - Update models Teacher & Classe
   - Run migration: `php artisan migrate`

2. **Update Backend Controllers & Validation:**
   - Update StudentsController, GuardianController, TeachersController
   - Update Request validation classes
   - Test manual via Postman/Thunder Client

3. **Update CSV Imports:**
   - Update StudentImport, GuardianImport, TeacherImport
   - Test import dengan CSV sample

4. **Update Frontend Components:**
   - Buat MultiSelect component
   - Update form modals (student, guardian, teacher)
   - Update index pages untuk pass available data

5. **Add Reset Password Buttons:**
   - Update columns untuk semua user management pages
   - Tambahkan user_id di backend returns
   - Test reset password flow

6. **Update CSV Templates:**
   - Update template methods di controllers
   - Update UploadCsvModal description
   - Test download template dan import

7. **Testing Menyeluruh:**
   - Test semua scenario di checklist
   - Fix bugs yang ditemukan
   - Update documentation jika perlu

---

## 📝 CATATAN PENTING

1. **Relasi Many-to-Many:**
   - Gunakan `sync()` untuk update relasi (otomatis hapus yang lama)
   - Gunakan `attach()` untuk tambah tanpa hapus yang lama
   - Gunakan `detach()` untuk hapus relasi

2. **CSV Import:**
   - Validate email format sebelum create/link
   - Handle duplicate emails dengan graceful
   - Logging import results untuk debugging

3. **Reset Password:**
   - Pastikan user_id tersedia di frontend
   - Tampilkan temporary password di modal/toast
   - Force user untuk ganti password saat login pertama

4. **Permission & Authorization:**
   - Pastikan semua action di-protect dengan Gates/Policies
   - Test dengan role berbeda (admin, teacher)

5. **Performance:**
   - Use eager loading (`with()`) untuk relasi
   - Index database untuk kolom yang sering di-query
   - Batch insert untuk CSV import jika data banyak

---

## 🎉 HASIL AKHIR YANG DIHARAPKAN

Setelah refactoring selesai:

✅ **Admin** bisa tambah santri dan langsung pilih walinya (atau buat wali baru)  
✅ **Admin** bisa tambah wali dan langsung link dengan santri yang sudah ada  
✅ **Admin** bisa tambah ustadz dan langsung assign kelas (atau buat kelas baru)  
✅ **Admin** bisa upload CSV dengan relasi langsung ter-create  
✅ **Admin** bisa reset password dari halaman mana saja (tidak perlu ke /users)  
✅ **Teacher** bisa manage santri dengan fitur yang sama  
✅ **CSV Import** lebih powerful dan user-friendly  
✅ **UX lebih baik** dengan multi-select dropdown dan action menu  

---

**Dibuat oleh:** Droid AI Assistant  
**Untuk:** @muhrobby  
**Proyek:** Hafalan App - Laravel + React  
**Status:** 🟡 READY TO IMPLEMENT
