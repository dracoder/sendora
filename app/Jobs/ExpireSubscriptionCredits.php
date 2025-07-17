<?php

namespace App\Jobs;

use App\Repositories\CreditRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireSubscriptionCredits implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        //
    }

    public function handle(): void
    {
        $creditRepository = new CreditRepository();
        $expiredCount = $creditRepository->expireSubscriptionCredits();
        
        Log::info("Expired {$expiredCount} subscription credit transactions");
    }
}