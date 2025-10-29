<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Carbon;

class Teacher extends Model
{
    protected $fillable = ['user_id','nip','phone'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class,'teacher_id');
    }

    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(
            Student::class,
            Classe::class,
            'teacher_id',
            'class_id',
            'id',
            'id'
        );
    }

    public function hafalans(): HasMany
    {
        return $this->hasMany(Hafalan::class);
    }

    public static function generateNip(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = 'UST'.$date->format('y');

        $latest = static::query()
            ->where('nip', 'like', "{$prefix}%")
            ->orderByDesc('nip')
            ->value('nip');

        $nextSequence = $latest
            ? ((int) substr($latest, strlen($prefix))) + 1
            : 1;

        $sequence = str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);

        return $prefix.$sequence;
    }
}
