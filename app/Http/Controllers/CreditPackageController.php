<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreditPackageRequest;
use App\Http\Resources\CreditPackageResource;
use App\Models\CreditPackage;
use App\Repositories\CreditPackageRepository;
use App\Services\CreditService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreditPackageController extends Controller
{
    protected $repository;

    public function __construct(CreditPackageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function index(Request $request)
    {
        if ($request->user()->role === 'admin' && !$request->wantsJson()) {
            return Inertia::render('CreditPackage/Index');
        }

        $creditPackages = $this->repository->getActive();
        
        if ($request->wantsJson()) {
            return response()->json([
                'data' => CreditPackageResource::collection($creditPackages)
            ]);
        }

        abort(403);
    }

    public function create(): Response
    {
        return Inertia::render('CreditPackage/Create');
    }

    public function store(CreditPackageRequest $request)
    {
        $this->repository->store($request->validated());

        return response()->json(['message' => __('messages.created_successfully')]);
    }

    public function show(CreditPackage $creditPackage): Response
    {
        return Inertia::render('CreditPackage/Show', [
            'creditPackage' => new CreditPackageResource($creditPackage),
        ]);
    }

    public function edit(Request $request, CreditPackage $creditPackage): Response
    {
        return Inertia::render('CreditPackage/Edit', [
            'creditPackage' => new CreditPackageResource($creditPackage),
        ]);
    }

    public function update(CreditPackageRequest $request, CreditPackage $creditPackage)
    {
        $this->repository->update($creditPackage, $request->validated());

        return response()->json(['message' => __('messages.updated_successfully')]);
    }

    public function destroy(CreditPackage $creditPackage)
    {
        $this->repository->delete($creditPackage);

        return response()->json(['message' => __('messages.deleted_successfully')]);
    }

    public function purchase(Request $request, CreditPackage $creditPackage)
    {
        $user = auth()->user();
        
        app(CreditService::class)->addPackageCredits(
            $user,
            $creditPackage,
            $creditPackage->credits,
            "Purchase of {$creditPackage->name} credit package"
        );
        
        return response()->json([
            'message' => __('messages.purchased_successfully'),
            'available_credits' => $user->available_credits
        ]);
    }
    public function history()
    {
        $user = auth()->user();
        $history = app(CreditService::class)->getCreditHistory($user);
        
        return response()->json([
            'history' => $history,
            'available_credits' => $user->available_credits,
            'subscription_credits' => $user->subscription_credits,
            'package_credits' => $user->package_credits
        ]);
    }
}