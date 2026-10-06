<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\DefensePanel;
use App\Models\Evaluation;
use App\Models\Rubric;
use App\Models\RubricCriteria;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DefenseController extends Controller
{
    public function panels(Request $request)
    {
        $panels = DefensePanel::with(['members', 'academicYear'])->latest()->get();
        $rubrics = Rubric::with('criteria')->where('is_active', true)->get();

        return response()->json([
            'panels' => $panels,
            'rubrics' => $rubrics
        ]);
    }

    public function storeRubric(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'criteria' => 'required|array|min:1',
            'criteria.*.title' => 'required|string',
            'criteria.*.max_points' => 'required|integer|min:1',
        ]);

        $rubric = DB::transaction(function () use ($validated) {
            $newRubric = Rubric::create([
                'title' => $validated['title'],
                'max_score' => array_sum(array_column($validated['criteria'], 'max_points')),
                'is_active' => true,
            ]);

            foreach ($validated['criteria'] as $c) {
                RubricCriteria::create([
                    'rubric_id' => $newRubric->id,
                    'title' => $c['title'],
                    'max_points' => $c['max_points'],
                ]);
            }

            return $newRubric->load('criteria');
        });

        AuditLogger::log(
            'rubric.created',
            "Evaluation rubric '{$rubric->title}' created with max score {$rubric->max_score}.",
            $rubric,
            ['title' => $rubric->title, 'max_score' => $rubric->max_score, 'criteria_count' => count($validated['criteria'])]
        );

        return response()->json([
            'message' => 'Rubric created successfully',
            'rubric' => $rubric
        ], 201);
    }

    public function evaluate(Request $request)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'panel_id' => 'required|exists:defense_panels,id',
            'rubric_id' => 'required|exists:rubrics,id',
            'scores' => 'required|array|min:1',
            'scores.*.criteria_id' => 'required|exists:rubric_criteria,id',
            'scores.*.score' => 'required|integer|min:0',
            'scores.*.comments' => 'nullable|string',
        ]);

        $evaluatorId = $request->user()->id;
        $evaluations = [];

        DB::transaction(function () use ($validated, $evaluatorId, &$evaluations) {
            foreach ($validated['scores'] as $item) {
                $eval = Evaluation::updateOrCreate(
                    [
                        'team_id' => $validated['team_id'],
                        'evaluator_id' => $evaluatorId,
                        'rubric_criteria_id' => $item['criteria_id'],
                    ],
                    [
                        'panel_id' => $validated['panel_id'],
                        'rubric_id' => $validated['rubric_id'],
                        'score' => $item['score'],
                        'comments' => $item['comments'] ?? null,
                    ]
                );
                $evaluations[] = $eval;
            }
        });

        $totalScore = array_sum(array_column($validated['scores'], 'score'));

        AuditLogger::log(
            'defense.evaluated',
            "Defense evaluation scored for team #{$validated['team_id']} by {$request->user()->name} (Total score: {$totalScore}).",
            null,
            ['team_id' => $validated['team_id'], 'panel_id' => $validated['panel_id'], 'total_score' => $totalScore]
        );

        return response()->json([
            'message' => 'Defense evaluation submitted successfully',
            'evaluations' => $evaluations
        ]);
    }
}
