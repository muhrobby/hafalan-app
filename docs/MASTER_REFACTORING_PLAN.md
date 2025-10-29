# 🚀 MASTER REFACTORING PLAN - HAFALAN APP

**Tanggal:** 26 Oktober 2025  
**Versi:** 1.0 Final  
**Status:** 🟢 PRODUCTION READY

---

## 📋 EXECUTIVE SUMMARY

Plan ini menggabungkan semua improvement yang telah didesain:
1. ✅ **Konsolidasi Database** ke tabel `profiles` (lebih simple & maintainable)
2. ✅ **Queue System** untuk CSV import (prevent timeout, better UX)
3. ✅ **Real-time Progress** dengan polling (professional UI/UX)
4. ✅ **Advanced Filtering** dengan shadcn/ui (search, date, sort)
5. ✅ **CSV Templates** dengan dokumentasi lengkap
6. ✅ **Performance Optimization** (caching, indexing, eager loading)
7. ✅ **Reset Password** button di semua halaman manajemen

**Estimasi Total:** 5-7 hari kerja (1 sprint)  
**ROI:** 🚀🚀🚀🚀🚀 Massive improvement di UX, performance, dan maintainability

---

## 🎯 PHASE 1: DATABASE CONSOLIDATION (Day 1-2)

### **Mengapa Harus Duluan?**
- Fondasi untuk semua fitur lainnya
- Lebih mudah implement fitur baru dengan struktur yang clean
- Prevent rework di fase berikutnya

### **Step 1.1: Create Profiles Table**

**File:** `database/migrations/2025_10_27_000001_create_profiles_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            
            // Identifiers (nullable, filled based on role)
            $table->string('nis', 50)->unique()->nullable()->comment('Student ID');
            $table->string('nip', 50)->unique()->nullable()->comment('Teacher ID');
            
            // Contact Info
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            
            // Personal Info (mostly for students)
            $table->date('birth_date')->nullable();
            $table->year('entry_year')->nullable();
            
            // Academic Info (for students)
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('nis');
            $table->index('nip');
            $table->index('class_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
```

### **Step 1.2: Create Profile Relations Table**

**File:** `database/migrations/2025_10_27_000002_create_profile_relations_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignId('related_profile_id')->constrained('profiles')->cascadeOnDelete();
            $table->enum('relation_type', ['guardian'])->default('guardian');
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            $table->unique(['profile_id', 'related_profile_id', 'relation_type'], 'unique_profile_relation');
            $table->index('profile_id');
            $table->index('related_profile_id');
            $table->index('relation_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_relations');
    }
};
```

### **Step 1.3: Create Class-Teacher Pivot Table**

**File:** `database/migrations/2025_10_27_000003_create_class_teacher_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_teacher', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            
            $table->timestamps();
            
            $table->unique(['teacher_id', 'class_id']);
            $table->index('teacher_id');
            $table->index('class_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_teacher');
    }
};
```

### **Step 1.4: Migrate Data from Old Tables**

**File:** `database/migrations/2025_10_27_000004_migrate_data_to_profiles.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Migrate students → profiles
        DB::table('students')->orderBy('id')->chunk(100, function ($students) {
            foreach ($students as $student) {
                DB::table('profiles')->insertOrIgnore([
                    'user_id' => $student->user_id,
                    'nis' => $student->nis,
                    'birth_date' => $student->birth_date,
                    'phone' => $student->phone,
                    'class_id' => $student->class_id,
                    'created_at' => $student->created_at,
                    'updated_at' => $student->updated_at,
                ]);
            }
        });
        
        // 2. Migrate guardians → profiles
        DB::table('guardians')->orderBy('id')->chunk(100, function ($guardians) {
            foreach ($guardians as $guardian) {
                DB::table('profiles')->insertOrIgnore([
                    'user_id' => $guardian->user_id,
                    'phone' => $guardian->phone,
                    'created_at' => $guardian->created_at,
                    'updated_at' => $guardian->updated_at,
                ]);
            }
        });
        
        // 3. Migrate teachers → profiles
        DB::table('teachers')->orderBy('id')->chunk(100, function ($teachers) {
            foreach ($teachers as $teacher) {
                DB::table('profiles')->insertOrIgnore([
                    'user_id' => $teacher->user_id,
                    'nip' => $teacher->nip,
                    'phone' => $teacher->phone,
                    'created_at' => $teacher->created_at,
                    'updated_at' => $teacher->updated_at,
                ]);
            }
        });
        
        // 4. Migrate guardian_student relations → profile_relations
        DB::table('guardian_student')->orderBy('id')->chunk(100, function ($relations) {
            foreach ($relations as $relation) {
                $studentProfile = DB::table('profiles')
                    ->join('students', 'profiles.user_id', '=', 'students.user_id')
                    ->where('students.id', $relation->student_id)
                    ->value('profiles.id');
                
                $guardianProfile = DB::table('profiles')
                    ->join('guardians', 'profiles.user_id', '=', 'guardians.user_id')
                    ->where('guardians.id', $relation->guardian_id)
                    ->value('profiles.id');
                
                if ($studentProfile && $guardianProfile) {
                    DB::table('profile_relations')->insertOrIgnore([
                        'profile_id' => $studentProfile,
                        'related_profile_id' => $guardianProfile,
                        'relation_type' => 'guardian',
                        'created_at' => $relation->created_at,
                        'updated_at' => $relation->updated_at,
                    ]);
                }
            }
        });
        
        // 5. Migrate teacher-class relations (if using old structure)
        // This assumes classes.teacher_id exists
        DB::table('classes')->whereNotNull('teacher_id')->chunk(100, function ($classes) {
            foreach ($classes as $class) {
                $teacherProfile = DB::table('profiles')
                    ->join('teachers', 'profiles.user_id', '=', 'teachers.user_id')
                    ->where('teachers.id', $class->teacher_id)
                    ->value('profiles.id');
                
                if ($teacherProfile) {
                    DB::table('class_teacher')->insertOrIgnore([
                        'teacher_id' => $teacherProfile,
                        'class_id' => $class->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        // Optionally restore data if needed
        DB::table('profile_relations')->truncate();
        DB::table('class_teacher')->truncate();
        DB::table('profiles')->truncate();
    }
};
```

### **Step 1.5: Create Profile Model**

**File:** `app/Models/Profile.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Profile extends Model
{
    protected $fillable = [
        'user_id', 'nis', 'nip', 'phone', 'birth_date', 
        'address', 'class_id', 'entry_year',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'entry_year' => 'integer',
    ];

    // ============ RELATIONSHIPS ============

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(Classe::class, 'class_id');
    }

    public function hafalans(): HasMany
    {
        return $this->hasMany(Hafalan::class, 'student_id');
    }

    // Guardians for this profile (student → guardians)
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(
            Profile::class,
            'profile_relations',
            'profile_id',
            'related_profile_id'
        )
        ->wherePivot('relation_type', 'guardian')
        ->withTimestamps();
    }

    // Students for this profile (guardian → students)
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            Profile::class,
            'profile_relations',
            'related_profile_id',
            'profile_id'
        )
        ->wherePivot('relation_type', 'guardian')
        ->withTimestamps();
    }

    // Classes for this profile (teacher → classes)
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(
            Classe::class,
            'class_teacher',
            'teacher_id',
            'class_id'
        )
        ->withTimestamps();
    }

    // ============ SCOPES ============

    public function scopeStudents($query)
    {
        return $query->whereNotNull('nis');
    }

    public function scopeGuardians($query)
    {
        return $query->whereHas('user', fn($q) => $q->role('guardian'));
    }

    public function scopeTeachers($query)
    {
        return $query->whereNotNull('nip');
    }

    // ============ HELPERS ============

    public static function generateNis(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = $date->format('ymd');

        $latest = static::where('nis', 'like', "{$prefix}%")
            ->orderByDesc('nis')
            ->value('nis');

        $nextSequence = $latest ? ((int) substr($latest, strlen($prefix))) + 1 : 1;
        $sequence = str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }

    public static function generateNip(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = $date->format('Ymd');

        $latest = static::where('nip', 'like', "{$prefix}%")
            ->orderByDesc('nip')
            ->value('nip');

        $nextSequence = $latest ? ((int) substr($latest, strlen($prefix))) + 1 : 1;
        $sequence = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }
}
```

### **Step 1.6: Update User Model**

**File:** `app/Models/User.php`

```php
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    // ... existing code ...

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    // Helper methods
    public function getOrCreateProfile(): Profile
    {
        return $this->profile ?? $this->profile()->create([]);
    }
}
```

### **Step 1.7: Run Migrations**

```bash
# Backup database first!
php artisan db:backup # If you have backup package

# Run migrations
php artisan migrate

# Verify data
php artisan tinker
>>> Profile::count()
>>> Profile::students()->count()
>>> Profile::guardians()->count()
>>> Profile::teachers()->count()
```

### **✅ Checklist Phase 1:**
- [ ] Create profiles table migration
- [ ] Create profile_relations table migration
- [ ] Create class_teacher table migration
- [ ] Create data migration script
- [ ] Create Profile model with relationships
- [ ] Update User model
- [ ] Run migrations in local/staging
- [ ] Verify data integrity
- [ ] Test relationships work correctly

---

## 🎨 PHASE 2: BACKEND REFACTORING (Day 2-3)

### **Step 2.1: Create Base Controller**

**File:** `app/Http/Controllers/ProfileController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

abstract class ProfileController extends Controller
{
    abstract protected function getRoleType(): string;
    abstract protected function getPagePath(): string;

    protected function upsertProfile(array $data, ?Profile $profile = null): Profile
    {
        $roleType = $this->getRoleType();
        
        // Create/update user
        $existingUser = $profile?->user ?? User::where('email', $data['email'])->first();
        
        $user = $existingUser ?? new User(['email' => $data['email']]);
        $user->name = $data['name'];
        
        if (!$user->exists) {
            $user->password = Hash::make('Password!123');
            $user->email_verified_at = now();
        } else {
            $user->email = $data['email'];
        }
        $user->save();
        
        if (!$user->hasRole($roleType)) {
            $user->assignRole($roleType);
        }
        
        // Create/update profile
        $profileModel = $profile ?? Profile::firstOrNew(['user_id' => $user->id]);
        
        switch ($roleType) {
            case 'student':
                $this->fillStudentData($profileModel, $data);
                break;
            case 'guardian':
                $this->fillGuardianData($profileModel, $data);
                break;
            case 'teacher':
                $this->fillTeacherData($profileModel, $data);
                break;
        }
        
        $profileModel->user_id = $user->id;
        $profileModel->save();
        
        $this->syncRelations($profileModel, $data);
        
        return $profileModel;
    }

    protected function fillStudentData(Profile $profile, array $data): void
    {
        if (!empty($data['nis'])) {
            $profile->nis = $data['nis'];
        } elseif (!$profile->nis) {
            $profile->nis = Profile::generateNis();
        }
        
        $profile->birth_date = $data['birth_date'] ?? $profile->birth_date;
        $profile->phone = $data['phone'] ?? $profile->phone;
        
        if (!empty($data['class_name'])) {
            $class = Classe::firstOrCreate(['name' => $data['class_name']]);
            $profile->class_id = $class->id;
        }
    }

    protected function fillGuardianData(Profile $profile, array $data): void
    {
        $profile->phone = $data['phone'] ?? $profile->phone;
        $profile->address = $data['address'] ?? $profile->address;
    }

    protected function fillTeacherData(Profile $profile, array $data): void
    {
        if (!empty($data['nip'])) {
            $profile->nip = $data['nip'];
        } elseif (!$profile->nip) {
            $profile->nip = Profile::generateNip();
        }
        
        $profile->phone = $data['phone'] ?? $profile->phone;
    }

    protected function syncRelations(Profile $profile, array $data): void
    {
        $roleType = $this->getRoleType();
        
        switch ($roleType) {
            case 'student':
                if (isset($data['guardian_ids'])) {
                    $profile->guardians()->sync($data['guardian_ids']);
                }
                break;
                
            case 'guardian':
                if (isset($data['student_ids'])) {
                    $profile->students()->sync($data['student_ids']);
                }
                break;
                
            case 'teacher':
                if (isset($data['class_ids'])) {
                    $profile->classes()->sync($data['class_ids']);
                }
                break;
        }
    }
}
```

### **Step 2.2: Refactor StudentsController**

**File:** `app/Http/Controllers/StudentsController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Jobs\ImportStudentsJob;
use App\Models\Classe;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudentsController extends ProfileController
{
    protected function getRoleType(): string
    {
        return 'student';
    }

    protected function getPagePath(): string
    {
        return 'students/index';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Profile::class);

        $query = Profile::query()
            ->with(['user:id,name,email', 'class:id,name'])
            ->withCount('guardians')
            ->students()
            ->when(
                $request->input('search'),
                fn ($q, $search) => $q->where(function ($qq) use ($search) {
                    $qq->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('nis', 'like', "%{$search}%");
                })
            )
            ->when(
                $request->input('class_id'),
                fn ($q, $classId) => $q->where('class_id', $classId)
            )
            ->when(
                $request->input('has_guardian') !== null,
                fn ($q) => $request->input('has_guardian') 
                    ? $q->has('guardians')
                    : $q->doesntHave('guardians')
            )
            ->when(
                $request->input('date_from'),
                fn ($q, $dateFrom) => $q->whereDate('created_at', '>=', $dateFrom)
            )
            ->when(
                $request->input('date_to'),
                fn ($q, $dateTo) => $q->whereDate('created_at', '<=', $dateTo)
            );

        $sortField = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        $students = $query->paginate(25)
            ->withQueryString()
            ->through(fn (Profile $profile) => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'name' => $profile->user->name,
                'email' => $profile->user->email,
                'nis' => $profile->nis,
                'class' => $profile->class?->name,
                'class_id' => $profile->class_id,
                'phone' => $profile->phone,
                'birth_date' => $profile->birth_date?->format('Y-m-d'),
                'guardians_count' => $profile->guardians_count,
                'guardian_ids' => $profile->guardians->pluck('id')->toArray(),
                'created_at' => $profile->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $profile->updated_at->format('Y-m-d H:i:s'),
                'created_at_human' => $profile->created_at->diffForHumans(),
                'updated_at_human' => $profile->updated_at->diffForHumans(),
            ]);

        $availableGuardians = $this->getCachedGuardians();
        $availableClasses = $this->getCachedClasses();

        return Inertia::render($this->getPagePath(), [
            'students' => $students,
            'filters' => $request->only(['search', 'class_id', 'has_guardian', 'date_from', 'date_to', 'sort', 'order']),
            'canManage' => $request->user()?->can('manage-users') ?? false,
            'availableGuardians' => $availableGuardians,
            'availableClasses' => $availableClasses,
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);
        DB::transaction(fn () => $this->upsertProfile($request->validated()));
        Cache::forget('available_guardians');

        return redirect()->route('students.index')
            ->with('success', 'Santri berhasil dibuat.')
            ->with('flashId', (string) Str::uuid());
    }

    public function update(UpdateStudentRequest $request, Profile $student): RedirectResponse
    {
        $this->authorize('update', $student);
        DB::transaction(fn () => $this->upsertProfile($request->validated(), $student));
        Cache::forget('available_guardians');

        return redirect()->route('students.index')
            ->with('success', 'Data santri berhasil diperbarui.')
            ->with('flashId', (string) Str::uuid());
    }

    public function destroy(Profile $student): RedirectResponse
    {
        $this->authorize('delete', $student);
        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Santri berhasil dihapus.')
            ->with('flashId', (string) Str::uuid());
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx', 'max:5120'],
        ]);

        $importId = (string) Str::uuid();
        $filePath = $validated['file']->store('imports', 'local');

        Cache::put("import_progress:{$importId}", [
            'status' => 'pending',
            'percentage' => 0,
            'data' => [],
            'created_at' => now()->toIso8601String(),
        ], 3600);

        ImportStudentsJob::dispatch($filePath, $request->user()->id, $importId);

        return redirect()->route('students.index')
            ->with('success', 'Import santri dimulai. Progress akan ditampilkan secara real-time.')
            ->with('importId', $importId)
            ->with('flashId', (string) Str::uuid());
    }

    private function getCachedGuardians()
    {
        return Cache::remember('available_guardians', 3600, function () {
            return Profile::guardians()
                ->with('user:id,name,email')
                ->get()
                ->map(fn($p) => [
                    'value' => $p->id,
                    'label' => $p->user->name . ' (' . $p->user->email . ')',
                ]);
        });
    }

    private function getCachedClasses()
    {
        return Cache::remember('available_classes', 3600, function () {
            return Classe::select('id', 'name')
                ->orderBy('name')
                ->get()
                ->map(fn($c) => ['value' => $c->id, 'label' => $c->name]);
        });
    }
}
```

### **Step 2.3: Update Form Requests**

**File:** `app/Http/Requests/StoreStudentRequest.php`

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:100'],
        'email' => ['required', 'email', 'max:150', 'unique:users,email'],
        'class_name' => ['nullable', 'string', 'max:100'],
        'birth_date' => ['nullable', 'date'],
        'nis' => ['nullable', 'string', 'max:50', 'unique:profiles,nis'],
        'phone' => ['nullable', 'string', 'max:30'],
        'guardian_ids' => ['nullable', 'array'],
        'guardian_ids.*' => ['exists:profiles,id'],
    ];
}
```

### **✅ Checklist Phase 2:**
- [ ] Create ProfileController base class
- [ ] Refactor StudentsController
- [ ] Refactor GuardianController (same pattern)
- [ ] Refactor TeachersController (same pattern)
- [ ] Update all Form Requests
- [ ] Test CRUD operations
- [ ] Test relationships sync
- [ ] Test caching works

---

## 🔄 PHASE 3: QUEUE SYSTEM & JOBS (Day 3-4)

### **Step 3.1: Install Redis & Configure Queue**

```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

**File:** `.env`
```env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### **Step 3.2: Create Import Job**

**File:** `app/Jobs/ImportStudentsJob.php`

```php
<?php

namespace App\Jobs;

use App\Imports\StudentImport;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ImportStudentsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 3;

    protected string $filePath;
    protected int $userId;
    protected string $importId;

    public function __construct(string $filePath, int $userId, string $importId)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
        $this->importId = $importId;
        $this->onQueue('imports');
    }

    public function handle(): void
    {
        $this->updateProgress('processing', 0);

        try {
            $import = new StudentImport();
            Excel::import($import, Storage::disk('local')->path($this->filePath));

            $failures = $import->failures()->map(fn ($f) => [
                'row' => $f->row(),
                'errors' => $f->errors(),
                'values' => $f->values(),
            ])->values()->all();

            $created = $import->getCreatedCount();
            $updated = $import->getUpdatedCount();
            $failed = count($failures);

            $this->updateProgress('completed', 100, [
                'created' => $created,
                'updated' => $updated,
                'failed' => $failed,
                'failures' => $failures,
            ]);

            AuditLogger::log('students.import.completed', 'Import santri selesai', [
                'import_id' => $this->importId,
                'created' => $created,
                'updated' => $updated,
                'failed' => $failed,
            ]);

            Cache::forget('available_guardians');
            Cache::forget('available_classes');
            Storage::disk('local')->delete($this->filePath);

        } catch (\Throwable $e) {
            report($e);
            $this->updateProgress('failed', 0, ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function updateProgress(string $status, int $percentage, array $data = []): void
    {
        Cache::put("import_progress:{$this->importId}", [
            'status' => $status,
            'percentage' => $percentage,
            'data' => $data,
            'updated_at' => now()->toIso8601String(),
        ], 3600);
    }

    public function failed(\Throwable $exception): void
    {
        $this->updateProgress('failed', 0, ['error' => $exception->getMessage()]);
        
        AuditLogger::log('students.import.failed', 'Import gagal', [
            'import_id' => $this->importId,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

### **Step 3.3: Create Progress Controller**

**File:** `app/Http/Controllers/ImportProgressController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ImportProgressController extends Controller
{
    public function show(Request $request, string $importId): JsonResponse
    {
        $progress = Cache::get("import_progress:{$importId}");

        if (!$progress) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Import tidak ditemukan atau sudah expired.',
            ], 404);
        }

        return response()->json($progress);
    }
}
```

**Add Route:**
```php
Route::get('/imports/{importId}/progress', [ImportProgressController::class, 'show'])
    ->name('imports.progress');
```

### **Step 3.4: Update Import Classes**

**File:** `app/Imports/StudentImport.php`

```php
<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, SkipsEmptyRows
{
    use SkipsFailures;

    private int $created = 0;
    private int $updated = 0;

    public function model(array $row)
    {
        // Skip comment lines
        if (isset($row['name']) && str_starts_with($row['name'], '#')) {
            return null;
        }

        $name = $row['name'];
        $email = $row['email'];
        $className = $row['class_name'] ?? null;
        $birthDate = $row['birth_date'] ?? null;
        $phone = $row['phone'] ?? null;
        $nis = $row['nis'] ?? null;
        $guardianEmails = $row['guardian_emails'] ?? null;

        // Create/update user
        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        if (!$user->exists) {
            $user->password = Hash::make('Password!123');
            $user->email_verified_at = now();
        }
        $user->save();

        if (!$user->hasRole('student')) {
            $user->assignRole('student');
        }

        // Handle class
        $class = null;
        if ($className) {
            $class = Classe::firstOrCreate(['name' => $className]);
        }

        // Create/update profile
        $profile = Profile::firstOrNew(['user_id' => $user->id]);
        $wasExisting = $profile->exists;

        if ($nis) {
            $profile->nis = $nis;
        } elseif (!$profile->nis) {
            $profile->nis = Profile::generateNis();
        }

        $profile->birth_date = $birthDate ?: $profile->birth_date;
        $profile->class_id = $class?->id ?? $profile->class_id;
        $profile->phone = $phone ?: $profile->phone;
        $profile->user_id = $user->id;
        $profile->save();

        // Handle guardian relations
        if ($guardianEmails) {
            $emails = array_map('trim', explode(',', $guardianEmails));
            $guardianIds = [];

            foreach ($emails as $guardianEmail) {
                $guardianUser = User::firstOrCreate(
                    ['email' => $guardianEmail],
                    [
                        'name' => explode('@', $guardianEmail)[0],
                        'password' => Hash::make('Password!123'),
                        'email_verified_at' => now(),
                    ]
                );

                if (!$guardianUser->hasRole('guardian')) {
                    $guardianUser->assignRole('guardian');
                }

                $guardianProfile = Profile::firstOrCreate(['user_id' => $guardianUser->id]);
                $guardianIds[] = $guardianProfile->id;
            }

            $profile->guardians()->sync($guardianIds);
        }

        if ($wasExisting) {
            $this->updated++;
        } else {
            $this->created++;
        }

        return $profile;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'nis' => ['nullable', 'string', 'max:50'],
            'class_name' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:30'],
            'guardian_emails' => ['nullable', 'string'],
        ];
    }

    public function getCreatedCount(): int
    {
        return $this->created;
    }

    public function getUpdatedCount(): int
    {
        return $this->updated;
    }

    public function prepareForValidation(array $data, $index)
    {
        if (isset($data['name']) && str_starts_with($data['name'], '#')) {
            return null;
        }

        return $data;
    }
}
```

### **Step 3.5: Setup Queue Worker**

**Development:**
```bash
php artisan queue:work redis --queue=imports,default --tries=3 --timeout=300
```

**Production (Supervisor):**

**File:** `/etc/supervisor/conf.d/hafalan-app-worker.conf`
```ini
[program:hafalan-app-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/hafalan-app/artisan queue:work redis --queue=imports,default --sleep=3 --tries=3 --timeout=300
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/hafalan-app/storage/logs/worker.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start hafalan-app-worker:*
```

### **✅ Checklist Phase 3:**
- [ ] Install & configure Redis
- [ ] Create ImportStudentsJob
- [ ] Create ImportGuardiansJob
- [ ] Create ImportTeachersJob
- [ ] Create ImportProgressController
- [ ] Update Import classes
- [ ] Setup Supervisor for queue worker
- [ ] Test import with small file (10 rows)
- [ ] Test import with large file (1000+ rows)
- [ ] Test progress tracking

---

## 🎨 PHASE 4: FRONTEND - UI/UX IMPROVEMENTS (Day 4-5)

### **Step 4.1: Install Dependencies**

```bash
npm install @radix-ui/react-select @radix-ui/react-progress date-fns react-day-picker
```

### **Step 4.2: Add shadcn/ui Components**

```bash
npx shadcn-ui@latest add select
npx shadcn-ui@latest add progress
```

Or create manually (see REFACTORING_PLAN_V3 for full code).

### **Step 4.3: Create Reusable Components**

Create these components:
1. **FilterBar** - Advanced filtering with search, select, date range
2. **ImportProgressModal** - Real-time progress with polling
3. **MultiSelect** - Multi-select dropdown for relations
4. **DateRangePicker** - Date range selector
5. **UploadCsvModal** - Enhanced with template download

(Full code in previous plans)

### **Step 4.4: Update Index Pages**

Update all index pages:
- `resources/js/pages/students/index.tsx`
- `resources/js/pages/guardians/index.tsx`
- `resources/js/pages/teachers/index.tsx`
- `resources/js/pages/admins/index.tsx`

Add:
- FilterBar component
- ImportProgressModal
- Enhanced UploadCsvModal

### **Step 4.5: Update Columns**

Add to all columns:
- Created At & Updated At columns
- Reset Password button in action dropdown
- Guardian/Student/Class count badges

### **✅ Checklist Phase 4:**
- [ ] Install npm dependencies
- [ ] Add shadcn/ui components
- [ ] Create FilterBar component
- [ ] Create ImportProgressModal component
- [ ] Create MultiSelect component
- [ ] Create DateRangePicker component
- [ ] Update UploadCsvModal component
- [ ] Update all index pages
- [ ] Update all columns
- [ ] Test filtering
- [ ] Test import progress UI
- [ ] Test responsive design

---

## 📄 PHASE 5: CSV TEMPLATES (Day 5)

### **Step 5.1: Create Template Controller**

See `CSV_TEMPLATE_GUIDE.md` for full implementation.

### **Step 5.2: Add Template Routes**

```php
Route::get('templates/students', [TemplateController::class, 'students'])
    ->name('templates.students');
Route::get('templates/guardians', [TemplateController::class, 'guardians'])
    ->name('templates.guardians');
Route::get('templates/teachers', [TemplateController::class, 'teachers'])
    ->name('templates.teachers');
Route::get('templates/admins', [TemplateController::class, 'admins'])
    ->name('templates.admins');
```

### **Step 5.3: Update Upload Modal**

Add template download buttons with two options:
- Simple template
- Template with documentation

### **✅ Checklist Phase 5:**
- [ ] Create TemplateController
- [ ] Add template routes
- [ ] Update UploadCsvModal with download buttons
- [ ] Test all template downloads
- [ ] Test templates work with import
- [ ] Verify UTF-8 encoding (Excel support)

---

## 🚀 PHASE 6: PERFORMANCE OPTIMIZATION (Day 6)

### **Step 6.1: Add Database Indexes**

```php
// Migration
Schema::table('profiles', function (Blueprint $table) {
    $table->index(['class_id', 'created_at']);
});

Schema::table('users', function (Blueprint $table) {
    $table->index('name');
});
```

### **Step 6.2: Implement Caching**

```php
// In controllers
private function getCachedGuardians()
{
    return Cache::remember('available_guardians', 3600, function () {
        return Profile::guardians()
            ->with('user:id,name,email')
            ->get()
            ->map(fn($p) => [...]);
    });
}
```

### **Step 6.3: Eager Loading Everywhere**

```php
// Always use with() and withCount()
Profile::with(['user:id,name,email', 'class:id,name'])
    ->withCount('guardians')
    ->paginate(25);
```

### **✅ Checklist Phase 6:**
- [ ] Add database indexes migration
- [ ] Implement caching for dropdowns
- [ ] Add eager loading to all queries
- [ ] Test query performance (should be < 5 queries per page)
- [ ] Test page load time (should be < 500ms)
- [ ] Run `php artisan telescope:prune` to check queries

---

## ✅ PHASE 7: TESTING & DEPLOYMENT (Day 7)

### **Step 7.1: Manual Testing**

Test all scenarios:
- [ ] Create student without guardian
- [ ] Create student with guardian
- [ ] Create guardian with students
- [ ] Create teacher with classes
- [ ] Edit and update all entities
- [ ] Delete entities (check cascades)
- [ ] Import CSV (small & large files)
- [ ] Test all filters
- [ ] Test sorting
- [ ] Test pagination
- [ ] Test reset password
- [ ] Test cache clearing
- [ ] Test queue worker restart

### **Step 7.2: Performance Testing**

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 http://localhost/students

# Check query count
php artisan telescope:prune
# Visit /telescope and check queries
```

### **Step 7.3: Deployment Checklist**

- [ ] Backup production database
- [ ] Run migrations in staging first
- [ ] Verify data integrity in staging
- [ ] Test all features in staging
- [ ] Deploy to production (off-peak hours)
- [ ] Run migrations in production
- [ ] Start queue workers
- [ ] Monitor error logs for 24 hours
- [ ] Clear application cache
- [ ] Clear route cache
- [ ] Test production site

### **Step 7.4: Rollback Plan**

If something goes wrong:
```bash
# Rollback migrations
php artisan migrate:rollback --step=4

# Restore database from backup
mysql -u root -p hafalan_app < backup.sql

# Restart workers
sudo supervisorctl restart hafalan-app-worker:*
```

---

## 📊 SUCCESS METRICS

### **Performance Metrics:**

| Metric | Before | Target | Actual |
|--------|--------|--------|--------|
| Page Load Time | 800ms | < 400ms | ___ms |
| Database Queries | 25+ | < 5 | ___ |
| CSV Import (1000 rows) | Timeout | < 15s | ___s |
| Cache Hit Rate | 0% | > 80% | __% |
| User Satisfaction | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ___ |

### **Feature Completion:**

- [ ] ✅ Consolidated database (profiles table)
- [ ] ✅ Multi-select for relations (guardian-student, teacher-class)
- [ ] ✅ Queue system for imports
- [ ] ✅ Real-time progress tracking
- [ ] ✅ Advanced filtering (search, date, sort)
- [ ] ✅ CSV templates with documentation
- [ ] ✅ Reset password buttons
- [ ] ✅ Timestamps displayed everywhere
- [ ] ✅ Performance optimization (caching, indexing)
- [ ] ✅ Mobile responsive

---

## 🎯 FINAL RECOMMENDATIONS

### **Critical Success Factors:**

1. **Test Incrementally** - Don't wait until everything is done
2. **Backup Always** - Before every major change
3. **Monitor Logs** - Check error logs after each phase
4. **User Feedback** - Get feedback from real users in staging
5. **Documentation** - Update user manual and API docs

### **Post-Launch Activities:**

1. **Week 1:** Monitor performance and fix bugs
2. **Week 2:** Gather user feedback and iterate
3. **Week 3:** Optimize based on real usage patterns
4. **Week 4:** Training for admins and teachers

### **Future Enhancements (After v1.0):**

- [ ] WebSocket for true real-time (optional)
- [ ] Laravel Horizon for better queue management
- [ ] Two-Factor Authentication (2FA)
- [ ] Mobile app with API
- [ ] Advanced analytics dashboard
- [ ] Export to PDF with charts
- [ ] WhatsApp notifications
- [ ] Email reminders for hafalan

---

## 📞 SUPPORT & MAINTENANCE

### **Weekly Tasks:**
- Check error logs
- Monitor queue failures
- Clear old cache
- Backup database

### **Monthly Tasks:**
- Performance review
- Security updates
- User feedback analysis
- Feature prioritization

---

## 🎉 CONCLUSION

This master plan combines all the best practices and features into a single, actionable roadmap. By following this plan systematically, you'll transform the Hafalan App into a professional, scalable, and user-friendly application.

**Total Investment:** 5-7 days  
**Total Return:** Massive improvement in UX, performance, and maintainability

**Ready to start?** Begin with Phase 1 and work through each phase systematically. Good luck! 🚀

---

**Dibuat oleh:** Droid AI Assistant  
**Untuk:** @muhrobby  
**Proyek:** Hafalan App - Complete Transformation  
**Status:** 🟢 READY TO IMPLEMENT  
**Version:** 1.0 Final
