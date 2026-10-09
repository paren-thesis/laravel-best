<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SoftwareDeliverable;
use App\Services\AuditLogger;
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

        AuditLogger::log(
            'deliverable.submitted',
            "Software deliverables submitted for team #{$validated['team_id']} by {$request->user()->name}.",
            $deliverable,
            ['team_id' => $validated['team_id'], 'github_url' => $validated['github_repository_url'] ?? null]
        );

        return response()->json([
            'message' => 'Software deliverables submitted successfully',
            'deliverable' => $deliverable
        ]);
    }
}
