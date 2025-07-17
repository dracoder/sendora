<?php

use App\Jobs\AllocateSubscriptionCredits;
use App\Jobs\ExpireSubscriptionCredits;
use Illuminate\Support\Facades\Schedule;

Schedule::command('campaign:send-email')->everyMinute()->withoutOverlapping();
Schedule::job(new ExpireSubscriptionCredits())->dailyAt('00:00');
Schedule::job(new AllocateSubscriptionCredits())->dailyAt('01:00');

