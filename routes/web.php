<?php

use App\Http\Controllers;
use App\Http\Middleware\{
    ResourceGetter,
    SearchableIndex,
    Locale
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

Route::get('/', function () {
    // redirect to login
    return redirect()->route('login');
});

Route::get('unsubscribe/{token}', [Controllers\SubscriberController::class, 'unsubscribe'])->name('subscribers.unsubscribe');

Route::post('locale', function (Request $request) {
    App::setLocale($request->get('locale', 'en'));
    Session::put('language', $request->get('locale', 'en'));
})->name('locale');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', Locale::class])->name('dashboard');

Route::middleware(['auth', Locale::class])->group(function () {
    Route::get('select-options/{model}', [Controllers\SelectController::class, 'selectOptions'])->name('select.options');

    Route::get('subscribe', [Controllers\StripeController::class, 'subscribe'])->name('subscribe');
    Route::group(['prefix' => 'stripe', 'as' => 'stripe.'], function () {
        Route::post('setup-intent', [Controllers\StripeController::class, 'createSetupIntent'])->name('setup-intent');
        Route::post('subscribe', [Controllers\StripeController::class, 'createSubscription'])->name('subscribe');
        Route::get('payment-history', [Controllers\StripeController::class, 'paymentHistory'])->name('payment-history');
        Route::post('cancel-subscription', [Controllers\StripeController::class, 'cancelSubscription'])->name('cancel-subscription');
        Route::get('update-payment-method', [Controllers\StripeController::class, 'updatePaymentMethod'])->name('update-payment-method');
    });

    Route::group(['prefix' => 'data', 'as' => 'data.'], function () {
        Route::get('countries', [Controllers\SelectController::class, 'countries'])->name('countries');
    });

    Route::group(['prefix' => 'profile', 'as' => 'profile.'], function () {
        Route::get('/', [Controllers\ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [Controllers\ProfileController::class, 'update'])->name('update');
        Route::post('/', [Controllers\ProfileController::class, 'destroy'])->name('destroy');
    })->middleware(Locale::class);

    Route::get('users', [Controllers\UserController::class, 'index'])->name('users.index')->middleware([SearchableIndex::class . ':User']);
    Route::resource('users', Controllers\UserController::class)->except(['index', 'show']);
    Route::get('users/{user}', [Controllers\UserController::class, 'show'])->name('users.show')->middleware([ResourceGetter::class . ':user']);

    Route::get('organizations', [Controllers\OrganizationController::class, 'index'])->name('organizations.index')->middleware([SearchableIndex::class . ':Organization']);
    Route::resource('organizations', Controllers\OrganizationController::class)->except(['index', 'show']);
    Route::get('organizations/{organization}', [Controllers\OrganizationController::class, 'show'])->name('organizations.show')->middleware([ResourceGetter::class . ':organization']);

    Route::get('tags', [Controllers\TagController::class, 'index'])->name('tags.index')->middleware([SearchableIndex::class . ':Tag']);
    Route::resource('tags', Controllers\TagController::class)->except(['index', 'show']);
    Route::get('tags/{tag}', [Controllers\TagController::class, 'show'])->name('tags.show')->middleware([ResourceGetter::class . ':tag']);

    Route::get('subscribers', [Controllers\SubscriberController::class, 'index'])->name('subscribers.index')->middleware([SearchableIndex::class . ':Subscriber']);
    Route::resource('subscribers', Controllers\SubscriberController::class)->except(['index', 'show']);
    Route::get('subscribers/{subscriber}', [Controllers\SubscriberController::class, 'show'])->name('subscribers.show')->middleware([ResourceGetter::class . ':subscriber']);

    Route::get('templates', [Controllers\TemplateController::class, 'index'])->name('templates.index')->middleware([SearchableIndex::class . ':Template']);
    Route::resource('templates', Controllers\TemplateController::class)->except(['index', 'show']);
    Route::get('templates/{template}', [Controllers\TemplateController::class, 'show'])->name('templates.show')->middleware([ResourceGetter::class . ':template']);

    Route::get('campaigns', [Controllers\CampaignController::class, 'index'])->name('campaigns.index')->middleware([SearchableIndex::class . ':Campaign']);
    Route::resource('campaigns', Controllers\CampaignController::class)->except(['index', 'show']);
    Route::get('campaigns/{campaign}', [Controllers\CampaignController::class, 'show'])->name('campaigns.show')->middleware([ResourceGetter::class . ':campaign']);

    Route::post('emails/test-smtp', [Controllers\EmailController::class, 'testSmtp'])->name('emails.test-smtp');
    Route::post('emails/{email}/preview', [Controllers\EmailController::class, 'preview'])->name('emails.preview');
    Route::post('emails/{email}/test', [Controllers\EmailController::class, 'test'])->name('emails.test');

    Route::get('plans', [Controllers\SubscriptionPlanController::class, 'index'])->name('plans.index')->middleware([SearchableIndex::class . ':SubscriptionPlan']);
    Route::resource('plans', Controllers\SubscriptionPlanController::class)->except(['index', 'show']);
    Route::get('plans/{plan}', [Controllers\SubscriptionPlanController::class, 'show'])->name('plans.show')->middleware([ResourceGetter::class . ':plan']);

    Route::get('subscriptions', [Controllers\SubscriptionController::class, 'index'])->name('subscriptions.index')->middleware([SearchableIndex::class . ':Subscription']);
    Route::resource('subscriptions', Controllers\SubscriptionController::class)->except(['index', 'show']);
    Route::get('subscriptions/{subscription}', [Controllers\SubscriptionController::class, 'show'])->name('subscriptions.show')->middleware([ResourceGetter::class . ':subscription']);

    Route::get('api-keys', [Controllers\ApiKeyController::class, 'index'])->name('api-keys.index')->middleware([SearchableIndex::class . ':ApiKey']);
    Route::resource('api-keys', Controllers\ApiKeyController::class)->except(['index', 'show']);
    Route::get('api-keys/{apiKey}', [Controllers\ApiKeyController::class, 'show'])->name('api-keys.show')->middleware([ResourceGetter::class . ':apiKey']);

    Route::get('configs', [Controllers\ConfigController::class, 'index'])->name('configs.index')->middleware([SearchableIndex::class . ':Config']);
    Route::resource('configs', Controllers\ConfigController::class)->except(['index', 'show']);
    Route::get('configs/{config}', [Controllers\ConfigController::class, 'show'])->name('configs.show')->middleware([ResourceGetter::class . ':config']);

    Route::get('credit-packages', [Controllers\CreditPackageController::class, 'index'])->name('credit-packages.index')->middleware([SearchableIndex::class . ':creditPackage']);
    Route::resource('credit-packages', Controllers\CreditPackageController::class)->except(['index', 'show']);
    Route::get('credit-packages/{creditPackage}', [Controllers\CreditPackageController::class, 'show'])->name('credit-packages.show')->middleware([ResourceGetter::class . ':creditPackage']);

    Route::get('credit-transactions', [Controllers\CreditTransactionController::class, 'index'])->name('credit-transactions.index')->middleware(Locale::class);
    Route::get('credit-transactions/{creditTransaction}', [Controllers\CreditTransactionController::class, 'show'])->name('credit-transactions.show')->middleware(Locale::class);
    Route::get('credit-transactions-balance', [Controllers\CreditTransactionController::class, 'getBalance'])->name('credit-transactions.balance')->middleware(Locale::class);
    Route::post('credits/purchase/{creditPackage}', [Controllers\CreditTransactionController::class, 'purchase'])->name('credits.purchase');
    Route::post('credits/confirm-purchase', [Controllers\CreditTransactionController::class, 'confirmPurchase'])->name('credits.confirm-purchase');

    Route::get('/campaigns/{campaign}/emails/{email}/history', [Controllers\CampaignController::class, 'getEmailHistory'])
        ->name('campaigns.emails.history');

    Route::get('/campaigns/{campaign}/open-stats', [Controllers\CampaignController::class, 'getOpenStats'])->name('campaigns.open-stats');
    Route::get('/campaigns/{campaign}/opened-emails', [Controllers\CampaignController::class, 'getOpenedEmails'])->name('campaigns.opened-emails');
    Route::get('/campaigns/{campaign}/stats', [Controllers\CampaignController::class, 'getStats'])->name('campaigns.stats');
    // Route::post('/campaigns/{campaign}/emails/{email}/retry', [Controllers\CampaignController::class, 'retryEmail'])->name('campaigns.emails.retry');
    Route::post('/campaigns/{campaign}/emails/retry', [Controllers\CampaignController::class, 'retryEmails'])->name('campaigns.emails.retry');

    Route::get('/subscription/status', [Controllers\StripeController::class, 'checkSubscriptionStatus']);
    Route::get('/user/credits', [Controllers\StripeController::class, 'getUserCredits']);
    Route::post('/subscription/renewal/{subscriptionId}', [Controllers\StripeController::class, 'handleSubscriptionRenewal']);

});

Route::get('/email/track/{trackingId}', [Controllers\EmailTrackingController::class, 'track'])->name('email.track');

require __DIR__ . '/auth.php';
