<?php

namespace App\Http\Controllers;

use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Models\Email;
use App\Models\SubscriberCampaign;
use App\Repositories\CampaignRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $availableCredits = $user->available_credits;
        $hasActiveSubscription = $user->activeSubscription() !== null;
        
        $hasActiveCampaigns = Campaign::whereHas('organization', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereHas('emails')
            ->whereHas('subscribers')
            ->exists();
        
        return Inertia::render('Campaign/Index', [
            'creditInfo' => [
                'availableCredits' => $availableCredits,
                'hasActiveSubscription' => $hasActiveSubscription,
                'showCreditWarning' => $availableCredits <= 0 && $hasActiveCampaigns
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Campaign/Create');
    }

    public function store(Request $request)
    {
        $campaign = Campaign::create($request->only(app(Campaign::class)->getFillable()));

        $campaign->tags()->sync($request->get('tag_ids', []));

        foreach ($request->get('emails', []) as $step => $email) {
            $campaign->emails()->create([
                ...$email,
                'step' => $step + 1,
            ]);
        }

        if ($request->has('skip_dates')) {
            $campaign->skip_dates()->createMany($request->get('skip_dates'), []);
        }

        return response()->json(['message' => 'Campaign created successfully']);
    }

    public function show(Request $request, Campaign $campaign)
    {
        // $campaign->load(['emails' => function($query) {
        //     $query->withCount(['subscribersCampaigns as sent_subscribers_count' => function($q) {
        //         $q->where('sent', true);
        //     }]);
        // }]);

        $campaignRepository = new CampaignRepository($campaign);
        $campaignWithStats = $campaignRepository->loadCampaignWithStats();

        //dd($campaignWithStats);

        if ($request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'data' => $campaignWithStats
            ]);
        }
        
        return Inertia::render('Campaign/Show', [
            // 'campaign' => new CampaignResource($campaign),
            // 'subscriberCount' => $campaign->subscribers()->count(),
            'campaign' => $campaignWithStats,
        ]);
    }

    public function getEmailHistory(Request $request, Campaign $campaign, Email $email)
    {
        $campaignRepository = new CampaignRepository($campaign);
        $filter = $request->get('filter', 'all');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        
        $history = $campaignRepository->getEmailHistory(
            $email->id, 
            $request->get('page', 1),
            10,
            $filter,
            $dateFrom,
            $dateTo
        );
        
        return response()->json($history);
    }

    // public function retryEmail(Request $request, Campaign $campaign, $emailId)
    // {
    //     $campaignRepository = new CampaignRepository($campaign);
    //     $result = $campaignRepository->retryEmail($emailId);
        
    //     return response()->json([
    //         'success' => $result !== null,
    //         'message' => $result !== null ? 'Email sent successfully' : 'Failed to send email'
    //     ]);
    // }

    public function retryEmails(Request $request, Campaign $campaign)
    {
        $emailIds = $request->input('email_ids', []);
        $campaignRepository = new CampaignRepository($campaign);
        
        if (is_array($emailIds) && count($emailIds) > 0) {
            foreach ($emailIds as $emailId) {
                $campaignRepository->retryEmail($emailId);
            }
            return response()->json(['success' => true, 'message' => 'Emails queued for retry']);
        } else {
            return response()->json(['success' => false, 'message' => 'No email IDs provided']);
        }
    }
    public function edit(Request $request, Campaign $campaign): Response
    {
        return Inertia::render('Campaign/Edit', [
            'campaignData' => new CampaignResource($campaign),
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $campaign->fill($request->only(app(Campaign::class)->getFillable()));

        $campaign->save();

        // ###
        // Tags
        if ($request->has('tag_ids')) {
            $tags = $request->get('tag_ids', []);
            $existingTags = $campaign->tags->pluck('id')->toArray();

            $campaign->tags()->sync($tags);
            $campaign->refresh();

            $this->handleRemoveTags($campaign, $existingTags);
        }

        // ###
        // Emails
        $existingEmailIds = $campaign->emails->pluck('id')->toArray();
        foreach ($request->get('emails', []) as $step => $email) {
            if (isset($email['id'])) {
                $campaign->emails()->find($email['id'])->update([
                    ...$email,
                    'step' => $step + 1,
                ]);
                array_splice($existingEmailIds, array_search($email['id'], $existingEmailIds), 1);
            } else {
                $campaign->emails()->create([
                    ...$email,
                    'step' => $step + 1,
                ]);
            }
        }
        $campaign->emails()->whereIn('id', $existingEmailIds)->delete();


        // ###
        // Skip dates
        $existingSkipIds = $campaign->skip_dates->pluck('id')->toArray();
        foreach ($request->get('skip_dates', []) as $step => $skip_date) {
            if (isset($skip_date['id'])) {
                $campaign->skip_dates()->find($skip_date['id'])->update($skip_date);
                array_splice($existingSkipIds, array_search($skip_date['id'], $existingSkipIds), 1);
            } else {
                $campaign->skip_dates()->create($skip_date);
            }
        }
        $campaign->skip_dates()->whereIn('id', $existingSkipIds)->delete();


        // ###
        // Recalculate progress
        if ($campaign->emails()->count() > 0) {
            $campaignRepository = new CampaignRepository($campaign);
            $campaignRepository->recalculateProgress();
        }

        return response()->json(['message' => 'Campaign updated successfully']);
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    private function handleRemoveTags(Campaign $campaign, array $existingTags)
    {
        $subscriberCampaigns = $campaign->subscriberCampaigns()->with('subscriber.tags')->get();
        foreach ($subscriberCampaigns as $subscriberCampaign) {
            $intersect = array_intersect(
                $existingTags,
                $subscriberCampaign->subscriber->tag_ids
            );
            if ($intersect) {
                $subscriberCampaign->emails()->where('sent', false)->delete();
            }
        }
    }

    public function getOpenStats(Campaign $campaign)
    {
        $repository = new CampaignRepository($campaign);
        $campaignWithStats = $repository->loadCampaignWithStats();
        $openStats = $repository->getOpenStats();
        
        $result = [
            ...$campaignWithStats->toArray(),
            'open_stats' => $openStats
        ];
        
        return response()->json([
            'data' => $result
        ]);
    }

    public function getOpenedEmails(Campaign $campaign)
    {
        $repository = new CampaignRepository($campaign);
        $openedEmails = $repository->getOpenedEmails();
        
        return response()->json([
            'data' => $openedEmails
        ]);
    }
    
    public function getStats(Campaign $campaign)
    {
        $repository = new CampaignRepository($campaign);
        
        $campaignWithStats = $repository->loadCampaignWithStats();
        
        $openStats = $repository->getOpenStats();
        
        $subscribers = $campaign->subscribers();
        
        $totalEmails = $campaignWithStats->emails->count();
        $totalSubscribers = $subscribers->count();
        $totalSent = $campaignWithStats->emails->sum('sent_subscribers_count');
        $totalFailed = $campaignWithStats->emails->sum('failed_count');
        $totalOpened = $campaignWithStats->emails->sum('opened_count');
        $openRate = $totalSent > 0 ? ($totalOpened / $totalSent) * 100 : 0;
        
        $result = [
            ...$campaignWithStats->toArray(),
            'subscribers_count' => $totalSubscribers,
            'open_stats' => $openStats,
            'total_emails' => $totalEmails,
            'total_sent' => $totalSent,
            'total_failed' => $totalFailed,
            'total_opened' => $totalOpened,
            'open_rate' => round($openRate, 2),
        ];
        
        return response()->json([
            'data' => $result
        ]);
    }
}
