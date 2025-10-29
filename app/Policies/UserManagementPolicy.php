<?php

namespace App\Policies;

use App\Models\User;

class UserManagementPolicy
{
    public function before(User $user, $ability)
  {
    // hanya admin boleh kelola users
    if ($user->hasRole('admin')) return true;
  }

  public function viewAny(User $user){ return false; }
  public function view(User $user){ return false; }
  public function create(User $user){ return false; }
  public function update(User $user){ return false; }
  public function delete(User $user){ return false; }
}
