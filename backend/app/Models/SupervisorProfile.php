<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupervisorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'max_team_capacity',
        'current_team_count',
        'research_interests',
    ];

    protected $casts = [
        'research_interests' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
