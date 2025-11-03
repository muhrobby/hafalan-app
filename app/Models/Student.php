<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Student extends Model
{
    protected $fillable = ['user_id', 'nis', 'birth_date', 'class_id', 'phone'];
    protected $casts = ['birth_date' => 'date'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function class()
    {
        return $this->belongsTo(Classe::class,'class_id');
    }
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(Guardian::class)->withTimestamps();
    }

    public function hafalans(): HasMany
    {
        return $this->hasMany(Hafalan::class);
    }

    public static function generateNis(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = $date->format('ymd');

        // Try to find latest from students table OR profiles table
        $latestFromStudents = static::query()
            ->where('nis', 'like', "{$prefix}%")
            ->orderByDesc('nis')
            ->value('nis');
        
        $latestFromProfiles = \DB::table('profiles')
            ->where('nis', 'like', "{$prefix}%")
            ->orderByDesc('nis')
            ->value('nis');

        // Get the highest NIS from both tables
        $latest = null;
        if ($latestFromStudents && $latestFromProfiles) {
            $latest = max($latestFromStudents, $latestFromProfiles);
        } elseif ($latestFromStudents) {
            $latest = $latestFromStudents;
        } elseif ($latestFromProfiles) {
            $latest = $latestFromProfiles;
        }

        $nextSequence = $latest
            ? ((int) substr($latest, strlen($prefix))) + 1
            : 1;

        $sequence = str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);

        return $prefix.$sequence;
    }
}
