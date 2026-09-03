<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Supervision;
use App\Models\SupervisorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupervisionController extends Controller
{
    public function index(Request $request)
    {
        $supervisors = User::role('supervisor')
            ->with(['supervisorProfile', 'profile'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'capacity' => $user->supervisorProfile?->max_team_capacity ?? 5,
                    'assigned_count' => Supervision::where('supervisor_id', $user->id)->count(),
                    'research_interests' => $user->supervisorProfile?->research_interests ?? [],
                ];
            });

        $supervisions = Supervision::with(['team.members', 'supervisor', 'team.approvedTopic'])->get();

        return response()->json([
            'supervisors' => $supervisors,
            'supervisions' => $supervisions
        ]);
    }

    public function assign(Request $request)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'supervisor_id' => 'required|exists:users,id',
        ]);

        $supervisor = User::findOrFail($validated['supervisor_id']);
        $supervisorProfile = SupervisorProfile::firstOrCreate(
            ['user_id' => $supervisor->id],
            ['max_team_capacity' => 5]
        );

        $currentCount = Supervision::where('supervisor_id', $supervisor->id)->count();

        if ($currentCount >= $supervisorProfile->max_team_capacity) {
            return response()->json([
                'message' => "Supervisor {$supervisor->name} has reached maximum capacity of {$supervisorProfile->max_team_capacity} teams."
            ], 422);
        }

        $currentYear = AcademicYear::where('is_current', true)->firstOrFail();

        $supervision = Supervision::updateOrCreate(
            [
                'team_id' => $validated['team_id'],
                'academic_year_id' => $currentYear->id,
            ],
            [
                'supervisor_id' => $supervisor->id,
                'status' => 'assigned',
                'assigned_by_user_id' => $request->user()->id,
            ]
        );

        // Update supervisor current count
        $supervisorProfile->update([
            'current_team_count' => Supervision::where('supervisor_id', $supervisor->id)->count()
        ]);

        return response()->json([
            'message' => "Team assigned to supervisor {$supervisor->name} successfully",
            'supervision' => $supervision->load(['team', 'supervisor'])
        ]);
    }
}
