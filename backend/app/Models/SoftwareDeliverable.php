<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoftwareDeliverable extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'github_repository_url',
        'google_drive_url',
        'onedrive_url',
        'environment_details',
        'submitted_by_user_id',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }
}
