<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\FirstLoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FirstLoginController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        $user = User::where('remember_token', $request->token)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => 'Invalid token.',
            ]);
        }
        if ($user->email_verified_at) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/FirstLogin', [
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(FirstLoginRequest $request)
    {
        $user = User::where('remember_token', $request->token)->first();

        $user->update([
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
            'remember_token' => null,
        ]);

        Auth::login($user);

        return response()->json(['success' => true]);
    }
}
