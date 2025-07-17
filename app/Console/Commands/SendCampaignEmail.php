<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\SubscriberCampaign;
use App\Models\SubscriberCampaignEmail;
use App\Repositories\CampaignRepository;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendCampaignEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaign:send-email';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send campaign email to subscribers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $campaigns = Campaign::query()->withoutGlobalScopes()
            ->active()
            ->notSkipped()
            ->where(function ($query) {
                $query->whereNull('start_at')
                    ->orWhere('start_at', '<=', now());
            })
            ->with([
                'emails' => function ($query) {
                    $query->active();
                },
            ])
            ->get();
        foreach ($campaigns as $campaign) {
            $campaignRepository = new CampaignRepository($campaign);
            foreach ($campaignRepository->getSubscribers(globalScoped: false)->get() as $subscriber) {
                $campaignRepository->handleNextMail($subscriber->id);
            }
        }
    }
}
