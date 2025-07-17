<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriberResource;
use App\Models\Subscriber;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Lang;
use Inertia\Inertia;
use Inertia\Response;

class SubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Subscriber/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Subscriber/Create');
    }

    public function store(Request $request)
    {
        // check if there's any subscriber with the same email in the organization
        if (Subscriber::query()
            ->where('email', $request->get('email'))
            ->where('organization_id', $request->get('organization_id'))
            ->exists()
        ) {
            return response()->json(['message' => Lang::get('messages.existing_email_of_subscriber_in_organization')], 400);
        }

        $subscriber = Subscriber::create($request->only(app(Subscriber::class)->getFillable()));

        $subscriber->tags()->sync($request->get('tag_ids', []));

        return response()->json(['message' => 'Subscriber created successfully']);
    }

    public function show(Subscriber $subscriber): Response
    {
        return Inertia::render('Subscriber/Show', [
            'subscriber' => new SubscriberResource($subscriber),
        ]);
    }

    public function edit(Request $request, Subscriber $subscriber): Response
    {
        return Inertia::render('Subscriber/Edit', [
            'subscriber' => new SubscriberResource($subscriber),
        ]);
    }

    public function update(Request $request, Subscriber $subscriber)
    {
        // check if there's any subscriber with the same email in the organization
        if (Subscriber::query()
            ->where('email', $request->get('email'))
            ->where('organization_id', $request->get('organization_id'))
            ->where('id', '!=', $subscriber->id)
            ->exists()
        ) {
            return response()->json(['message' => 'Subscriber with the same email already exists in this organization'], 400);
        }

        $subscriber->fill($request->only(app(Subscriber::class)->getFillable()));

        $subscriber->save();

        // ##
        // Tags
        if ($request->has('tag_ids')) {
            $tags = $request->get('tag_ids', []);
            $existingTags = $subscriber->tags->pluck('id')->toArray();
            $removeTags = array_diff($existingTags, $tags);

            $subscriber->tags()->sync($tags);
            $subscriber->refresh();

            $this->handleRemoveTags($subscriber, $existingTags, $removeTags);
        }

        return response()->json(['message' => 'Subscriber updated successfully']);
    }

    public function destroy(Subscriber $subscriber)
    {
        $subscriber->delete();

        return response()->json(['message' => 'Subscriber deleted successfully']);
    }

    public function unsubscribe(string $token)
    {
        $locale = request()->getPreferredLanguage(['en', 'it']);
        App::setLocale($locale);
        try {
            $decryptedId = Crypt::decryptString($token);
        } catch (DecryptException $e) {
            return response()->view('unsubscribe.error', [
                'message' => Lang::get('messages.unsubscribe_error_message')
            ], 404);
        }
        $subscriber = Subscriber::withoutGlobalScopes()->find($decryptedId);
        if (!$subscriber) {
            return response()->view('unsubscribe.error', [
                'message' => Lang::get('messages.unsubscribe_error')
            ], 404);
        }

        $subscriber->update([
            'is_subscribed' => false
        ]);

        return view('unsubscribe.success', [
            'message' => Lang::get('messages.unsubscribe_success')
        ]);
    }


    public function handleRemoveTags(Subscriber $subscriber, array $existingTags, array $removeTags)
    {
        foreach ($subscriber->campaigns as $campaign) {
            $campaignTags = $campaign->campaign->tags->pluck('id')->toArray();
            $removed = array_intersect($removeTags, $campaignTags);
            $stillExisting = array_intersect($existingTags, $campaignTags);
            if ($removed && !$stillExisting) {
                $campaign->emails()->where('sent', false)->delete();
            }
        }
    }
}
