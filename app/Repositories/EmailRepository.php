<?php

namespace App\Repositories;

use App\Mail\EmailMail;
use App\Models\Campaign;
use App\Models\Email;
use App\Models\Subscriber;
use App\Models\Template;
use App\Models\User;
use App\Services\EmailTrackingService;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailRepository
{
    public const UNSUBSCRIBE_ENDPOINT = '/unsubscribe';

    protected $model;
    protected $trackingService;

    public function __construct(Email $email)
    {
        $this->model = $email;
        $this->trackingService = new EmailTrackingService();
    }

    public function generateFakeBody($locale = 'en_US')
    {
        $emailData = [
            'id' => fake($locale)->randomNumber(),
            'full_name' => fake($locale)->name(),
            'first_name' => fake($locale)->firstName(),
            'last_name' => fake($locale)->lastName(),
            'email' => fake($locale)->safeEmail(),
            'phone' => fake($locale)->phoneNumber(),
            'email_status' => fake($locale)->randomElement(['Active', 'Inactive']),
            'company' => fake($locale)->company(),
            'industry' => fake($locale)->randomElement(['IT', 'Finance', 'Health']),
            'location' => fake($locale)->city(),

            'linkedin_url' => fake($locale)->url(),
            'note' => fake($locale)->sentence(),
        ];

        return $this->handleBody($emailData);
    }

    public function test($receiver, $locale)
    {
        $body = $this->generateFakeBody($locale);

        try {
            $organizationRepository = new OrganizationRepository($this->model->campaign->organization);
            $mailer = $organizationRepository->getMailer();
            if ($mailer) {
                $mailer->to($receiver)
                    ->send(new EmailMail($this->model->subject, $body));
            } else {
                Mail::to($receiver)
                    ->send(new EmailMail($this->model->subject, $body));
            }

            return true;
        } catch (\Exception $e) {
            // Log the error or handle accordingly
            Log::error("Email sending failed: " . $e->getMessage());
            return false;
        }
    }

    public function send(int $subscriberId)
    {
        $subscriber = Subscriber::withoutGlobalScopes()->find($subscriberId);

        $campaignEmail = $this->model->subscribersCampaigns()
            ->where('subscriber_id', $subscriberId)
            ->first();
        if ($campaignEmail && $campaignEmail->sent) return;
        if (!$subscriber->is_subscribed) return;

        $campaignRepository = new CampaignRepository($this->model->campaign);
        if (!$campaignRepository->getSubscribers(globalScoped: false)
            ->where('id', $subscriber->id)
            ->exists()) {
            $campaignEmail->delete();
            return;
        };

        try {
            $campaignEmail->update(['retry' => false]);
            if ($this->model->is_active) {
                
                $user = User::withoutGlobalScopes()->find($this->model->campaign->organization->user_id);
                if (!$user) {
                    throw new \Exception("User not found for organization: {$this->model->campaign->organization->id}");
                }
                
                if ($user->available_credits <= 0 && !$user->activeSubscription()) {
                    Log::error("User {$user->id} has no credits available");
                    
                    $data = [
                        'message' => __('messages.insufficient_credits'),
                        'available_credits' => 0,
                        'error' => 'insufficient_credits',
                        'status' => 402
                    ];
                    
                    throw new \App\Exceptions\CreditException($data);
                }
                
                $deducted = $user->deductCredits(1);
                if ($deducted === 0) {
                    Log::error("Credits deduction failed for user {$user->id}");
                    
                    $data = [
                        'message' => __('messages.credit_deduction_failed'),
                        'available_credits' => $user->available_credits,
                        'error' => 'credit_deduction_failed',
                        'status' => 400
                    ];
                    
                    throw new \App\Exceptions\CreditException($data);
                }
                                
                $emailData = [
                    'id' => $subscriber->id,
                    'full_name' => $subscriber->name,
                    'first_name' => $subscriber->first_name,
                    'last_name' => $subscriber->last_name,
                    'email' => $subscriber->email,
                    'phone' => $subscriber->phone,
                    'email_status' => $subscriber->email_status ?? '',
                    'company' => $subscriber->company ?? '',
                    'industry' => $subscriber->industry ?? '',
                    'location' => $subscriber->location ?? '',
                    //'profile_picture' => $subscriber->profile_picture ?? '',
                    'linkedin_url' => $subscriber->linkedin_url ?? '',
                    'note' => $subscriber->note ?? ''
                ];

                $trackingId = $this->trackingService->createTrackingRecord($campaignEmail);

                $data = [
                    'subject' => $this->handleSubject($emailData),
                    'body' => $this->handleBody($emailData),
                ];

                $data['body'] = $this->trackingService->addTrackingPixel($data['body'], $trackingId);

                $organizationRepository = new OrganizationRepository($this->model->campaign->organization);
                $mailer = $organizationRepository->getMailer();
                if ($mailer) {
                    $mailer->to($subscriber->email)
                        ->send(new EmailMail($data['subject'], $data['body']));
                } else {
                    Mail::to($subscriber->email)
                        ->send(new EmailMail($data['subject'], $data['body']));
                }
                $campaignEmail->update(['sent' => 1, 'sent_at' => now()]);
            }

            $sentCount = $subscriber->campaigns()->withoutGlobalScopes()->where('campaign_id', $this->model->campaign_id)->first()->emails()->where('sent', true)->count();
            $emailCount = $this->model->campaign->emails()->active()->count();
            $progress = $sentCount / $emailCount * 100;
            $progress = round($progress, 2);
            if ($progress > 100) {
                $progress = 100;
            }
            $subscriber->campaigns()->withoutGlobalScopes()->where('campaign_id', $this->model->campaign_id)->update(['progress' => $progress]);
            if ($progress < 100) {
                $campaignRepository = new CampaignRepository(Campaign::withoutGlobalScopes()->find($this->model->campaign_id));
                $campaignRepository->handleNextMail($subscriber->id);
            }
        } catch (\Exception $exception) {
            Log::error($exception);
            if ($campaignEmail) {
                $campaignEmail->update([
                    'sent' => 0,
                    'exception' => $exception->getMessage(),
                    'failed_at' => now()
                ]);
            }
        }
    }

    private function addContentToTemplate()
    {
        $body = '';

        $template = Template::withoutGlobalScopes()->find($this->model->campaign->template_id);
        if ($template && $template->content) {
            if (strpos($template->content, '{{content}}') !== false) {
                $body = str_replace('{{content}}', $this->model->content, $template->content);
            } else {
                $body = $template->content . $this->model->content;
            }
        }

        return $body;
    }

    private function handleSubject($data = [])
    {
        $subject = $this->model->subject;
        foreach ($data as $key => $value) {
            $subject = str_replace('{{' . $key . '}}', $value, $subject);
        }
        return $subject;
    }

    private function handleBody($data)
    {
        $body = $this->addContentToTemplate();

        if (isset($data['id']) && $data['id']) {
            $unsubscribeLink = $this->generateUnsubscribeLink($data['id']);
            $body = str_replace('{{unsubscribe_link}}', $unsubscribeLink, $body);
        }

        $body = $this->processConditions($body, $data);

        foreach ($data as $key => $value) {
            $body = str_replace('{{' . $key . '}}', $value, $body);
        }
        return $body;
    }

    private function processConditions($body, $data)
    {
        $offset = 0;

        while (preg_match('/@if\(/', $body, $openingMatch, PREG_OFFSET_CAPTURE, $offset)) {
            $openingPosition = $openingMatch[0][1];
            $conditionStart = $openingPosition + strlen($openingMatch[0][0]);
            $currentPos = $conditionStart;
            $parenthesisCount = 1;


            while ($parenthesisCount > 0 && $currentPos < strlen($body)) {
                $char = $body[$currentPos];
                if ($char === '(') {
                    $parenthesisCount++;
                } elseif ($char === ')') {
                    $parenthesisCount--;
                }
                $currentPos++;
            }


            $conditionKey = substr($body, $conditionStart, $currentPos - $conditionStart - 1);
            $conditionKey = strip_tags($conditionKey);
            $offset = $currentPos;
            $isConditionTrue = !empty($data[$conditionKey]);
            $ifContent = '';
            $elseContent = '';
            $hasElse = false;
            $hasEndIf = false;

            $contentStart = $currentPos;


            if (preg_match('/@else/', $body, $elseMatch, PREG_OFFSET_CAPTURE, $offset)) {
                $hasElse = true;
                $elsePosition = $elseMatch[0][1];
                $contentEnd = $elsePosition;
                $content = substr($body, $contentStart, $contentEnd - $contentStart);
                $ifContent = $content;
                $offset = $elsePosition + strlen($elseMatch[0][0]);
            }


            if (preg_match('/@endif/', $body, $closingMatch, PREG_OFFSET_CAPTURE, $offset)) {
                $hasEndIf = true;
                $closingPosition = $closingMatch[0][1];
                $contentEnd = $closingPosition;
                $content = substr($body, $offset, $contentEnd - $offset);
                if ($hasElse) {
                    $elseContent = $content;
                } else {
                    $ifContent = $content;
                }
                $offset = $closingPosition + strlen($closingMatch[0][0]);
            }

            $ifContent = $isConditionTrue ? $ifContent : $elseContent;
            if ($hasEndIf) {
                $oldLendth = strlen($body);
                $body = substr_replace($body, $ifContent, $openingPosition, $offset - $openingPosition);
                $offset = $offset - ($oldLendth - strlen($body));
            }
        }

        return $body;
    }

    private static function generateUnsubscribeLink($subscriberId)
    {
        $encryptedId = Crypt::encryptString($subscriberId);
        return trim(config('app.url'), '/') . self::UNSUBSCRIBE_ENDPOINT . '/' . $encryptedId;
    }
}
