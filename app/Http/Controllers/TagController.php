<?php

namespace App\Http\Controllers;

use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Tag/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Tag/Create');
    }

    public function store(Request $request)
    {
        $fields = app(Tag::class)->getFillable();
        unset($fields['user_id']);

        Tag::create([
            ...$request->only($fields),
            'user_id' => $request->user()->id
        ]);

        return response()->json(['message' => 'Tag created successfully']);
    }

    public function show(Tag $tag): Response
    {
        return Inertia::render('Tag/Show', [
            'tag' => new TagResource($tag),
        ]);
    }

    public function edit(Request $request, Tag $tag): Response
    {
        return Inertia::render('Tag/Edit', [
            'tag' => new TagResource($tag),
        ]);
    }

    public function update(Request $request, Tag $tag)
    {
        $fields = app(Tag::class)->getFillable();
        unset($fields['user_id']);

        $tag->fill($request->only($fields));

        $tag->save();

        return response()->json(['message' => 'Tag updated successfully']);
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
