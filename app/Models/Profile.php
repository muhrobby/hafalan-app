<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Profile extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'nis',
        'nip',
        'phone',
        'birth_date',
        'address',
        'class_id',
        'entry_year',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'entry_year' => 'integer',
    ];

    // ============ RELATIONSHIPS ============

    /**
     * Profile belongs to one User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Profile belongs to one Class (for students)
     * DEPRECATED: Class system removed
     */
    // public function class(): BelongsTo
    // {
    //     return $this->belongsTo(Classe::class, 'class_id');
    // }

    /**
     * Profile has many Hafalans (for students)
     */
    public function hafalans(): HasMany
    {
        return $this->hasMany(Hafalan::class, 'student_id');
    }

    /**
     * Profile has many guardians (for students via profile_relations)
     */
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(
            Profile::class,
            'profile_relations',
            'profile_id',
            'related_profile_id'
        )
        ->wherePivot('relation_type', 'guardian')
        ->withTimestamps()
        ->withPivot('relation_type');
    }

    /**
     * Profile has many students (for guardians via profile_relations)
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            Profile::class,
            'profile_relations',
            'related_profile_id',
            'profile_id'
        )
        ->wherePivot('relation_type', 'guardian')
        ->withTimestamps()
        ->withPivot('relation_type');
    }

    /**
     * Profile has many classes (for teachers via class_teacher)
     * DEPRECATED: Class system removed
     */
    // public function classes(): BelongsToMany
    // {
    //     return $this->belongsToMany(
    //         Classe::class,
    //         'class_teacher',
    //         'teacher_id',
    //         'class_id'
    //     )
    //     ->withTimestamps();
    // }

    // ============ SCOPES ============

    /**
     * Scope untuk filter hanya student profiles
     */
    public function scopeStudents($query)
    {
        return $query->whereNotNull('nis');
    }

    /**
     * Scope untuk filter hanya guardian profiles
     */
    public function scopeGuardians($query)
    {
        return $query->whereHas('user', fn($q) => $q->role('wali'));
    }

    /**
     * Scope untuk filter hanya teacher profiles
     */
    public function scopeTeachers($query)
    {
        return $query->whereNotNull('nip');
    }

    // ============ HELPER METHODS ============

    /**
     * Check if profile is a student
     */
    public function isStudent(): bool
    {
        return $this->user?->hasRole('student') ?? false;
    }

    /**
     * Check if profile is a guardian
     */
    public function isGuardian(): bool
    {
        return $this->user?->hasRole('wali') ?? false;
    }

    /**
     * Check if profile is a teacher
     */
    public function isTeacher(): bool
    {
        return $this->user?->hasRole('teacher') ?? false;
    }

    /**
     * Generate unique NIS for students
     */
    public static function generateNis(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = $date->format('ymd');

        $latest = static::query()
            ->where('nis', 'like', "{$prefix}%")
            ->orderByDesc('nis')
            ->value('nis');

        $nextSequence = $latest
            ? ((int) substr($latest, strlen($prefix))) + 1
            : 1;

        $sequence = str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }

    /**
     * Generate unique NIP for teachers
     */
    public static function generateNip(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = $date->format('Ymd');

        $latest = static::query()
            ->where('nip', 'like', "{$prefix}%")
            ->orderByDesc('nip')
            ->value('nip');

        $nextSequence = $latest
            ? ((int) substr($latest, strlen($prefix))) + 1
            : 1;

        $sequence = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }
}
