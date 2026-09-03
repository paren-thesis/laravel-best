<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DefenseController;
use App\Http\Controllers\Api\DeliverableController;
use App\Http\Controllers\Api\SupervisionController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TopicController;
use Illuminate\Support\Facades\Route;

// Public Auth Endpoints
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected API v1 Endpoints
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth Status & Logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Topics & Proposals
    Route::get('/topics', [TopicController::class, 'index']);
    Route::post('/topics', [TopicController::class, 'store']);
    Route::patch('/topics/{topic}/review', [TopicController::class, 'review'])->middleware('role:coordinator|admin');

    // Teams & Auto Grouping
    Route::get('/teams', [TeamController::class, 'index']);
    Route::post('/teams', [TeamController::class, 'store']);
    Route::post('/teams/auto-group', [TeamController::class, 'autoGroup'])->middleware('role:coordinator|admin');
    Route::post('/teams/peer-evaluations', [TeamController::class, 'submitPeerEvaluation'])->middleware('role:student');

    // Supervision & Workload Allocation
    Route::get('/supervisions', [SupervisionController::class, 'index']);
    Route::post('/supervisions/assign', [SupervisionController::class, 'assign'])->middleware('role:coordinator|admin');

    // Defense & Evaluation Rubrics
    Route::get('/defense/panels', [DefenseController::class, 'panels']);
    Route::post('/defense/rubrics', [DefenseController::class, 'storeRubric'])->middleware('role:coordinator|admin');
    Route::post('/defense/evaluations', [DefenseController::class, 'evaluate'])->middleware('role:panel_member|coordinator|admin');

    // Software Deliverables
    Route::post('/deliverables', [DeliverableController::class, 'store']);
});
