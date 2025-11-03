<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ResetPasswordController extends Controller
{
    public function setTemporary(Request $request): RedirectResponse
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'password' => ['nullable', Password::defaults()],
        ]);

        $user = User::findOrFail($validated['user_id']);
        $temporaryPassword = $validated['password'] ?? Str::password(12);

        $user->forceFill([
            'password' => Hash::make($temporaryPassword),
            'must_change_password' => true,
            'password_changed_at' => null,
            'temporary_password_set_at' => now(),
        ])->save();

        AuditLogger::log(
            'users.reset_password.temporary',
            'Admin menetapkan password sementara untuk pengguna',
            [
                'target_user_id' => $user->id,
                'target_user_email' => $user->email,
            ]
        );

        return back()
            ->with('success', 'Password sementara berhasil diatur.')
            ->with('temporaryPassword', $temporaryPassword)
            ->with('flashId', (string) Str::uuid());
    }
}

