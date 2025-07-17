<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Organization/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Organization/Create');
    }

    public function store(Request $request)
    {
        $fields = app(Organization::class)->getFillable();
        unset($fields['user_id']);

        $organization = Organization::create([
            ...$request->only($fields),
            'user_id' => $request->user()->id
        ]);

        $organization->settings()->create($request->get('settings', []));

        return response()->json(['message' => 'Organization created successfully']);
    }

    public function show(Organization $organization): Response
    {
        return Inertia::render('Organization/Show', [
            'organization' => new OrganizationResource($organization),
        ]);
    }

    public function edit(Request $request, Organization $organization): Response
    {
        return Inertia::render('Organization/Edit', [
            'organization' => new OrganizationResource($organization),
        ]);
    }

    public function update(Request $request, Organization $organization)
    {
        $fields = app(Organization::class)->getFillable();
        unset($fields['user_id']);

        $organization->fill($request->only($fields));

        $organization->save();

        $organization->settings()->updateOrCreate(
            ['organization_id' => $organization->id],
            $request->get('settings', [])
        );

        return response()->json(['message' => 'Organization updated successfully']);
    }

    public function destroy(Organization $organization)
    {
        $organization->delete();

        return response()->json(['message' => 'Organization deleted successfully']);
    }
}
