<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('User/Index');
    }

    public function create(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('User/Create');
    }

    public function store(UserRequest $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $user = User::factory()->create($request->only(app(User::class)->getFillable()));

        $user->sendEmailLoginInstructions();

        return response()->json(['message' => 'User created successfully']);
    }

    public function show(Request $request, User $user): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('User/Show', [
            'user' => new UserResource($user),
        ]);
    }

    public function edit(Request $request, User $user): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('User/Edit', [
            'user' => new UserResource($user),
        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $user->fill($request->only(app(User::class)->getFillable()));

        $user->save();

        return response()->json(['message' => 'User updated successfully']);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $user->email = 'deleted' . $user->id . '_' . $user->email;
        $user->save();

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
