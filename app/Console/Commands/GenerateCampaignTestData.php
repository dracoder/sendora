<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\Email;
use App\Models\Organization;
use App\Models\Subscriber;
use App\Models\SubscriberCampaign;
use App\Models\SubscriberCampaignEmail;
use App\Models\User;
use Faker\Factory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateCampaignTestData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaign:generate-test-data 
                            {--subscribers=50 : Number of subscribers to create}
                            {--emails=3 : Number of emails in the campaign}
                            {--user_id= : Specific user ID to use (optional)}
                            {--organization_id= : Specific organization ID to use (optional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate test data for campaign statistics and history';

    protected $faker;
    protected $user;
    protected $organization;
    protected $campaign;
    protected $emails = [];
    protected $subscribers = [];
    protected $sentCount = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->faker = Factory::create();
        
        try {
            $this->info('Starting to generate campaign test data...');
            
            $this->setupUserAndOrganization();
            $this->createCampaign();
            $this->createEmails();
            $this->createSubscribers($this->option('subscribers'));
            $this->createEmailHistory();
            $this->updateCampaignStats();

            $this->info($this->generateSummary());
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Campaign test data generation error: ' . $e->getMessage());
            $this->error('Error generating campaign test data: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }

    protected function setupUserAndOrganization()
    {
        $userId = $this->option('user_id');
        $organizationId = $this->option('organization_id');
        
        if ($userId) {
            $this->user = User::find($userId);
            if (!$this->user) {
                throw new \Exception("User with ID {$userId} not found");
            }
        } else {
            $this->user = User::first() ?? User::factory()->create();
        }
        
        $this->info("Using user: {$this->user->email} (ID: {$this->user->id})");
        
        if ($organizationId) {
            $this->organization = Organization::find($organizationId);
            if (!$this->organization) {
                throw new \Exception("Organization with ID {$organizationId} not found");
            }
        } else {
            // Try to get the organization
            $this->organization = Organization::where('user_id', $this->user->id)->first();
            
            // If no organization found, create one
            if (empty($this->organization)) {
                $this->organization = new Organization([
                    'user_id' => $this->user->id,
                    'name' => 'Test Organization',
                    'email' => $this->faker->companyEmail(),
                    'owner_name' => $this->faker->name(),
                    'phone' => $this->faker->phoneNumber()
                ]);
                $this->organization->save();
            }
        }
        
        $this->info("Using organization: {$this->organization->name} (ID: {$this->organization->id})");
    }

    protected function createCampaign()
    {
        $this->campaign = Campaign::create([
            'organization_id' => $this->organization->id,
            'name' => 'Marketing Campaign ' . now()->format('Y-m-d H:i'),
            'description' => 'Test campaign for statistics visualization',
            'is_active' => true,
            'start_at' => now()->subDays(30),
        ]);
        
        $this->info("Created campaign: {$this->campaign->name} (ID: {$this->campaign->id})");
    }

    protected function createEmails()
    {
        $emailCount = $this->option('emails');
        $this->info("Creating {$emailCount} emails for the campaign...");
        
        $emailTitles = [
            'Welcome Email', 'Product Introduction', 'Special Offer', 
            'Follow-up', 'Feedback Request', 'New Features', 
            'Testimonials', 'Case Study', 'Discount Offer'
        ];
        
        $emailSubjects = [
            'Welcome to our service', 'Discover our products', 'Special discount just for you',
            'Following up on your interest', 'We value your feedback', 'Check out our new features',
            'See what others are saying', 'How we helped Company X', 'Limited time offer: 20% off'
        ];

        for ($i = 0; $i < min($emailCount, count($emailTitles)); $i++) {
            $this->emails[] = Email::create([
                'campaign_id' => $this->campaign->id,
                'title' => $emailTitles[$i],
                'subject' => $emailSubjects[$i],
                'content' => "<h1>{$emailTitles[$i]}</h1><p>This is test content for email " . ($i + 1) . "</p><p>{$this->faker->paragraph(5)}</p>",
                'step' => $i + 1,
                'delay_unit' => 'days',
                'delay_value' => $i + 1,
                'is_active' => true,
            ]);
            
            $this->sentCount[$i] = 0;
            $this->info("Created email: {$emailTitles[$i]} (ID: {$this->emails[$i]->id})");
        }
    }

    protected function createSubscribers($count)
    {
        $this->info("Creating {$count} subscribers...");
        
        for ($i = 0; $i < $count; $i++) {
            $this->subscribers[] = Subscriber::create([
                'organization_id' => $this->organization->id,
                'name' => $this->faker->name,
                'email' => $this->faker->unique()->safeEmail,
                'is_subscribed' => true,
            ]);
        }
        
        $this->info("Created {$count} subscribers");
    }

    protected function randomDate($startDate, $endDate)
    {
        $startTimestamp = strtotime($startDate);
        $endTimestamp = strtotime($endDate);
        $randomTimestamp = mt_rand($startTimestamp, $endTimestamp);
        
        return date('Y-m-d H:i:s', $randomTimestamp);
    }

    protected function createEmailHistory()
    {
        $this->info("Generating email history for subscribers...");
        
        $progressBar = $this->output->createProgressBar(count($this->subscribers));
        $progressBar->start();
        
        foreach ($this->subscribers as $subscriber) {
            // Create subscriber campaign
            $subscriberCampaign = SubscriberCampaign::create([
                'subscriber_id' => $subscriber->id,
                'campaign_id' => $this->campaign->id,
                'next_at' => now(),
                'progress' => mt_rand(1, 100),
            ]);
            
            // For each email, decide if it was sent and if it succeeded
            foreach ($this->emails as $index => $email) {
                // Different success rates for different emails
                $sendProbability = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15][$index % 9];
                $shouldSend = (mt_rand(0, 100) / 100) < $sendProbability;
                
                if ($shouldSend) {
                    $this->sentCount[$index]++;
                    $sentAt = $this->randomDate(
                        now()->subDays(30)->format('Y-m-d H:i:s'), 
                        now()->format('Y-m-d H:i:s')
                    );
                    
                    $hasError = (mt_rand(0, 100) / 100) < 0.15; // 15% chance of error
                    
                    SubscriberCampaignEmail::create([
                        'subscriber_campaign_id' => $subscriberCampaign->id,
                        'subscriber_id' => $subscriber->id,
                        'email_id' => $email->id,
                        'scheduled_at' => $this->randomDate(
                            now()->subDays(35)->format('Y-m-d H:i:s'), 
                            $sentAt
                        ),
                        'sent' => !$hasError,
                        'sent_at' => $hasError ? null : $sentAt,
                        'retry' => $hasError,
                        'exception' => $hasError ? $this->faker->randomElement([
                            'SMTP connection failed',
                            'Recipient address rejected',
                            'Mailbox unavailable',
                            'Connection timed out',
                            'Message size exceeds limit',
                            'Invalid email address',
                            'DNS lookup failure',
                            'Authentication required',
                            'Relay access denied',
                            'Mailbox full'
                        ]) : null,
                        'failed_at' => $hasError ? $sentAt : null,
                    ]);
                }
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
    }

    protected function updateCampaignStats()
    {
        $this->info("Updating campaign statistics...");
        
        $this->campaign->load(['emails' => function($query) {
            $query->withCount(['subscribersCampaigns as sent_subscribers_count' => function($q) {
                $q->where('sent', true);
            }]);
        }]);
    }

    protected function generateSummary()
    {
        $summary = "\n=== Campaign Test Data Summary ===\n";
        $summary .= "Created campaign '{$this->campaign->name}' with " . count($this->emails) . " emails\n";
        $summary .= "Added " . count($this->subscribers) . " subscribers to the campaign\n";
        $summary .= "Email sent statistics:\n";

        foreach ($this->campaign->emails as $index => $email) {
            $deliveryRate = count($this->subscribers) > 0 
                ? round(($this->sentCount[$index] / count($this->subscribers)) * 100, 2) 
                : 0;
                
            $summary .= "- {$email->title}: {$email->sent_subscribers_count} sent out of " . 
                count($this->subscribers) . " ({$deliveryRate}% delivery rate)\n";
        }

        $summary .= "\nYou can now view the campaign stats by visiting the campaign page and clicking 'View Statistics'";
        $summary .= "\nCampaign ID: {$this->campaign->id}";
        $summary .= "\nOrganization ID: {$this->organization->id}";
        $summary .= "\nUser ID: {$this->user->id}";
        
        return $summary;
    }
}