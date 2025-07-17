<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class Locale
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Session::has('language')) {
            App::setLocale(Session::get('language'));
        }

        return $next($request)
            ->withCookie(
                cookie()->forever(
                    'language',
                    Session::has('language') ? Session::get('language') : 'en',
                    null,
                    null,
                    null,
                    false
                )
            );
    }
}
