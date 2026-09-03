<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SoftwareDeliverable;
use Illuminate\Http\Request;

class DeliverableController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'github_repository_url' => 'nullable|url',
            'google_drive_url' => 'nullable|url',
            'onedrive_url' => 'nullable|url',
            'environment_details' => 'nullable|string',
        ]);

        if (empty($validated['github_repository_url']) && empty($validated['google_drive_url']) && empty($validated['onedrive_url'])) {
            return response()->json([
                'message' => 'At least one repository or Drive URL must be provided.'
            ], 422);
        }

        $deliverable = SoftwareDeliverable::updateOrCreate(
            ['team_id' => $validated['team_id']],
            [
                'github_repository_url' => $validated['github_repository_url'] ?? null,
                'google_drive_url' => $validated['google_drive_url'] ?? null,
                'onedrive_url' => $validated['onedrive_url'] ?? null,
                'environment_details' => $validated['environment_details'] ?? null,
                'submitted_by_user_id' => $request->user()->id,
            ]
        );

        return response()->json([
            'message' => 'Software deliverables submitted successfully',
            'deliverable' => $deliverable
        ]);
    }
}
