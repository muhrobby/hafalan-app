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
     * Many-to-many relationship with teachers (profiles)
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
     * One-to-many relationship with students (profiles)
     */
    public function students(): HasMany
    {
        return $this->hasMany(Profile::class, 'class_id');
    }
}
