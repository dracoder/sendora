<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Handle CreditException
        $this->renderable(function (CreditException $e, $request) {
            $data = $e->getData();
            $status = $data['status'] ?? 400;
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $data['message'],
                    'available_credits' => $data['available_credits'] ?? 0,
                    'error' => $data['error'] ?? 'credit_error'
                ], $status);
            }
            
            return redirect()->back()->with('error', $data['message']);
        });
    }
}