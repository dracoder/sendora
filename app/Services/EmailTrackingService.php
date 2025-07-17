<?php

namespace App\Services;

use App\Models\EmailTracking;
use App\Models\SubscriberCampaignEmail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class EmailTrackingService
{

    public function createTrackingRecord(SubscriberCampaignEmail $subscriberCampaignEmail)
    {
        $trackingId = (string) Str::uuid();
        
        $subscriberCampaignEmail->tracking_id = $trackingId;
        $subscriberCampaignEmail->save();
        
        EmailTracking::create([
            'subscriber_campaign_email_id' => $subscriberCampaignEmail->id,
            'tracking_id' => $trackingId,
            'open_count' => 0,
        ]);
        
        return $trackingId;
    }
    
    public function addTrackingPixel($content, $trackingId)
    {
        $trackingUrl = URL::to(route('email.track', ['trackingId' => $trackingId], false));
        
        $trackingPixel = '<img src="' . $trackingUrl . '" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin:0!important;padding:0!important;" />';
        

        if (strpos($content, '</body>') !== false) {
            $content = str_replace('</body>', $trackingPixel . '</body>', $content);
        } else {
            $content .= $trackingPixel;
        }
        
        return $content;
    }
    
    public function recordOpen($trackingId, $ipAddress = null, $userAgent = null)
    {
        $subscriberCampaignEmail = SubscriberCampaignEmail::where('tracking_id', $trackingId)->first();
        
        if (!$subscriberCampaignEmail) {
            return null;
        }
        
        $tracking = EmailTracking::firstOrCreate(
            ['subscriber_campaign_email_id' => $subscriberCampaignEmail->id],
            ['tracking_id' => $trackingId]
        );
        
        $tracking->opened_at = $tracking->opened_at ?? now();
        $tracking->ip_address = $ipAddress;
        $tracking->user_agent = $userAgent;
        $tracking->open_count += 1;
        $tracking->save();
        
        if (!$subscriberCampaignEmail->opened) {
            $subscriberCampaignEmail->opened = true;
            $subscriberCampaignEmail->opened_at = now();
            $subscriberCampaignEmail->save();
        }
        
        return $tracking;
    }
    
    public function getCampaignOpenStats($campaignId)
    {
        $stats = [
            'total_sent' => 0,
            'total_opened' => 0,
            'open_rate' => 0,
            'unique_opens' => 0,
            'total_opens' => 0,
        ];
        
        $sentEmails = SubscriberCampaignEmail::join('subscriber_campaigns', 'subscriber_campaign_emails.subscriber_campaign_id', '=', 'subscriber_campaigns.id')
            ->where('subscriber_campaigns.campaign_id', $campaignId)
            ->where('subscriber_campaign_emails.sent', true)
            ->get();
        
        $stats['total_sent'] = $sentEmails->count();
        
        if ($stats['total_sent'] > 0) {
            $openedEmails = $sentEmails->filter(function ($email) {
                return $email->opened;
            });
            
            $stats['total_opened'] = $openedEmails->count();
            $stats['open_rate'] = round(($stats['total_opened'] / $stats['total_sent']) * 100, 2);
            
            // Get total opens (including multiple opens by same recipient)
            $totalOpens = EmailTracking::whereIn('subscriber_campaign_email_id', $sentEmails->pluck('id'))
                ->sum('open_count');
                
            $stats['total_opens'] = $totalOpens;
            $stats['unique_opens'] = $stats['total_opened'];
        }
        
        return $stats;
    }
}