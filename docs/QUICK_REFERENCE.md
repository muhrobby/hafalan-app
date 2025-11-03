# Quick Reference Guide - Integration Patterns

## 🎯 Common Patterns untuk Developer

### 1. Authorization Pattern

```php
// Di controller method
Gate::authorize('permission-name');

// Atau dengan model instance
Gate::authorize('action-name', $model);

// Check without exception
if (Gate::allows('permission-name')) {
    // allowed
}
```

**Available Gates**:

- `manage-users` - Admin only
- `input-hafalan` - Admin, Teacher
- `view-hafalan` - Admin, Teacher, Guardian, Wali, Student
- `view-analytics` - Admin, Teacher, Student
- `view-wali-analytics` - Guardian, Wali
- `view-student-report` - Check via ScopeService

---

### 2. Data Scoping Pattern

```php
use App\Support\ScopeService;

class MyController extends Controller
{
    public function __construct(private ScopeService $scope) {}

    public function index(Request $request)
    {
        $user = $request->user();

        // Apply hafalan scope
        $hafalans = $this->scope
            ->applyHafalanScope(Hafalan::query(), $user)
            ->get();

        // Get accessible profiles
        $profiles = $this->scope->profilesForUser($user);

        // Check if user can access specific profile
        $canAccess = $this->scope->canAccessProfile($user, $profile);
    }
}
```

---

### 3. Filter Options Pattern

```php
// Get students for filter dropdown
$students = $this->scope->studentOptions($user);
// Returns: [['id' => 1, 'name' => 'Student Name'], ...]

// Get teachers (admin only)
$teachers = $user->hasRole('admin')
    ? $this->scope->teacherOptions()
    : collect();

// Get classes based on user role
$classes = $this->scope->classOptionsFor($user);
```

**Important**: All filter options methods return format `{ id, name }` untuk konsistensi dengan frontend.

---

### 4. Period Filter Pattern

```php
// In controller (extend base Controller)
[$from, $to] = $this->resolvePeriod(
    $request->query('from'),
    $request->query('to')
);

// Apply to query
$query->betweenDates($from->toDateString(), $to->toDateString());
```

---

### 5. Student Filter Pattern

```php
// With access check
$studentId = $this->resolveStudentFilter(
    $user,
    $request->query('student_id'),
    $this->scope
);

// Apply to query
$query->when($studentId, fn($q) => $q->where('student_id', $studentId));
```

---

### 6. Query dengan Profile Relations

```php
// Get hafalan with student and teacher info
$hafalans = Hafalan::query()
    ->with([
        'student.user:id,name',     // Student profile
        'teacher.user:id,name',      // Teacher profile
        'surah:id,code,name',        // Surah info
    ])
    ->get();

// Get profile with guardians
$profile = Profile::with('guardians.user')->find($id);

// Get profile with students (for guardian)
$profile = Profile::with('students.user')->find($id);

// Get teacher's classes
$profile = Profile::with('classes')->find($id);
```

---

### 7. Aggregate Queries Pattern

```php
// Hafalan summary
$summary = $baseQuery
    ->selectRaw('COUNT(*) as total_records')
    ->selectRaw("SUM(CASE WHEN status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
    ->selectRaw("SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
    ->first();

// Per student summary
$summaries = $baseQuery
    ->selectRaw('student_id, COUNT(*) as total_records')
    ->groupBy('student_id')
    ->get()
    ->keyBy('student_id');
```

---

### 8. Role Check Pattern

```php
// Single role
if ($user->hasRole('admin')) { }

// Multiple roles (OR)
if ($user->hasAnyRole(['admin', 'teacher'])) { }

// All roles (AND)
if ($user->hasAllRoles(['admin', 'super-admin'])) { }

// Via profile
if ($profile->isStudent()) { }
if ($profile->isTeacher()) { }
if ($profile->isGuardian()) { }
```

---

### 9. Variant Pattern (UI Customization)

```php
private function determineVariant($user): string
{
    if ($user->hasRole('admin')) return 'admin';
    if ($user->hasRole('teacher')) return 'teacher';
    if ($user->hasRole('guardian')) return 'guardian';
    return 'student';
}

// In Inertia
return Inertia::render('Page', [
    'variant' => $variant,
    // Frontend can customize UI based on variant
]);
```

---

### 10. Profile Type Detection

```php
// In query
Profile::whereNotNull('nis')->get(); // Students only
Profile::whereNotNull('nip')->get(); // Teachers only

// Via scope
Profile::students()->get();
Profile::teachers()->get();
Profile::guardians()->get();

// Instance check
$profile->isStudent(); // has 'student' role
$profile->isTeacher(); // has 'teacher' role
$profile->isGuardian(); // has 'wali' role
```

---

## 🔧 ScopeService Methods Reference

```php
// Get accessible profile IDs for user
$profileIds = $scope->accessibleProfileIds($user);
// Returns: Collection|null (null = no restriction/admin)

// Get profiles for user
$profiles = $scope->profilesForUser($user);
// Returns: Collection of Profile models

// Apply hafalan scope to query
$query = $scope->applyHafalanScope(Hafalan::query(), $user);

// Apply profile scope to query
$query = $scope->applyProfileScope(Profile::query(), $user);

// Check access to specific profile
$canAccess = $scope->canAccessProfile($user, $profile);
// Returns: bool

// Get student options for dropdown
$options = $scope->studentOptions($user);
// Returns: Collection [['id' => 1, 'name' => 'Student Name'], ...]

// Get teacher options
$options = $scope->teacherOptions();
// Returns: Collection [['id' => 1, 'name' => 'Teacher Name'], ...]

// Get class options based on role
$options = $scope->classOptionsFor($user);
// Returns: Collection [['id' => 1, 'name' => 'Class Name'], ...]
```

**Note**: Semua options methods return format `{ id, name }` konsisten dengan frontend TypeScript types.

---

## 📝 Common Inertia Props Pattern

```php
return Inertia::render('Page', [
    // Data
    'hafalans' => $hafalans,
    'students' => $students,

    // Filters (current values)
    'filters' => [
        'from' => $from->toDateString(),
        'to' => $to->toDateString(),
        'student_id' => $studentId,
        'class_id' => $classId,
    ],

    // Available filter options
    'availableFilters' => [
        'students' => $this->scope->studentOptions($user),
        'classes' => $this->scope->classOptionsFor($user),
    ],

    // Meta
    'variant' => $variant,
    'canEdit' => Gate::allows('input-hafalan'),
]);
```

---

## 🎨 Frontend Pattern (TypeScript/React)

```tsx
// Type definition
interface HafalanData {
    id: number;
    date: string;
    student: string;
    teacher: string;
    surah: { code: string; name: string };
    from_ayah: number;
    to_ayah: number;
    status: 'murojaah' | 'selesai';
    score: number;
    notes?: string;
}

interface PageProps {
    hafalans: HafalanData[];
    filters: {
        from?: string;
        to?: string;
        student_id?: string;
    };
    availableFilters: {
        students: { value: string; label: string }[];
        classes: { value: string; label: string }[];
    };
    variant: 'admin' | 'teacher' | 'student' | 'guardian';
    canEdit: boolean;
}

// Usage
export default function HafalanIndex({
    hafalans,
    filters,
    availableFilters,
    variant,
    canEdit,
}: PageProps) {
    // Conditional rendering based on variant
    if (variant === 'admin') {
        // Show all controls
    }

    // Conditional actions
    {
        canEdit && <Button>Input Hafalan</Button>;
    }
}
```

---

## 🚀 Quick Commands

```bash
# Clear all caches
php artisan optimize:clear

# List all routes
php artisan route:list

# Check permissions
php artisan permission:show

# Tinker untuk testing
php artisan tinker
>>> $user = User::find(1);
>>> $user->hasRole('admin');
>>> app(ScopeService::class)->accessibleProfileIds($user);
```

---

## ⚠️ Common Pitfalls

### 1. ❌ Don't query without scoping

```php
// BAD
$hafalans = Hafalan::all();

// GOOD
$hafalans = $this->scope
    ->applyHafalanScope(Hafalan::query(), $user)
    ->get();
```

### 2. ❌ Don't forget authorization

```php
// BAD
public function index() {
    return Hafalan::all();
}

// GOOD
public function index() {
    Gate::authorize('view-hafalan');
    return $this->scope->applyHafalanScope(...);
}
```

### 3. ❌ Don't use old model references

```php
// BAD
use App\Models\Student;
$student = Student::find($id);

// GOOD
use App\Models\Profile;
$profile = Profile::find($id);
```

### 4. ❌ Don't expose unfiltered options

```php
// BAD
$students = Profile::whereNotNull('nis')->get();

// GOOD
$students = $this->scope->studentOptions($user);
```

### 5. ❌ Don't duplicate helper methods

```php
// BAD - in every controller
private function resolvePeriod(...) { }

// GOOD - use base Controller
$this->resolvePeriod(...);
```

---

## 📖 Additional Resources

- [Main Integration Docs](./END_TO_END_INTEGRATION.md)
- [Refactoring Plan](./MASTER_REFACTORING_PLAN.md)
- [Phase Completion Reports](./PHASE6_FINAL_VERIFICATION.md)
- [Authorization Fix](./AUTHORIZATION_FIX.md)

---

**Happy Coding! 🎉**
