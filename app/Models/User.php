<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'must_change_password' => 'boolean',
            'password_changed_at' => 'datetime',
            'temporary_password_set_at' => 'datetime',
        ];
    }


    /**
     * User has one Profile (NEW CONSOLIDATED APPROACH)
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Helper: Get profile or create if not exists
     */
    public function getOrCreateProfile(): Profile
    {
        return $this->profile ?? $this->profile()->create([]);
    }

    // ============ OLD RELATIONSHIPS (Keep for backward compatibility during migration) ============
    
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function guardian()
    {
        return $this->hasOne(Guardian::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }
}
