<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->must_change_password) {
            return $next($request);
        }

        if ($this->shouldBypass($request)) {
            return $next($request);
        }

        return redirect()
            ->route('password.edit')
            ->with('mustChangePassword', true);
    }

    private function shouldBypass(Request $request): bool
    {
        if ($request->routeIs([
            'password.edit',
            'password.update',
            'password.confirm',
            'logout',
        ])) {
            return true;
        }

        $path = $request->path();

        return in_array($path, [
            'logout',
        ], true);
    }
}
