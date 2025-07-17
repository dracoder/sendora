<?php

namespace App\Http\Controllers;

use App\Services\EmailTrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailTrackingController extends Controller
{
    protected $trackingService;
    
    public function __construct(EmailTrackingService $trackingService)
    {
        $this->trackingService = $trackingService;
    }
    
    public function track(Request $request, $trackingId)
    {
        $this->trackingService->recordOpen(
            $trackingId,
            $request->ip(),
            $request->userAgent()
        );
        
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        
        return response($pixel)
            ->header('Content-Type', 'image/gif')
            ->header('Content-Length', strlen($pixel))
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    }
}