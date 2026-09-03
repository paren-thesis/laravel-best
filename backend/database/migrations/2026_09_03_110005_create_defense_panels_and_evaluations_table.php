<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rubrics', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // e.g. "Final Defense Rubric 2026"
            $table->unsignedInteger('max_score')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('rubric_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rubric_id')->constrained()->cascadeOnDelete();
            $table->string('title'); // e.g. "Technical Demonstration"
            $table->text('description')->nullable();
            $table->unsignedInteger('max_points'); // e.g. 30
            $table->unsignedInteger('weight_percentage')->default(100);
            $table->timestamps();
        });

        Schema::create('defense_panels', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Panel A - Software Systems"
            $table->timestamp('scheduled_at')->nullable();
            $table->string('location')->nullable();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('defense_panel_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('panel_id')->constrained('defense_panels')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['chair', 'evaluator'])->default('evaluator');
            $table->timestamps();

            $table->unique(['panel_id', 'user_id']);
        });

        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('panel_id')->constrained('defense_panels')->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('rubric_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rubric_criteria_id')->constrained('rubric_criteria')->cascadeOnDelete();
            $table->unsignedInteger('score');
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->unique(['team_id', 'evaluator_id', 'rubric_criteria_id'], 'eval_team_evaluator_criteria_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
        Schema::dropIfExists('defense_panel_members');
        Schema::dropIfExists('defense_panels');
        Schema::dropIfExists('rubric_criteria');
        Schema::dropIfExists('rubrics');
    }
};
