<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('max_team_capacity')->default(5);
            $table->unsignedInteger('current_team_count')->default(0);
            $table->json('research_interests')->nullable();
            $table->timestamps();
        });

        Schema::create('supervisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supervisor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['assigned', 'active', 'completed'])->default('assigned');
            $table->foreignId('assigned_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['team_id', 'academic_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervisions');
        Schema::dropIfExists('supervisor_profiles');
    }
};
