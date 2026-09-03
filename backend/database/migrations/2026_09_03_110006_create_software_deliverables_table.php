<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('software_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('github_repository_url')->nullable();
            $table->string('google_drive_url')->nullable();
            $table->string('onedrive_url')->nullable();
            $table->text('environment_details')->nullable(); // instructions/credentials for testing environment
            $table->foreignId('submitted_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('software_deliverables');
    }
};
