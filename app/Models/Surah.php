<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Surah extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'ayah_count',
    ];

    protected $casts = [
        'ayah_count' => 'integer',
    ];

    public function hafalans(): HasMany
    {
        return $this->hasMany(Hafalan::class);
    }
}
