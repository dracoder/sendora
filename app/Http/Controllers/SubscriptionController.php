<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionResource;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }
        return Inertia::render('Subscription/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Subscription/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $fields = app(Subscription::class)->getFillable();

        Subscription::create($request->only($fields));

        return response()->json(['message' => 'Subscription created successfully']);
    }

    public function show(Subscription $subscription): Response
    {
        return Inertia::render('Subscription/Show', [
            'subscription' => new SubscriptionResource($subscription),
        ]);
    }

    public function edit(Request $request, Subscription $subscription): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Subscription/Edit', [
            'subscription' => new SubscriptionResource($subscription),
        ]);
    }

    public function update(Request $request, Subscription $subscription)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $fields = app(Subscription::class)->getFillable();

        $subscription->fill($request->only($fields));

        $subscription->save();

        return response()->json(['message' => 'Subscription updated successfully']);
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return response()->json(['message' => 'Subscription deleted successfully']);
    }
}
