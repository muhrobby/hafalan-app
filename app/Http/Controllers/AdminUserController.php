<?php

namespace App\Http\Controllers;

use App\Exports\AdminsExport;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Imports\AdminImport;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage-users');

        $admins = User::query()
            ->with('roles')
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->when(
                $request->input('search'),
                fn ($query, $search) => $query->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
            )
            ->orderBy('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'created_at_human' => $user->created_at?->diffForHumans() ?? '-',
                'updated_at_human' => $user->updated_at?->diffForHumans() ?? '-',
            ]);

        return Inertia::render('admins/index', [
            'admins'   => $admins,
            'filters'  => $request->only('search'),
            'canManage'=> $request->user()?->can('manage-users') ?? false,
        ]);
    }

    public function store(StoreAdminRequest $request): RedirectResponse
    {
        $this->authorize('manage-users');

        DB::transaction(function () use ($request) {
            $this->upsertAdmin($request->validated());
        });

        return redirect()
            ->route('admins.index')
            ->with('success', 'Admin baru berhasil dibuat.')
            ->with('flashId', (string) Str::uuid());
    }

    public function update(UpdateAdminRequest $request, User $admin): RedirectResponse
    {
        $this->authorize('manage-users');

        if (! $admin->hasRole('admin')) {
            return redirect()
                ->route('admins.index')
                ->with('error', 'Pengguna ini bukan admin.');
        }

        DB::transaction(function () use ($request, $admin) {
            $this->upsertAdmin($request->validated(), $admin);
        });

        return redirect()
            ->route('admins.index')
            ->with('success', 'Data admin berhasil diperbarui.')
            ->with('flashId', (string) Str::uuid());
    }

    public function destroy(Request $request, User $admin): RedirectResponse
    {
        $this->authorize('manage-users');

        if (! $admin->hasRole('admin')) {
            return redirect()
                ->route('admins.index')
                ->with('error', 'Pengguna ini bukan admin.');
        }

        if ($admin->id === $request->user()->id) {
            return redirect()
                ->route('admins.index')
                ->with('error', 'Tidak dapat menghapus akun admin sendiri.')
                ->with('flashId', (string) Str::uuid());
        }

        $admin->delete();

        return redirect()
            ->route('admins.index')
            ->with('success', 'Admin berhasil dihapus.')
            ->with('flashId', (string) Str::uuid());
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('manage-users');

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx', 'max:5120'],
        ]);

        $import = new AdminImport();

        try {
            Excel::import($import, $validated['file']);
        } catch (\Throwable $e) {
            report($e);

            return redirect()
                ->route('admins.index')
                ->with('error', 'Import admin gagal: '.$e->getMessage())
                ->with('flashId', (string) Str::uuid());
        }

        $failures = $import->failures()
            ->map(fn ($failure) => [
                'row'    => $failure->row(),
                'errors' => $failure->errors(),
                'values' => $failure->values(),
            ])
            ->values()
            ->all();

        $created = $import->getCreatedCount();
        $updated = $import->getUpdatedCount();
        $failed = count($failures);

        $messageParts = [];
        if ($created > 0) {
            $messageParts[] = "{$created} admin baru";
        }
        if ($updated > 0) {
            $messageParts[] = "{$updated} admin diperbarui";
        }

        $summary = empty($messageParts)
            ? 'Tidak ada data baru yang diimpor.'
            : 'Import admin selesai: '.implode(', ', $messageParts).'.';

        if ($failed > 0) {
            $summary .= " {$failed} baris gagal diproses.";
        }

        return redirect()
            ->route('admins.index')
            ->with('success', $summary)
            ->with('failures', $failures)
            ->with('flashId', (string) Str::uuid());
    }

    public function export(Request $request)
    {
        $this->authorize('manage-users');

        $filters = $request->only(['search']);
        $timestamp = now()->format('Y-m-d-His');

        return Excel::download(
            new AdminsExport($filters),
            "admin-{$timestamp}.xlsx"
        );
    }

    private function upsertAdmin(array $data, ?User $admin = null): User
    {
        $user = $admin ?? User::firstOrNew(['email' => $data['email']]);
        $user->name = $data['name'];
        $user->email = $data['email'];

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        } elseif (! $user->exists) {
            $user->password = Hash::make('Password!123');
        }

        if (! $user->exists) {
            $user->email_verified_at = now();
        }

        $user->save();
        $user->syncRoles(['admin']);

        return $user;
    }
}
