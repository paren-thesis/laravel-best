<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    public function index(Request $request)
    {
        $query = Topic::with(['team.members', 'reviewer']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('team_id')) {
            $query->where('team_id', $request->team_id);
        }

        return response()->json([
            'topics' => $query->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'problem_statement' => 'required|string',
            'proposed_solution' => 'required|string',
            'tech_stack' => 'nullable|array',
        ]);

        $topic = Topic::create([
            'team_id' => $validated['team_id'],
            'title' => $validated['title'],
            'abstract' => $validated['abstract'],
            'problem_statement' => $validated['problem_statement'],
            'proposed_solution' => $validated['proposed_solution'],
            'tech_stack' => $validated['tech_stack'] ?? [],
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Project proposal submitted successfully',
            'topic' => $topic->load('team')
        ], 201);
    }

    public function review(Request $request, Topic $topic)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,revision_requested',
            'review_notes' => 'nullable|string',
        ]);

        $topic->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_at' => now(),
            'reviewed_by_user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => "Topic marked as {$validated['status']}",
            'topic' => $topic->load('reviewer')
        ]);
    }
}
