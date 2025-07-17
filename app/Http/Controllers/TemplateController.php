<?php

namespace App\Http\Controllers;

use App\Http\Resources\TemplateResource;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Template/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Template/Create');
    }

    public function store(Request $request)
    {
        Template::create($request->only(app(Template::class)->getFillable()));

        return response()->json(['message' => 'Template created successfully']);
    }

    public function show(Template $template): Response
    {
        return Inertia::render('Template/Show', [
            'template' => new TemplateResource($template),
        ]);
    }

    public function edit(Request $request, Template $template): Response
    {
        return Inertia::render('Template/Edit', [
            'templateData' => new TemplateResource($template),
        ]);
    }

    public function update(Request $request, Template $template)
    {
        $template->fill($request->only(app(Template::class)->getFillable()));

        $template->save();

        return response()->json(['message' => 'Template updated successfully']);
    }

    public function destroy(Template $template)
    {
        $template->delete();

        return response()->json(['message' => 'Template deleted successfully']);
    }
}
