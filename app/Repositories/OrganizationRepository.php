<?php

namespace App\Repositories;

use App\Models\Organization;
use App\Models\SubscriberCampaignEmail;

class OrganizationRepository
{
    protected $model;

    public function __construct(Organization $organization)
    {
        $this->model = $organization;
    }

    public function getMailer()
    {
        $settings = $this->model->settings;
        $smtp = null;

        if ($settings && $settings->smtp) {
            $smtp = $settings->smtp;
        }

        if (!$smtp || !$smtp['host'] || !$smtp['port']) {
            return null;
        }
        if ($smtp) return custom_mailer($smtp);
    }

    public function dailyLimitReached()
    {
        $dailyLimit = $this->getDailyLimit();
        if ($dailyLimit === 0 || is_null($dailyLimit)) {
            return false;
        }

        $emailsSent = SubscriberCampaignEmail::join('emails', 'emails.id', '=', 'subscriber_campaign_emails.email_id')
            ->join('campaigns', 'campaigns.id', '=', 'emails.campaign_id')
            ->where('organization_id', $this->model->id)
            ->whereDate('sent_at', now())
            ->count();
        return $emailsSent >= $dailyLimit;
    }

    private function getDailyLimit()
    {
        if (!$this->model->settings || !$this->model->settings->daily_limit) {
            return 0;
        }
        return $this->model->settings->daily_limit;
    }
}
