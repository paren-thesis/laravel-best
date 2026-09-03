<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\PeerEvaluation;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $teams = Team::with(['members', 'approvedTopic', 'supervision.supervisor', 'softwareDeliverable'])
            ->latest()
            ->get();

        return response()->json([
            'teams' => $teams
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'course_id' => 'required|exists:courses,id',
        ]);

        $currentYear = AcademicYear::where('is_current', true)->firstOrFail();

        $team = DB::transaction(function () use ($validated, $currentYear, $request) {
            $newTeam = Team::create([
                'name' => $validated['name'],
                'course_id' => $validated['course_id'],
                'academic_year_id' => $currentYear->id,
                'created_by_user_id' => $request->user()->id,
            ]);

            TeamMember::create([
                'team_id' => $newTeam->id,
                'user_id' => $request->user()->id,
                'role_in_team' => 'leader',
            ]);

            return $newTeam;
        });

        return response()->json([
            'message' => 'Team created successfully',
            'team' => $team->load('members')
        ], 201);
    }

    public function autoGroup(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'max_members' => 'nullable|integer|min:2|max:5',
        ]);

        $maxMembers = $validated['max_members'] ?? 4;
        $currentYear = AcademicYear::where('is_current', true)->firstOrFail();

        // Get unassigned students with student role
        $unassignedStudents = User::role('student')
            ->whereDoesntHave('teams')
            ->get();

        if ($unassignedStudents->isEmpty()) {
            return response()->json([
                'message' => 'No unassigned students available for auto-grouping.'
            ], 422);
        }

        $createdTeams = [];

        DB::transaction(function () use ($unassignedStudents, $maxMembers, $validated, $currentYear, &$createdTeams) {
            $chunks = $unassignedStudents->chunk($maxMembers);
            $groupIndex = 1;

            foreach ($chunks as $chunk) {
                $team = Team::create([
                    'name' => "Auto Group {$groupIndex}",
                    'course_id' => $validated['course_id'],
                    'academic_year_id' => $currentYear->id,
                    'max_members' => $maxMembers,
                ]);

                $isLeader = true;
                foreach ($chunk as $student) {
                    TeamMember::create([
                        'team_id' => $team->id,
                        'user_id' => $student->id,
                        'role_in_team' => $isLeader ? 'leader' : 'member',
                    ]);
                    $isLeader = false;
                }

                $createdTeams[] = $team->load('members');
                $groupIndex++;
            }
        });

        return response()->json([
            'message' => 'Auto-grouping completed successfully',
            'teams_created' => count($createdTeams),
            'teams' => $createdTeams
        ]);
    }

    public function submitPeerEvaluation(Request $request)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'evaluatee_id' => 'required|exists:users,id',
            'score' => 'required|integer|min:1|max:10',
            'comments' => 'nullable|string',
        ]);

        $evaluatorId = $request->user()->id;

        if ($evaluatorId == $validated['evaluatee_id']) {
            return response()->json(['message' => 'You cannot evaluate yourself.'], 422);
        }

        $evaluation = PeerEvaluation::updateOrCreate(
            [
                'team_id' => $validated['team_id'],
                'evaluator_id' => $evaluatorId,
                'evaluatee_id' => $validated['evaluatee_id'],
            ],
            [
                'score' => $validated['score'],
                'comments' => $validated['comments'] ?? null,
                'submitted_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Peer evaluation submitted successfully',
            'evaluation' => $evaluation
        ]);
    }
}
