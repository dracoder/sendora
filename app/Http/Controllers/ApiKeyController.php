<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiKeyRequest;
use App\Http\Resources\ApiKeyResource;
use App\Models\ApiKey;
use App\Repositories\ApiKeyRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('ApiKey/Index');
    }

    public function create(): Response
    {
        return Inertia::render('ApiKey/Create');
    }

    public function store(ApiKeyRequest $request)
    {
        $fields = app(ApiKey::class)->getFillable();
        unset($fields['user_id']);

        (new ApiKeyRepository(new ApiKey()))->store([
            ...$request->only($fields),
            'user_id' => $request->user()->id
        ]);

        return response()->json(['message' => 'Api Key created successfully']);
    }

    public function show(ApiKey $apiKey): Response
    {
        return Inertia::render('ApiKey/Show', [
            'apiKey' => new ApiKeyResource($apiKey),
        ]);
    }

    public function edit(Request $request, ApiKey $apiKey): Response
    {
        return Inertia::render('ApiKey/Edit', [
            'apiKey' => new ApiKeyResource($apiKey),
        ]);
    }

    public function update(ApiKeyRequest $request, ApiKey $apiKey)
    {
        $fields = app(ApiKey::class)->getFillable();
        unset($fields['user_id']);

        $apiKey->update($request->only($fields));

        return response()->json(['message' => 'Api Key updated successfully']);
    }

    public function destroy(ApiKey $apiKey)
    {
        $apiKey->delete();

        return response()->json(['message' => 'ApiKey deleted successfully']);
    }
}
