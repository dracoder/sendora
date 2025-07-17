<?php

namespace App\Repositories;

use App\Jobs\SendCampaignEmail;
use App\Models\Campaign;
use App\Models\Subscriber;
use App\Models\SubscriberCampaignEmail;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CampaignRepository
{
    protected $model;

    public function __construct(Campaign $campaign)
    {
        $this->model = $campaign;
    }

    public function getSubscribers($globalScoped = true)
    {
        if (!$globalScoped) {
            return Subscriber::query()
                ->withoutGlobalScopes()
                ->where('organization_id', $this->model->organization_id)
                ->where('is_subscribed', 1)
                ->whereHas('tags', function ($query) {
                    $query->whereIn('tag_id', $this->model->tags()->withoutGlobalScopes()->pluck('id'))
                        ->withoutGlobalScopes();
                });
        }
        return Subscriber::query()
            ->where('organization_id', $this->model->organization_id)
            ->where('is_subscribed', 1)
            ->whereHas('tags', function ($query) {
                $query->whereIn('tag_id', $this->model->tags->pluck('id'));
            });
    }

    public function handleNextMail(int $subscriberId)
    {
        $subscriber = Subscriber::withoutGlobalScopes()->find($subscriberId);
        $subscriberCampaign = $subscriber->campaigns()->firstOrCreate([
            'campaign_id' => $this->model->id
        ], [
            'campaign_id' => $this->model->id,
            'next_at' => now(),
        ]);

        // if there are emails that have not been sent, skip
        if ($subscriberCampaign->emails()->where('sent', false)->exists()) {
            return;
        }
        // if progress is 100%, skip
        if ($subscriberCampaign->progress >= 100) {
            return;
        }

        $lastEmail = $subscriberCampaign->emails()->orderBy('sent_at', 'desc')->first();
        $lastEmailSentAt = $lastEmail ? Carbon::parse($lastEmail->sent_at) : now();
        if (!$lastEmail) {
            $emailToSend = $this->model->emails()->active()->first();
        } else {
            $emailToSend = $this->model->emails()->active()->where('id', '>', $lastEmail->email_id)->first();
        }

        if ($emailToSend) {
            $scheduleAt = now();
            if ($emailToSend->delay_unit && $emailToSend->delay_value) {
                $scheduleAt = $lastEmailSentAt->add($emailToSend->delay_value, $emailToSend->delay_unit);
            }
            $subscriber->emails()->create([
                'subscriber_campaign_id' => $subscriberCampaign->id,
                'email_id' => $emailToSend->id,
                'scheduled_at' => $scheduleAt,
            ]);
            $subscriberCampaign->update(['next_at' => $scheduleAt]);

            if ($scheduleAt->isFuture()) {
                $delay = now()->diffInSeconds($scheduleAt);
                Log::info('Delay: ' . $delay);
                dispatch(new SendCampaignEmail($subscriber->id, $emailToSend->id))->delay($delay);
            } else {
                dispatch(new SendCampaignEmail($subscriber->id, $emailToSend->id));
            }
        }
    }

    public function recalculateProgress()
    {
        $subscribers = $this->getSubscribers(globalScoped: false)->get();

        foreach ($subscribers as $subscriber) {
            $subscriberCampaign = $subscriber->campaigns()->where('campaign_id', $this->model->id)->first();
            if (!$subscriberCampaign) {
                continue;
            }

            $progress = $this->updateProgress($subscriberCampaign);
            if ($progress == 0) {
                $this->handleNextMail($subscriber->id);
            }
        }
    }

    private function updateProgress($subscriberCampaign)
    {
        $sentIds = $subscriberCampaign->emails()->where('sent', true)->pluck('email_id')->toArray();
        $activeIds = $this->model->emails()->active()->pluck('id')->toArray();

        if (count($activeIds) == 0) {
            $progress = 100;
        } else {
            $intersect = array_intersect($activeIds, $sentIds);
            $progress = round((count($intersect) / count($activeIds)) * 100, 2);
            if ($progress > 100) {
                $progress = 100;
            }
        }

        $subscriberCampaign->update(['progress' => $progress]);
        return $progress;
    }

    public function loadCampaignWithStats()
    {
        $this->model->load([
            'emails' => function($query) {
                $query->withCount(['subscribersCampaigns as sent_subscribers_count' => function($q) {
                    $q->where('sent', 1);
                }])
                ->withCount(['subscribersCampaigns as opened_count' => function($q) {
                    $q->where('opened', 1);
                }])
                ->withCount(['subscribersCampaigns as failed_count' => function($q) {
                    $q->where('exception', '!=', null);
                }])
                //->withCount(['subscribersCampaigns as total_subscribers_count'])
                ;
            },
            'organization',
            'tags'
        ]);
        
        // $this->model->subscribers_list = $this->getSubscribers(globalScoped: true)->get();
        //$this->model->subscribers_count = $this->model->subscribers()->count();
        
        return $this->model;
    }
    
    public function getOpenStats()
    {
        $emails = $this->model->emails;
        $totalSubscribers = $this->model->subscribers_count;
        
        $stats = [
            'total_emails' => $emails->count(),
            'total_subscribers' => $totalSubscribers,
            'sent_count' => $emails->sum('sent_subscribers_count'),
            'opened_count' => $emails->sum('opened_count'),
        ];
        
        $denominator = ($stats['total_subscribers'] ?? 0) * ($stats['total_emails'] ?? 0);
        $stats['send_rate'] = ($denominator > 0) 
            ? round(($stats['sent_count'] ?? 0) / $denominator * 100, 2) 
            : 0;
            
        $stats['open_rate'] = $stats['sent_count'] > 0 
            ? round(($stats['opened_count'] / $stats['sent_count']) * 100, 2) 
            : 0;
        
        return $stats;
    }
    
    public function getEmailHistory($emailId, $page = 1, $perPage = 10, $filter = 'all', $dateFrom = null, $dateTo = null)
    {
        $page = (int) $page;
        $perPage = (int) $perPage;
        
        $query = SubscriberCampaignEmail::join('subscriber_campaigns', 'subscriber_campaign_emails.subscriber_campaign_id', '=', 'subscriber_campaigns.id')
            ->join('subscribers', 'subscriber_campaigns.subscriber_id', '=', 'subscribers.id')
            ->where('subscriber_campaign_emails.email_id', $emailId)
            ->where('subscriber_campaigns.campaign_id', $this->model->id);
        
        if ($filter === 'failed') {
            $query->where(function($q) {
                $q->whereNotNull('subscriber_campaign_emails.exception')
                    ->where('subscriber_campaign_emails.exception', '!=', '');
            });
        } else {
            $query->where(function($q) {
                $q->whereNull('subscriber_campaign_emails.exception')
                  ->orWhere('subscriber_campaign_emails.exception', '');
            });
        }
        
        if ($dateFrom || $dateTo) {
            if ($filter == 'failed') {
                if ($dateFrom && $dateTo) {
                    $query->whereDate('subscriber_campaign_emails.failed_at', '>=', $dateFrom)
                          ->whereDate('subscriber_campaign_emails.failed_at', '<=', $dateTo);
                } elseif ($dateFrom) {
                    $query->whereDate('subscriber_campaign_emails.failed_at', '>=', $dateFrom);
                } elseif ($dateTo) {
                    $query->whereDate('subscriber_campaign_emails.failed_at', '<=', $dateTo);
                }
            } else {
                if ($dateFrom && $dateTo) {
                    $query->whereDate('subscriber_campaign_emails.sent_at', '>=', $dateFrom)
                          ->whereDate('subscriber_campaign_emails.sent_at', '<=', $dateTo);
                } elseif ($dateFrom) {
                    $query->whereDate('subscriber_campaign_emails.sent_at', '>=', $dateFrom);
                } elseif ($dateTo) {
                    $query->whereDate('subscriber_campaign_emails.sent_at', '<=', $dateTo);
                }
            }
        }
        
        $query->select(
            'subscriber_campaign_emails.id',
            'subscribers.email',
            'subscribers.first_name',
            'subscribers.last_name',
            'subscriber_campaign_emails.sent_at',
            'subscriber_campaign_emails.failed_at',
            'subscriber_campaign_emails.exception',
            'subscriber_campaign_emails.opened',
            'subscriber_campaign_emails.opened_at'
        )
        ->orderBy('subscriber_campaign_emails.sent_at', 'desc');
            
        $total = $query->count();
        
        $items = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        $history = $items->map(function ($item) {
            $name = '';
            if (!empty($item->first_name) || !empty($item->last_name)) {
                $name = trim($item->first_name . ' ' . $item->last_name);
            }
            
            if (empty($name)) {
                $emailParts = explode('@', $item->email);
                $name = $emailParts[0];
            }
            
            return [
                'id' => $item->id,
                'name' => $name,
                'email' => $item->email,
                'sent_at' => $item->sent_at,
                'failed_at' => $item->failed_at,
                'opened' => (bool) $item->opened,
                'opened_at' => $item->opened_at,
                'exception' => $item->exception
            ];
        });
        
        return [
            'data' => $history,
            'current_page' => (int) $page,
            'last_page' => ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total
        ];
    }
    
    public function retryEmail($subscriberCampaignEmailId)
    {
        $emailRecord = SubscriberCampaignEmail::find($subscriberCampaignEmailId);
        
        if (!$emailRecord) {
            return false;
        }
        
        $subscriberCampaign = $emailRecord->subscriberCampaign;
        $subscriber = $subscriberCampaign->subscriber;
        $email = $emailRecord->email;
        
        $emailRecord->exception = null;
        $emailRecord->save();
        
        SendCampaignEmail::dispatch(
            $this->model,
            $subscriber,
            $email,
            $subscriberCampaign,
            $emailRecord
        );
        
        return true;
    }
    
    public function trackEmailOpen($emailId, $subscriberId)
    {
        $record = SubscriberCampaignEmail::where('email_id', $emailId)
            ->where('subscriber_id', $subscriberId)
            ->first();
            
        if ($record) {
            $record->opened = true;
            $record->opened_at = now();
            $record->save();
            
            return $record;
        }
        
        return null;
    }
    
    public function getOpenedEmails()
    {
        $campaignId = $this->model->id;
        
        $openedEmails = SubscriberCampaignEmail::join('subscriber_campaigns', 'subscriber_campaign_emails.subscriber_campaign_id', '=', 'subscriber_campaigns.id')
            ->join('subscribers', 'subscriber_campaigns.subscriber_id', '=', 'subscribers.id')
            ->where('subscriber_campaigns.campaign_id', $campaignId)
            ->where('subscriber_campaign_emails.opened', true)
            ->select(
                'subscribers.id as subscriber_id',
                'subscribers.email as subscriber_email',
                'subscribers.name as subscriber_name',
                DB::raw('COUNT(subscriber_campaign_emails.id) as open_count'),
                DB::raw('MIN(subscriber_campaign_emails.opened_at) as opened_at')
            )
            ->groupBy('subscribers.id', 'subscribers.email', 'subscribers.name')
            ->orderBy('open_count', 'desc')
            ->get();
        
        return $openedEmails;
    }
}
