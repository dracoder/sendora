<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConfigResource;
use App\Models\Config;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfigController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Config/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Config/Create');
    }

    public function store(ConfigRequest $request)
    {
        $fields = app(Config::class)->getFillable();

        Config::create($request->only($fields));

        return response()->json(['message' => 'Config created successfully']);
    }

    public function show(Config $config): Response
    {
        return Inertia::render('Config/Show', [
            'config' => new ConfigResource($config),
        ]);
    }

    public function edit(Request $request, Config $config): Response
    {
        return Inertia::render('Config/Edit', [
            'config' => new ConfigResource($config),
        ]);
    }

    public function update(ConfigRequest $request, Config $config)
    {
        $fields = app(Config::class)->getFillable();

        $config->fill($request->only($fields));

        $config->save();

        return response()->json(['message' => 'Config updated successfully']);
    }

    public function destroy(Config $config)
    {
        $config->delete();

        return response()->json(['message' => 'Config deleted successfully']);
    }
}
