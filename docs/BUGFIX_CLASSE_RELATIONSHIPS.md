# 🔧 Fix: Classe Model Relationships with Profile

**Date**: 29 Oktober 2025  
**Issue**: RelationNotFoundException pada `/reports/students/{id}`  
**Error**: `Call to undefined relationship [teachers] on model [App\Models\Classe]`

---

## 🐛 Problem

Saat mengakses student report, terjadi error karena model `Classe` masih menggunakan relasi lama yang reference ke `Teacher` dan `Student` models, bukan `Profile` model.

### Error Stack Trace

```
Illuminate\Database\Eloquent\RelationNotFoundException
Call to undefined relationship [teachers] on model [App\Models\Classe].

Location: app/Http/Controllers/ReportController.php:49
Code: $student->loadMissing(['class.teachers.user:id,name']);
```

### Root Cause

Model `Classe` belum di-update setelah refactoring ke Profile-based architecture:

**Before**:

```php
class Classe {
    public function teacher(): BelongsTo {
        return $this->belongsTo(Teacher::class);
    }

    public function students(): HasMany {
        return $this->hasMany(Student::class, 'class_id');
    }

    // ❌ Missing: teachers() many-to-many relationship
}
```

---

## ✅ Solution

Updated `Classe` model untuk support Profile-based relationships:

### File: `app/Models/Classe.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classe extends Model
{
    protected $table = 'classes';
    protected $fillable = ['name', 'teacher_id'];

    /**
     * Legacy: Single teacher relationship (deprecated)
     * Use teachers() many-to-many instead
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'teacher_id');
    }

    /**
     * ✅ NEW: Many-to-many relationship with teachers (profiles)
     * via class_teacher pivot table
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(
            Profile::class,
            'class_teacher',
            'class_id',
            'teacher_id'
        )->withTimestamps();
    }

    /**
     * ✅ UPDATED: One-to-many relationship with students (profiles)
     */
    public function students(): HasMany
    {
        return $this->hasMany(Profile::class, 'class_id');
    }
}
```

---

## 🔄 Changes Made

### 1. Added `teachers()` Relationship

```php
// NEW: Many-to-many via class_teacher pivot
public function teachers(): BelongsToMany
{
    return $this->belongsToMany(
        Profile::class,      // ← Profile, not Teacher
        'class_teacher',
        'class_id',
        'teacher_id'
    )->withTimestamps();
}
```

### 2. Updated `teacher()` Relationship

```php
// BEFORE
return $this->belongsTo(Teacher::class);

// AFTER
return $this->belongsTo(Profile::class, 'teacher_id');
```

### 3. Updated `students()` Relationship

```php
// BEFORE
return $this->hasMany(Student::class, 'class_id');

// AFTER
return $this->hasMany(Profile::class, 'class_id');
```

---

## 📊 Database Schema

### Tables Involved

1. **classes** - Class table
    - `id`
    - `name`
    - `teacher_id` (legacy, nullable)

2. **class_teacher** - Pivot table (many-to-many)
    - `class_id`
    - `teacher_id` (references profiles.id)
    - `created_at`, `updated_at`

3. **profiles** - Central profile table
    - `id`
    - `user_id`
    - `class_id` (for students)
    - `nis` (students)
    - `nip` (teachers)

---

## 🧪 Testing

### Verification Test

```php
$profile = Profile::with(['class.teachers.user'])->find(1);
echo $profile->class->name;           // "Kelas 1"
echo $profile->class->teachers->count(); // 1
echo $profile->class->teachers->first()->user->name; // "Teacher Name"
```

### Result

```
✅ Profile ID: 1
✅ Class: Kelas 1
✅ Teachers count: 1
✅ First teacher: Robby
```

### Manual Test

1. Login ke aplikasi
2. Buka `/reports/students/1`
3. Report harus generate tanpa error
4. PDF harus download dengan informasi lengkap

---

## 🎯 Impact Analysis

### Controllers Affected

1. **ReportController** ✅
    - Uses: `class.teachers.user`
    - Status: Fixed

2. **Other Controllers** (Potential users)
    - StudentsController
    - UserController
    - ProfileController

    Status: Need to verify if using Classe relationships

### Frontend Impact

- ❌ None - This is backend-only fix

### API Impact

- ✅ Report generation endpoints now work

---

## 📝 Related Issues

This fix is part of the Profile-based refactoring:

1. ✅ Profile model centralization
2. ✅ ScopeService data filtering
3. ✅ Analytics filter integration
4. ✅ **Classe model relationships** ← This fix

---

## 🔍 Backward Compatibility

### Legacy Relationships Kept

```php
// ✅ Still available for old code
public function teacher(): BelongsTo {
    return $this->belongsTo(Profile::class, 'teacher_id');
}
```

**Note**: Legacy `teacher()` (singular) updated to use Profile but kept for compatibility.

### Migration Path

**Old Code**:

```php
$class->teacher->user->name  // Still works (uses teacher_id column)
```

**New Code**:

```php
$class->teachers->first()->user->name  // Use this (many-to-many)
```

---

## ⚠️ Important Notes

### 1. Use `teachers()` (plural) for new code

```php
// ✅ RECOMMENDED
$class->teachers  // Returns collection via pivot table

// ⚠️ LEGACY (deprecated)
$class->teacher   // Returns single profile via teacher_id
```

### 2. Eager Loading Pattern

```php
// Load teachers with users
$class->load('teachers.user');

// Or use with()
Classe::with('teachers.user')->find($id);
```

### 3. Accessing Teacher Names

```php
// Get all teacher names
$teacherNames = $class->teachers->pluck('user.name');

// Get first teacher
$firstTeacher = $class->teachers->first()?->user->name;
```

---

## 🚀 Deployment

### Steps

1. **Update Model**

    ```bash
    # Already done - app/Models/Classe.php updated
    ```

2. **Clear Cache**

    ```bash
    php artisan optimize:clear
    ```

3. **Test**

    ```bash
    # Test report generation
    curl http://localhost:8000/reports/students/1
    ```

4. **Deploy**
    ```bash
    # Production
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

---

## ✅ Checklist

- [x] Classe model updated with teachers() relationship
- [x] Classe model updated to use Profile instead of Student/Teacher
- [x] Cache cleared
- [x] Tested with tinker
- [x] Manual test report generation
- [x] Documentation created
- [x] Backward compatibility maintained

---

## 📚 Documentation References

- [END_TO_END_INTEGRATION.md](./END_TO_END_INTEGRATION.md) - Main integration guide
- [BUGFIX_ANALYTICS_FILTER.md](./BUGFIX_ANALYTICS_FILTER.md) - Previous filter fix
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Developer patterns

---

**Status**: ✅ **RESOLVED**  
**Fixed By**: Classe model relationship update  
**Tested**: Manual + Tinker verification  
**Impact**: Report generation now works correctly
