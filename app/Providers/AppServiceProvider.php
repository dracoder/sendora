<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Inertia::share([
            'tinymceApiKey' => env('TINY_MCE_KEY', ''),
            'appName' => env('APP_NAME'),
            'user' => fn() => Auth::user() ? Auth::user() : null,
            'active_subscription' => fn() => Auth::user() ? Auth::user()->activeSubscription() : null,
            'current_subscription' => fn() => Auth::user() ? Auth::user()->currentSubscription() : null,
        ]);
    }
}
