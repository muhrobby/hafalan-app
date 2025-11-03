<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $r)
    {
        Gate::authorize('manage-users');
        $q = User::query()->with(['roles','student.class','teacher','guardian']);

        if ($role = $r->query('role')){
            $q->whereHas('roles',fn($qq)=>$qq->where('name',$role));
        }

        if ($s = $r->query('search')) {
                 $q->where(function($qq) use ($s){
                $qq->where('name','like',"%$s%")
                ->orWhere('email','like',"%$s%");
      });
    }

    $users = $q->orderBy('id')->paginate(100)->through(function ($u){
        return [
            'id' => $u->id,
            'name'=>$u->name,
            'email'=> $u->email,
          'role' => $u->roles->first()->name ?? null,
        ];
    });

    return Inertia::render('user/home', [
        'users'     => $users,
    //   'filters'=>$r->only(['role','search']),
    //   'roles'=>['admin','ustadz','santri','wali'],
    //   'classes'=>Classe::select('id','name')->orderBy('name')->get(),
    ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
