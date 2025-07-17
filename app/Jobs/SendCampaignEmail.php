<?php

namespace App\Jobs;

use App\Models\CreditTransaction;
use App\Models\Email;
use App\Models\Subscriber;
use App\Models\User;
use App\Repositories\EmailRepository;
use App\Repositories\OrganizationRepository;
use App\Services\CreditService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendCampaignEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected $subscriberId,
        protected $emailId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $email = Email::query()
                ->withoutGlobalScopes()
                ->with(['campaign' => function ($query) {
                    $query->withoutGlobalScopes()
                        ->with([
                            'organization' => function ($query) {
                                $query
                                    ->withoutGlobalScopes();
                            },
                            'skip_dates' => function ($query) {
                                $query
                                    ->where('from', '<=', now())
                                    ->where('to', '>=', now());
                            }
                        ]);
                }])
                ->find($this->emailId);
                
            if (!$email) {
                Log::error("Email not found: {$this->emailId}");
                return;
            }
    
            // check if the user has no subscriptions
            $user = User::withoutGlobalScopes()->find($email->campaign->organization->user_id);
            if (!$user) {
                Log::error("User not found for organization: {$email->campaign->organization->id}");
                return;
            }
            
            if (!$user->activeSubscription()) {
                if($user->available_credits <= 0){
                    // Out of credits exception
                    Log::warning("User {$user->id} has no credits available");
                    return;
                }
            }

            $organizationRepository = new OrganizationRepository($email->campaign->organization);
            if ($organizationRepository->dailyLimitReached()) {
                $nextDay = now()->addDay();
                $delay = $nextDay->diffInSeconds(now());
                dispatch(new SendCampaignEmail($this->subscriberId, $this->emailId))->delay($delay);
            } else {
                $skipped = false;
                if ($email->campaign->skip_dates()->count()) {
                    // check if any skip date is skipping today
                    $skipped = $email->campaign->skip_dates()->where('from', '<=', now())->where('to', '>=', now())->first();
                }

                $subscriber = Subscriber::withoutGlobalScopes()->find($this->subscriberId);
                
                if (!$subscriber) {
                    Log::error("Subscriber not found: {$this->subscriberId}");
                    return;
                }

                if ($skipped) {
                    // try {
                    //     // Batch credit deduction for skipped emails
                    //     $this->batchCreditDeduction(
                    //         $user,
                    //         $email->campaign,
                    //         'skipped'
                    //     );
                    // } catch (\Exception $e) {
                    //     Log::error("Failed to deduct credits for skipped email: {$e->getMessage()}");
                    //     return;
                    // }

                    $slot = $skipped;
                    $delay = now()->diffInSeconds($slot->to);
                    dispatch(new SendCampaignEmail($this->subscriberId, $this->emailId))->delay($delay);
                } else {
                    // try {
                    //     $this->batchCreditDeduction(
                    //         $user,
                    //         $email->campaign,
                    //         'sent'
                    //     );
                    // } catch (\Exception $e) {
                    //     Log::error("Failed to deduct credits for sent email: {$e->getMessage()}");
                    //     return;
                    // }

                    $emailRepository = new EmailRepository($email);
                    $emailRepository->send($this->subscriberId);
                }
            }

            sleep(rand(1, 5));
        } catch (\Exception $e) {
            Log::error("Failed to send email: {$e->getMessage()}");
        }
    }



    //                 'email_count' => 0,
    //             ],
    //         ]);
    //     });
        
    //     DB::transaction(function () use ($user, $batchTransaction) {
    //         // Update the batch transaction
    //         $metadata = $batchTransaction->metadata;
    //         $metadata['email_count'] = ($metadata['email_count'] ?? 0) + 1;
    //         $metadata['last_processed_at'] = now()->toDateTimeString();
    //         $batchTransaction->metadata = $metadata;
    //         $batchTransaction->amount -= 1;
    //         $batchTransaction->save();
            
    //         // Update credit balance
    //         $creditService = app(CreditService::class);
    //         $creditService->adjustUserCredits($user, -1);
    //     });
    // }
}
