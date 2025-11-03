<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Hafalan extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'teacher_id',
        'surah_id',
        'from_ayah',
        'to_ayah',
        'date',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'from_ayah' => 'integer',
        'to_ayah' => 'integer',
        'status' => 'string',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'student_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'teacher_id');
    }

    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }

    public function scopeBetweenDates(Builder $query, ?string $from = null, ?string $to = null): Builder
    {
        if ($from) {
            $query->whereDate('date', '>=', $from);
        }

        if ($to) {
            $query->whereDate('date', '<=', $to);
        }

        return $query;
    }
}
